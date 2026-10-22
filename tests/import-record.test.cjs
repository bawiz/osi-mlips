const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const Import=require('../app/import-record.js'), Store=require('../app/run-store.js');
const text=fs.readFileSync(path.join(__dirname,'fixtures/extractor-record.json'),'utf8');
const fixture=()=>JSON.parse(text), field=value=>({value,status:'extracted',source:'synthetic test'});
const catalogue=[
  {id:'mace-mp-0',name:'MACE-MP-0',architectureId:'mace'},
  {id:'mace-off23',name:'MACE-OFF23',architectureId:'mace'},
  {id:'chgnet-0.3.0',name:'CHGNet 0.3.0',architectureId:'chgnet'},
  {id:'mace-mp-0b',name:'MACE-MP-0b',architectureId:'mace',kind:'knownVariant'},
];
test('Python output validates and additional structured metadata survives',()=>{
  const raw=Import.parseRecord(text);assert.equal(raw.model.id.value,'mace-mp-0');
  assert.deepEqual(raw.system['final.info.extra_information'].value,{preserve:['all','fields']});
  assert.equal(Import.summarize(raw).atomCount,2);
});
test('malformed JSON, versions, and missing sections are rejected',()=>{
  assert.throws(()=>Import.parseRecord('not json'),/not valid JSON/);
  const raw=fixture();raw.schema_version='999';assert.throws(()=>Import.validateRecord(raw),/schema version/);
  const missing=fixture();delete missing.training;assert.throws(()=>Import.validateRecord(missing),/training/);
});
test('provenance statuses and unknown root fields are validated',()=>{
  for(const bad of [
    {value:1,status:'direct',source:'test'}, {value:1,status:'extracted',source:''},
    {value:null,status:'extracted',source:'test'},
    {value:1,status:'unavailable',source:'test',reason:'no'}, {value:null,status:'unavailable',source:'test'}
  ]){const raw=fixture();raw.model.bad=bad;assert.throws(()=>Import.validateRecord(raw));}
  const raw=fixture();raw.surprise={};assert.throws(()=>Import.validateRecord(raw),/unsupported field/);
});
test('non-finite numbers and invalid artifacts are rejected',()=>{
  const raw=fixture();raw.results.energy.value=Infinity;assert.throws(()=>Import.validateRecord(raw),/finite JSON/);
  const artifact=fixture();artifact.artifacts=[{path:'a',role:'model',sha256:'bad',size_bytes:1}];assert.throws(()=>Import.validateRecord(artifact),/artifact/);
});
test('exact checkpoint or variant matches; architecture alone never does',()=>{
  assert.equal(Import.resolveIdentity(fixture(),catalogue).modelId,'mace-mp-0');
  const raw=fixture();delete raw.model.id;assert.equal(Import.resolveIdentity(raw,catalogue).modelId,null);
  raw.model.name=field('MACE-MP-0b');assert.equal(Import.resolveIdentity(raw,catalogue).modelId,'mace-mp-0b');
});
test('legacy family fields are supported without treating class names as identities',()=>{
  const raw=fixture();delete raw.model.architecture_id;delete raw.model.id;
  assert.equal(Import.architecture(raw),'mace');assert.equal(Import.resolveIdentity(raw,catalogue).modelId,null);
});
test('conflicting declarations and committees remain unresolved',()=>{
  const conflict=fixture();conflict.model.name=field('MACE-OFF23');assert.equal(Import.resolveIdentity(conflict,catalogue).modelId,null);
  const committee=fixture();committee.model.member_count=field(2);assert.equal(Import.resolveIdentity(committee,catalogue).modelId,null);
});
test('registered hash identifies a checkpoint; filenames cannot',()=>{
  const raw=fixture();delete raw.model.id;raw.artifacts=[{path:'mace-mp-0.model',role:'model',sha256:'a'.repeat(64),size_bytes:1}];
  assert.equal(Import.resolveIdentity(raw,catalogue).modelId,null);
  const registry=catalogue.map(c=>({...c,sha256:c.id==='mace-mp-0'?['a'.repeat(64)]:[]}));
  assert.equal(Import.resolveIdentity(raw,registry).modelId,'mace-mp-0');
});
test('submission preserves original file and stays separate from curated claims',async()=>{
  const raw=fixture(),entry=await Import.createSubmission(raw,{catalogue,recordJson:text});
  assert.equal(entry.modelId,'mace-mp-0');assert.equal(entry.reviewStatus,'unreviewed');
  assert.equal(entry.recordJson,text);assert.equal(entry.recordType,'extractedRun');
  assert.match(entry.uploadId,/^[a-f0-9]{64}$/);assert.equal(typeof entry.createdAt,'number');
  assert.equal(entry.collectedAt,raw.created_at);assert.equal(entry.scopeGood,undefined);
});
test('unknown identity needs no typing; optional association checks family',async()=>{
  const raw=fixture();delete raw.model.id;
  assert.equal((await Import.createSubmission(raw,{catalogue})).modelId,null);
  const chosen=await Import.createSubmission(raw,{catalogue,modelId:'mace-mp-0'});assert.equal(chosen.associationMethod,'user_selected');
  await assert.rejects(()=>Import.createSubmission(raw,{catalogue,modelId:'chgnet-0.3.0'}),/different architecture/);
});
test('conflicting association and tampered preserved file are rejected',async()=>{
  await assert.rejects(()=>Import.createSubmission(fixture(),{catalogue,modelId:'mace-off23'}),/conflicts/);
  await assert.rejects(()=>Import.createSubmission(fixture(),{catalogue,recordJson:text.replace('synthetic-test-dataset','different')}),/differs/);
  const entry=await Import.createSubmission(fixture(),{catalogue,modelId:null});assert.equal(entry.modelId,null);assert.equal(entry.associationMethod,'user_unassigned');
});
test('shared writes use dedicated collection and preserve the raw file',async()=>{
  const entry=await Import.createSubmission(fixture(),{catalogue});let observed;
  const db={collection(name){assert.equal(name,'extractedRuns');return {async add(value){observed=value;}};}};
  await Store.saveShared(db,entry);assert.deepEqual(observed,entry);
  await assert.rejects(()=>Store.saveShared(null,entry),/not connected/);
  await assert.rejects(()=>Store.saveShared({collection(){return {add(){throw Error('storage error');}};}},entry),/storage error/);
});
test('shared subscription reads records and returns a disposer',()=>{
  let disposed=false,observed;
  const query={orderBy(k,dir){assert.equal(k,'createdAt');assert.equal(dir,'desc');return this;},limit(n){assert.equal(n,50);return this;},onSnapshot(fn){fn({docs:[{data:()=>({runId:'test'})}]});return ()=>{disposed=true;};}};
  const stop=Store.subscribeShared({collection:n=>{assert.equal(n,'extractedRuns');return query;}},items=>{observed=items;});
  assert.deepEqual(observed,[{runId:'test'}]);stop();assert.equal(disposed,true);
});
