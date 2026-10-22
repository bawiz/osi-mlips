const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Shell=require('../app/workspace-shell.js');
const Contribution=require('../app/community/js/contribution-form.js');
const Import=require('../app/import-record.js');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/community/index.html'),'utf8');
const raw=fs.readFileSync(path.join(__dirname,'fixtures/extractor-record.json'),'utf8');
function form(){
  const dom={};
  for(const match of html.matchAll(/<(?:input|select|textarea)\b[^>]*\bid="(cf[^"]+)"/g))dom[match[1]]={value:''};
  return dom;
}
test('only explicit workspace routes select contribution views',()=>{
  for(const key of Object.keys(Shell.VIEWS))assert.equal(Shell.workspaceKey('workspace/'+key),key);
  for(const hash of ['', 'mace-mp-0','graph/mace-mp-0','workspace/__proto__','workspace/catalog/extra','uploads'])assert.equal(Shell.workspaceKey(hash),null);
});
test('main GUI returns and contribution iframe persists across tab changes',()=>{
  let creations=0;const calls=[],links=['hub','catalog','uq','knowledge','contribute','uploads'].map(key=>({attrs:{'data-section':key},getAttribute(k){return this.attrs[k];},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}}));
  const options={main:{},panel:{},title:{},description:{},nav:{querySelectorAll(){return links;}},host:{append(){}},createFrame(){creations++;return {addEventListener(){},contentWindow:{MLIPWorkspace:{show:key=>calls.push(key)}}};}};
  const shell=Shell.mount(options);
  assert.equal(shell.select('workspace/contribute'),true);assert.equal(options.main.hidden,true);
  assert.equal(links[4].attrs['aria-current'],'page');
  shell.select('workspace/uq');shell.select('mace-mp-0');
  assert.equal(options.main.hidden,false);assert.equal(options.panel.hidden,true);assert.equal(links[0].attrs['aria-current'],'page');
  shell.select('uploads');assert.equal(links[5].attrs['aria-current'],'page');
  shell.select('workspace/contribute');assert.equal(creations,1);assert.deepEqual(calls,['contribute','uq','contribute']);
});
test('a newly loading iframe receives the latest selected workspace on load',()=>{
  let loaded;const frame={contentWindow:{},addEventListener(event,fn){loaded=fn;}};
  const shell=Shell.mount({main:{},panel:{},title:{},description:{},nav:{querySelectorAll:()=>[]},host:{append(){}},createFrame:()=>frame});
  shell.select('workspace/catalog');shell.select('workspace/knowledge');
  let selected;frame.contentWindow.MLIPWorkspace={show:key=>{selected=key;}};loaded();
  assert.equal(selected,'knowledge');
});
test('empty draft never fabricates reference settings, counts, architecture or evidence',()=>{
  const result=Contribution.collect(form());
  assert.equal(result.pillarA_system.identity.num_atoms,null);
  assert.equal(result.pillarA_system.reference_method.code,null);assert.equal(result.pillarA_system.reference_method.functional,null);
  assert.equal(result.pillarB_model.family,null);assert.equal(result.pillarB_model.hyperparameters.cutoff_radius,null);
  assert.equal(result.pillarC_data.split_definition.train_count,null);assert.equal(result.pillarF_comparison.evidence_status,null);
  assert.equal(result.field_provenance.cfEquivariance.status,'unavailable');
});
test('export retains previously omitted fields and valid zero values',()=>{
  const dom=form();dom.cfSpaceGroup.value='Fm-3m';dom.cfCharge.value='0';dom.cfEpochs.value='42';dom.cfSeeds.value='1,2,3';dom.cfTestCount.value='0';
  const result=Contribution.collect(dom);
  assert.equal(result.pillarA_system.space_group,'Fm-3m');assert.equal(result.pillarA_system.charge,0);
  assert.equal(result.pillarD_calculation.epochs,42);assert.equal(result.pillarD_calculation.random_seeds,'1,2,3');assert.equal(result.pillarC_data.split_definition.test_count,0);
});
test('extractor import fills only compatible facts and preserves original JSON and provenance',()=>{
  const record=Import.parseRecord(raw),fields=Contribution.prefill(record),dom=form();
  Object.entries(fields).forEach(([id,field])=>{dom[id].value=field.value;});
  const result=Contribution.collect(dom,{raw,fields});
  assert.equal(result.pillarA_system.identity.num_atoms,2);assert.equal(result.pillarA_system.identity.periodicity,'none');
  assert.equal(result.pillarA_system.identity.formula,'H2');assert.deepEqual(result.pillarA_system.elements,['H']);
  assert.equal(result.pillarB_model.checkpoint_version,'mace-mp-0');assert.equal(result.pillarD_calculation.epochs,10);
  assert.equal(result.pillarF_comparison.metrics.force_mae,null);assert.equal(result.pillarF_comparison.evidence_status,null);
  assert.equal(result.extractor_record_json,raw);assert.equal(result.field_provenance.cfNumAtoms.status,'extracted');
  assert.equal(result.field_provenance.cfPeriodicity.status,'inferred');
  dom.cfNumAtoms.value='3';const edited=Contribution.collect(dom,{raw,fields});
  assert.equal(edited.field_provenance.cfNumAtoms.status,'user_provided');assert.equal(edited.extractor_record_json,raw);
});
test('cutoff with incompatible or absent units is retained in raw record without mislabelling',()=>{
  const record=JSON.parse(raw);record.model.cutoff_radius.unit='nm';
  assert.equal(Contribution.prefill(record).cfCutoff,undefined);
});
test('preview escaping renders imported or manually entered markup as text',()=>{
  assert.equal(Contribution.escapeHTML('<img src=x onerror="evil()">'), '&lt;img src=x onerror=&quot;evil()&quot;&gt;');
  assert.equal(Contribution.escapeHTML(null),'Unknown');
  const code=fs.readFileSync(path.join(root,'app/community/js/app.js'),'utf8');
  const preview=code.slice(code.indexOf('  function updateLivePreview()'),code.indexOf('  if (dom.previewCardBtn)'));
  assert.doesNotMatch(preview,/\$\{data\./);
});
test('browser catalogue and canonical JSON agree; alternate trials remain separately preserved',()=>{
  const sandbox={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'app/community/data/catalog.js'),'utf8'),sandbox);
  const canonical=JSON.parse(fs.readFileSync(path.join(root,'app/community/data/catalog.json'),'utf8'));
  assert.deepEqual(JSON.parse(JSON.stringify(sandbox.window.MLIP_CATALOG)),canonical);
  assert.equal(canonical.checkpoints.length,13);
  const archived=JSON.parse(fs.readFileSync(path.join(root,'app/community/data/archive/contribute-multi-epoch-catalog.json'),'utf8'));
  assert.ok(archived.checkpoints.find(cp=>cp.id==='blip-painn-ammonia').benchmarks.some(b=>b.dataset.includes('500 ep')));
});
test('all static entrypoint assets and inline scripts resolve after relocation',()=>{
  for(const entry of ['app/index.html','app/community/index.html']){
    const source=fs.readFileSync(path.join(root,entry),'utf8');
    for(const match of source.matchAll(/<(?:script|link|img|iframe)\b[^>]*?\b(?:src|href)="([^"]+)"/g)){
      const url=match[1].split(/[?#]/)[0];if(!url || /^(?:https?:|data:)/.test(url))continue;
      assert.ok(fs.existsSync(path.resolve(root,path.dirname(entry),url)),entry+': '+url);
    }
    for(const match of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(match[1],{filename:entry});
  }
});
