/* Exercise native DOM/event contracts. This is not a substitute for browser QA. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Evidence=require('../app/evidence-library.js');
const records=JSON.parse(fs.readFileSync(path.join(__dirname,'../app/data/demo-records.json'),'utf8'));
class Element{
  constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.attrs={};this.style={};this.value='';this._text='';const names=new Set();this.classList={add:x=>names.add(x),remove:x=>names.delete(x)};}
  set textContent(x){this._text=String(x);this.children=[];}
  get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;this._text='';}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(k,fn){this.listeners[k]=fn;}
  async emit(k,event={preventDefault(){}}){if(this.listeners[k])await this.listeners[k](event);}
}
function all(root,fn){return (fn(root) ? [root] : []).concat(...root.children.map(x=>all(x,fn)));}
function find(root,fn){const n=all(root,fn)[0];assert.ok(n,'Expected UI element');return n;}
async function tick(){await new Promise(r=>setImmediate(r));}
async function setup({source='demo',local=[],fail=false}={}){
  const root=new Element('main'),writes=[],requests=[];let stopped=0;
  const window={MLIPEvidence:Evidence,MLIPRunStore:{listLocal:async()=>local,subscribeShared(db,fn){fn([]);return ()=>{stopped++;};}}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../app/discovery.js'),'utf8'),{window,document:{createElement:tag=>new Element(tag)},fetch:async url=>{requests.push(url);if(fail)throw Error('offline demo');return {ok:true,json:async()=>structuredClone(records)};},Blob,URL,setTimeout});
  const dispose=window.MLIPDiscovery.mount(root,{db:Promise.resolve({}),source});await tick();
  return {root,writes,requests,dispose,get stopped(){return stopped;}};
}
test('one chat filters the demo and updates candidate cards and visual evidence',async()=>{
  const app=await setup();assert.match(app.root.textContent,/SYNTHETIC DEMONSTRATION/);assert.match(app.root.textContent,/320/);
  const query=find(app.root,n=>n.attrs['aria-label']==='Describe your calculation');query.value='Bulk Cu molecular dynamics on CPU at 300 K';
  await find(app.root,n=>n.tag==='form').emit('submit');
  assert.equal(all(app.root,n=>n.className==='candidate-card').length,2);assert.match(app.root.textContent,/Found 2 candidate checkpoints/);
  assert.match(app.root.textContent,/How the filters narrow/);assert.match(app.root.textContent,/Reported task coverage/);assert.deepEqual(app.requests,['data/demo-records.json']);
  app.dispose();assert.equal(app.stopped,1);
});
test('uploaded records populate the contributed library without mixing in demo fixtures',async()=>{
  const record=structuredClone(records.find(r=>r.simulation.type.value==='md' && r.system['final.elements'].value[0]==='Cu'));
  record.model.id.value='custom-checkpoint';record.model.name.value='My contributed checkpoint';record.provenance.synthetic.value=false;
  const real={recordType:'extractedRun',schemaVersion:'0.1.0',uploadId:'a'.repeat(64),recordJson:JSON.stringify(record)};
  const synthetic={...real,uploadId:'b'.repeat(64),recordJson:JSON.stringify(records[0])};
  const app=await setup({source:'uploads',local:[real,synthetic]});
  assert.match(app.root.textContent,/My contributed checkpoint/);assert.doesNotMatch(app.root.textContent,/Demo Bulk Equivariant/);
  const query=find(app.root,n=>n.attrs['aria-label']==='Describe your calculation');query.value='Cu MD';await find(app.root,n=>n.tag==='form').emit('submit');
  assert.equal(all(app.root,n=>n.className==='candidate-card').length,1);assert.match(app.root.textContent,/unreviewed evidence/);
  const select=find(app.root,n=>n.attrs['aria-label']==='Evidence source');select.value='uploaded-demo';await select.emit('change');
  assert.match(app.root.textContent,/SYNTHETIC DEMONSTRATION/);assert.doesNotMatch(app.root.textContent,/My contributed checkpoint/);app.dispose();
});
test('unsupported requests expose gaps instead of keeping stale candidates',async()=>{
  const app=await setup(),query=find(app.root,n=>n.attrs['aria-label']==='Describe your calculation'),form=find(app.root,n=>n.tag==='form');
  query.value='Cu MD';await form.emit('submit');assert.ok(all(app.root,n=>n.className==='candidate-card').length);
  query.value='UO2 MD at 2000 K';await form.emit('submit');assert.equal(all(app.root,n=>n.className==='candidate-card').length,0);assert.match(app.root.textContent,/evidence gap/);app.dispose();
});
test('heatmap controls refine the task and searchable library',async()=>{
  const app=await setup();const cell=find(app.root,n=>n.attrs['aria-label']==='Demo Bulk CPU, Molecular dynamics, 8 records');
  await cell.emit('click');assert.equal(find(app.root,n=>n.attrs['aria-label']==='Search evidence records').value,'demo-bulk-fast');
  assert.match(app.root.textContent,/Task: md/);app.dispose();
});
test('a failed demo load leaves the interface usable and reports the error',async()=>{
  const app=await setup({fail:true});assert.match(app.root.textContent,/offline demo/);assert.equal(all(app.root,n=>n.className==='candidate-card').length,0);app.dispose();
});
