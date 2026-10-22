/* Unit-test upload events with a minimal DOM contract. This is not browser QA. */
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const Import=require('../app/import-record.js');
const raw=fs.readFileSync(path.join(__dirname,'fixtures/extractor-record.json'),'utf8');
class Element {
  constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.attrs={};this._text='';this.value='';this.disabled=false;const names=new Set();this.classList={add:k=>names.add(k),toggle:(k,on)=>on?names.add(k):names.delete(k)};}
  set textContent(value){this._text=String(value);this.children=[];}
  get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this._text='';this.children=nodes;}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(name,fn){this.listeners[name]=fn;}
  async emit(name){if(this.listeners[name])await this.listeners[name]();}
}
function all(root,predicate){let out=predicate(root)?[root]:[];root.children.forEach(x=>{out=out.concat(all(x,predicate));});return out;}
function find(root,predicate){const found=all(root,predicate);assert.ok(found.length,'Expected matching UI element');return found[0];}
async function tick(){await new Promise(r=>setImmediate(r));}
function setup({connected=false,fail=false}={}){
  const saved=[],shared=[],container=new Element('section');
  const store={async listLocal(){return [];},async saveLocal(x){saved.push(x);},async saveShared(db,x){assert.ok(db);if(fail)throw Error('storage failed');shared.push(x);},subscribeShared(){return ()=>{};}};
  const window={MLIPImport:Import,MLIPRunStore:store};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../app/uploads.js'),'utf8'),{window,document:{createElement:tag=>new Element(tag)},Blob,URL,setTimeout});
  const dispose=window.MLIPUploads.mount(container,{db:Promise.resolve(connected?{}:null),catalogue:Promise.resolve([{id:'mace-mp-0',name:'MACE-MP-0',architectureId:'mace'}])});
  const picker=find(container,x=>x.tag==='input');
  async function choose(text){picker.files=[{name:'metadata.json',size:Buffer.byteLength(text),text:async()=>text}];await picker.emit('change');await tick();}
  return {container,saved,shared,choose,dispose};
}
test('upload UI imports fields and persists the entire file without typing',async()=>{
  const app=setup();await tick();await app.choose(raw);
  assert.match(app.container.textContent,/Imported metadata/);assert.match(app.container.textContent,/Checkpoint ID/);
  assert.equal(find(app.container,x=>x.tag==='select').value,'mace-mp-0');
  assert.equal(find(app.container,x=>x.tag==='button'&&x.textContent==='Upload to Hub').disabled,true);
  await find(app.container,x=>x.tag==='button'&&x.textContent==='Save in this browser').emit('click');await tick();
  assert.equal(app.saved.length,1);assert.equal(app.saved[0].recordJson,raw);assert.equal(app.shared.length,0);
  assert.match(app.container.textContent,/Saved in this browser/);assert.match(app.container.textContent,/This browser · unreviewed/);app.dispose();
});
test('invalid input never enables persistence or loses previous records',async()=>{
  const app=setup();await tick();await app.choose('{bad');
  assert.match(app.container.textContent,/not valid JSON/);assert.equal(app.saved.length,0);
  assert.equal(all(app.container,x=>x.tag==='select').length,0);app.dispose();
});
test('shared upload failure remains visible and local recovery is available',async()=>{
  const app=setup({connected:true,fail:true});await tick();await app.choose(raw);
  await find(app.container,x=>x.tag==='button'&&x.textContent==='Upload to Hub').emit('click');await tick();
  assert.match(app.container.textContent,/Could not save: storage failed/);assert.equal(app.shared.length,0);
  await find(app.container,x=>x.tag==='button'&&x.textContent==='Save in this browser').emit('click');await tick();
  assert.equal(app.saved.length,1);app.dispose();
});
test('shared upload uses the same original metadata as the preview',async()=>{
  const app=setup({connected:true});await tick();await app.choose(raw);
  await find(app.container,x=>x.tag==='button'&&x.textContent==='Upload to Hub').emit('click');await tick();
  assert.equal(app.shared.length,1);assert.equal(app.shared[0].modelId,'mace-mp-0');assert.equal(app.shared[0].recordJson,raw);
  assert.match(app.container.textContent,/Shared Hub upload · unreviewed/);app.dispose();
});
test('unmount prevents a delayed file read from changing UI state',async()=>{
  const app=setup();await tick();app.dispose();await app.choose(raw);
  assert.equal(all(app.container,x=>x.tag==='select').length,0);assert.equal(app.saved.length,0);
});
