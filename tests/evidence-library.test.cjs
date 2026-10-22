const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Import=require('../app/import-record.js'),Evidence=require('../app/evidence-library.js');
const records=JSON.parse(fs.readFileSync(path.join(__dirname,'../app/data/demo-records.json'),'utf8'));
const rows=records.map(r=>Evidence.indexRecord(r));
test('320 examples are real extractor-schema records with explicit synthetic provenance',()=>{
  assert.equal(records.length,320);assert.equal(rows.filter(r=>r.kind==='training').length,64);assert.equal(rows.filter(r=>r.kind==='usage').length,256);
  assert.equal(new Set(rows.map(r=>r.id)).size,8);assert.ok(rows.every(r=>r.synthetic));
  records.forEach(record=>assert.doesNotThrow(()=>Import.validateRecord(record)));
});
test('natural-language filters do not confuse CPU, the pronoun I or Kelvin with elements',()=>{
  const c=Evidence.parse('I need bulk Cu molecular dynamics on CPU at 300 K');
  assert.deepEqual(c.elements,['Cu']);assert.equal(c.task,'md');assert.equal(c.hardware,'cpu');assert.equal(c.tempMin,300);assert.equal(c.domain,'bulk');
  assert.equal(Evidence.parse('MD energies and forces for Cu').task,'md');
});
test('formulae, chemical names, ranges and follow-ups produce visible refinable constraints',()=>{
  let c=Evidence.parse('Liquid H₂O MD from 300–600 K');assert.deepEqual(c.elements,['H','O']);assert.equal(c.domain,'liquid');assert.equal(c.tempMax,600);
  c=Evidence.parse('on CPU with at least 10,000 atoms',c);assert.equal(c.atoms,10000);assert.equal(c.task,'md');assert.equal(c.hardware,'cpu');
  c=Evidence.parse('any temperature and any hardware',c);assert.equal(c.tempMin,undefined);assert.equal(c.hardware,undefined);
  assert.equal(Evidence.parse('silicon phonons on CPU').elements[0],'Si');
});
test('atom-count comparators keep their direction',()=>{
  assert.equal(Evidence.parse('under 500 atoms').atomsMax,500);assert.equal(Evidence.parse('exactly 64 atoms').atomsExact,64);
  assert.equal(Evidence.parse('10k atoms').atoms,10000);
});
test('known demo query returns only candidates supported by the same matching usage records',()=>{
  const c=Evidence.parse('Bulk Cu molecular dynamics on CPU at 300 K'),result=Evidence.recommend(rows,c);
  assert.deepEqual(result.candidates.map(x=>x.id).sort(),['demo-bulk-equi','demo-bulk-fast']);
  assert.ok(result.matched.every(r=>r.task==='md' && r.elements.includes('Cu') && r.hardware==='cpu' && r.temperature===300));
  for(let i=1;i<result.stages.length;i++)assert.ok(result.stages[i].count<=result.stages[i-1].count);
});
test('large-system and hardware constraints cannot be combined across incompatible runs',()=>{
  const result=Evidence.recommend(rows,Evidence.parse('Bulk Cu molecular dynamics on CPU at 600 K with 10,000 atoms'));
  assert.deepEqual(result.candidates.map(r=>r.id),['demo-bulk-fast']);
});
test('unsupported chemistry or temperatures leave an evidence gap instead of a guessed recommendation',()=>{
  assert.equal(Evidence.recommend(rows,Evidence.parse('UO2 MD at 2000 K')).candidates.length,0);
  assert.equal(Evidence.recommend(rows,Evidence.parse('Cu MD at 2000 K')).candidates.length,0);
  assert.ok(Evidence.recommend(rows,Evidence.parse('find me a good model')).needs.length);
});
test('training metadata and declared supported elements do not replace observed usage evidence',()=>{
  const train=rows.filter(r=>r.kind==='training');assert.equal(Evidence.recommend(train,Evidence.parse('Cu MD')).candidates.length,0);
  const r=structuredClone(records.find(r=>r.simulation.type.value==='md'));r.system['final.elements'].value=['Cu'];r.model.supported_elements.value=['Cu','U'];
  assert.equal(Evidence.recommend([Evidence.indexRecord(r)],Evidence.parse('U MD')).candidates.length,0);
});
test('missing task and hardware remain unknown and do not satisfy requirements',()=>{
  const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/extractor-record.json'),'utf8')),row=Evidence.indexRecord(raw);
  assert.equal(row.kind,'unknown');assert.equal(Evidence.recommend([row],Evidence.parse('H MD')).candidates.length,0);
  delete raw.environment.model_device;raw.simulation.type={value:'md',status:'user_provided',source:'test'};
  assert.equal(Evidence.recommend([Evidence.indexRecord(raw)],Evidence.parse('H MD on CPU')).candidates.length,0);
});
test('local/shared entries deduplicate, preserve exact original JSON and reject broken envelopes',()=>{
  const raw=JSON.stringify(records[0]),entry={recordType:'extractedRun',schemaVersion:'0.1.0',uploadId:'a'.repeat(64),recordJson:raw};
  const indexed=Evidence.indexEntries([entry,entry,{...entry,uploadId:'bad'}]);assert.equal(indexed.rows.length,1);assert.equal(indexed.rows[0].raw,raw);assert.equal(indexed.errors.length,1);
});
test('scores do not use arbitrary incomparable accuracy numbers',()=>{
  const c=Evidence.parse('Cu MD'),before=Evidence.recommend(rows,c).candidates.map(r=>r.id);
  const changed=records.map(r=>{const copy=structuredClone(r);if(copy.reliability.reference_comparison)copy.reliability.reference_comparison.value.force_mae=999;return Evidence.indexRecord(copy);});
  assert.deepEqual(Evidence.recommend(changed,c).candidates.map(r=>r.id),before);
});
test('pure-element requests do not silently accept oxide reports',()=>{
  const row=rows.find(r=>r.task==='md' && r.elements.includes('Si') && r.elements.includes('O'));
  assert.equal(Evidence.recommend([row],Evidence.parse('Si MD')).candidates.length,0);
  assert.equal(Evidence.recommend([row],Evidence.parse('MD containing Si')).candidates.length,1);
});
test('conflicting architectures or weight artifacts under one ID are excluded from ranking',()=>{
  const original=structuredClone(records.find(r=>r.simulation.type.value==='md' && r.system['final.elements'].value.length===1));
  const changed=structuredClone(original);changed.model.architecture_id.value='different-architecture';
  let result=Evidence.recommend([Evidence.indexRecord(original),Evidence.indexRecord(changed)],Evidence.parse('Cu MD'));
  assert.equal(result.candidates.length,0);assert.equal(result.identityConflicts.length,1);
  const a=structuredClone(original),b=structuredClone(original);
  a.artifacts=[{path:'a.model',role:'model',sha256:'a'.repeat(64),size_bytes:1}];b.artifacts=[{path:'b.model',role:'model',sha256:'b'.repeat(64),size_bytes:1}];
  result=Evidence.recommend([Evidence.indexRecord(a),Evidence.indexRecord(b)],Evidence.parse('Cu MD'));
  assert.equal(result.candidates.length,0);assert.equal(result.identityConflicts.length,1);
});
test('legacy Recorder run_type fields are indexed and reported failures never support candidates',()=>{
  const raw=structuredClone(records.find(r=>r.simulation.type.value==='md' && r.system['final.elements'].value[0]==='Cu'));
  raw.simulation.run_type=raw.simulation.type;delete raw.simulation.type;
  assert.equal(Evidence.indexRecord(raw).task,'md');
  raw.results.status.value='failed';const row=Evidence.indexRecord(raw);
  assert.equal(row.failed,true);assert.equal(Evidence.recommend([row],Evidence.parse('Cu MD')).candidates.length,0);
  assert.equal(rows.filter(r=>r.failed).length,16);
});
