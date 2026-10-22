const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {webcrypto}=require('node:crypto');
const Directory=require('../app/directory-extractor.js'),Import=require('../app/import-record.js');
function file(name,text,extra={}){
  const bytes=Buffer.from(text);
  return {name:path.basename(name),webkitRelativePath:name,size:bytes.length,text:async()=>text,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),...extra};
}
function extract(files,options={}){return Directory.extract(files,{crypto:webcrypto,...options});}
const xyz='2\nfixture\nH 0 0 0\nH 0 0 .74\n';
test('no-install folder reader produces a valid upload record without inventing execution facts',async()=>{
  const result=await extract([file('run/config.json',JSON.stringify({model_id:'mace-mp-0',framework:'MACE',epochs:10})),file('run/structure.xyz',xyz)]);
  const record=Import.parseRecord(result.recordJson);
  assert.equal(record.model.id.value,'mace-mp-0');assert.equal(record.system['final.number_of_atoms'].value,2);
  assert.equal(record.training.epochs.value,10);assert.equal(record.results.status.status,'unavailable');
  assert.equal(record.system['final.positions'].unit,null);assert.equal(record.system['final.pbc'],undefined);
  assert.equal(record.environment.execution_hardware.status,'unavailable');assert.equal(record.reliability.accuracy.status,'unavailable');
  assert.equal(record.artifacts.length,2);assert.ok(record.artifacts.every(a=>/^[a-f0-9]{64}$/.test(a.sha256)));
  const entry=await Import.createSubmission(record,{recordJson:result.recordJson,crypto:webcrypto,catalogue:[{id:'mace-mp-0',name:'MACE-MP-0',architectureId:'mace'}]});
  assert.equal(entry.modelId,'mace-mp-0');assert.equal(entry.recordJson,result.recordJson);
});
test('conflicting settings remain file-specific and never select an arbitrary checkpoint',async()=>{
  const {record}=await extract([file('run/one.json','{"model_id":"mace-mp-0","epochs":10}'),file('run/two.json','{"model_id":"mace-off23","epochs":20}')]);
  assert.equal(record.model.id.status,'unavailable');assert.equal(record.training.epochs.status,'unavailable');
  assert.equal(Import.resolveIdentity(record,[{id:'mace-mp-0',name:'MACE-MP-0',architectureId:'mace'}]).modelId,null);
  assert.ok(Object.keys(record.training).some(key=>key.startsWith('file[') && record.training[key].value===20));
});
test('multiple structures retain independent systems rather than guessing which is the calculation',async()=>{
  const {record}=await extract([file('run/a.xyz',xyz),file('run/b.xyz',xyz.replace('.74','1.2'))]);
  assert.equal(record.system['final.positions'],undefined);assert.equal(record.system['final.number_of_atoms'],undefined);
  assert.match(record.warnings.join(' '),/Multiple structure files/);
});
test('extXYZ respects species/position column declarations and records explicit lattice/PBC',async()=>{
  const text='1\nProperties=pos:R:3:species:S:1 Lattice="1 2 3 4 5 6 7 8 9" pbc="T F T"\n0 0 0 O\n';
  const {record}=await extract([file('run/out.extxyz',text)]);
  assert.deepEqual(record.system['final.atomic_numbers'].value,[8]);assert.deepEqual(record.system['final.cell'].value,[[1,2,3],[4,5,6],[7,8,9]]);
  assert.deepEqual(record.system['final.pbc'].value,[true,false,true]);
});
test('XYZ trajectory stores first and last saved frame and does not call the run complete',async()=>{
  const {record}=await extract([file('run/md.xyz',xyz+xyz.replace('.74','1.2'))]);
  assert.equal(record.simulation.saved_frame_count.value,2);
  assert.equal(record.system['initial.positions'].value[1][2],.74);assert.equal(record.system['final.positions'].value[1][2],1.2);
  assert.equal(record.results.status.status,'unavailable');
});
test('notebook literals are inferred, expressions and output HTML are never executed or promoted',async()=>{
  const notebook={nbformat:4,metadata:{language_info:{name:'python',version:'3.12'}},cells:[{cell_type:'code',source:['model_id = "mace-mp-0"\n','epochs = 10\n','batch_size = do_something()\n'],outputs:[{data:{'text/html':'<script>bad()</script>'}}]}]};
  const {record}=await extract([file('run/calc.ipynb',JSON.stringify(notebook))]);
  assert.equal(record.model.id.status,'inferred');assert.equal(record.training.epochs.value,10);
  assert.equal(record.training.batch_size,undefined);assert.equal(record.results.energy,undefined);
  assert.equal(record.environment.notebook_language.value.version,'3.12');assert.ok(!JSON.stringify(record).includes('<script>'));
});
test('simple scalar configuration preserves zero, explicit units and unknown cutoff units',async()=>{
  const {record}=await extract([file('run/config.yaml','model_id: "example"\nepochs: 0 # no epochs run\ntimestep_fs: 0.5\ncutoff: 5\noptimizer: Adam\n')]);
  assert.equal(record.training.epochs.value,0);assert.equal(record.simulation.timestep_fs.unit,'fs');
  assert.equal(record.model.cutoff_radius.value,5);assert.equal(record.model.cutoff_radius.unit,null);
});
test('binary/large files are inventoried without reading; malformed files do not erase valid metadata',async()=>{
  const unread=async()=>{throw Error('Should never read');};
  const {record}=await extract([file('run/config.json','{"epochs":1}'),file('run/model.pt','binary',{text:unread}),file('run/too-big.json','',{size:Directory.MAX_FILE_BYTES+1,text:unread}),file('run/bad.json','{bad'),file('run/truncated.xyz','2\nmissing atoms')]);
  assert.equal(record.training.epochs.value,1);
  assert.equal(record.provenance.file_inventory.value.filter(f=>!f.read).length,4);
});
test('an existing extractor record is imported byte-for-byte; ambiguous records require selection',async()=>{
  const raw=fs.readFileSync(path.join(__dirname,'fixtures/extractor-record.json'),'utf8');
  const result=await extract([file('run/metadata.json',raw),file('run/config.json','{"epochs":100}')]);
  assert.equal(result.recordJson,raw);assert.match(result.message,/Other files were not merged/);
  await assert.rejects(extract([file('run/a.json',raw),file('run/b.json',raw)]),/multiple extractor records/);
});
test('cancellation, unsupported input and secure-origin failures never produce an upload record',async()=>{
  await assert.rejects(extract([]),/Select a calculation folder/);
  await assert.rejects(extract([file('run/model.pt','weights')]),/No supported metadata/);
  await assert.rejects(extract([file('run/config.json','{"epochs":1}')],{cancelled:()=>true}),/cancelled/);
  await assert.rejects(Directory.extract([file('run/config.json','{}')],{crypto:{}}),/HTTPS or localhost/);
});
test('untrusted prototype-like keys cannot replace generated extraction provenance',async()=>{
  const {record}=await extract([file('run/config.json','{"model":{"__proto__":{"a":1}},"provenance":{"mode":"fake"},"epochs":1}')]);
  assert.equal(record.provenance.mode.value,'browser_directory_extraction');assert.equal({}.a,undefined);
  assert.doesNotThrow(()=>Import.validateRecord(record));
});
test('checked-in demonstration folder generates metadata accepted by the upload contract',async()=>{
  const folder=path.join(__dirname,'../examples/browser-folder');
  const {recordJson}=await extract(fs.readdirSync(folder).map(name=>file('browser-folder/'+name,fs.readFileSync(path.join(folder,name),'utf8'))));
  assert.equal(Import.parseRecord(recordJson).model.id.value,'example-hydrogen-model');
});
