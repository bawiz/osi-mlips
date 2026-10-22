/* Real browser integration. Shared persistence is mocked; no public data is written. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root=path.resolve(__dirname,'..'), raw=fs.readFileSync(path.join(__dirname,'fixtures/extractor-record.json'),'utf8');
const port=Number(process.env.MLIPHUB_TEST_PORT || 8765), base=`http://127.0.0.1:${port}`;
let browser;
async function serve(route){
  const url=new URL(route.request().url());
  if(url.origin!==base)return route.abort();
  const requested=decodeURIComponent(url.pathname),target=path.resolve(root,'app','.'+(requested==='/'?'/index.html':requested));
  if(!target.startsWith(path.join(root,'app')+path.sep))return route.fulfill({status:403,body:'Forbidden'});
  if(!fs.existsSync(target))return route.fulfill({status:404,body:'Not found'});
  const types={'.html':'text/html','.js':'application/javascript','.json':'application/json'};
  return route.fulfill({status:200,body:fs.readFileSync(target),contentType:types[path.extname(target)] || 'application/octet-stream'});
}
function expectText(page,selector,text){return page.waitForFunction(({selector,text})=>{const e=document.querySelector(selector);return e && e.textContent.includes(text);},{selector,text});}
function file(content=raw,name='metadata.json'){return {name,mimeType:'application/json',buffer:Buffer.from(content)};}
(async()=>{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,args:['--no-sandbox']});
  const context=await browser.newContext({acceptDownloads:true});
  await context.route('**/*',serve);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await page.getByLabel('Choose extractor JSON').setInputFiles(file());
  await expectText(page,'.upload-status','File validated');
  assert.equal(await page.getByLabel('Checkpoint association').inputValue(),'mace-mp-0');
  assert.equal(await page.getByRole('button',{name:'Upload to Hub',exact:true}).isDisabled(),true);
  await page.getByRole('button',{name:'Save in this browser',exact:true}).click();
  await expectText(page,'.upload-status','Saved in this browser');
  assert.equal(await page.locator('.uploaded-run').count(),1);
  await page.reload();await page.waitForSelector('.uploaded-run');
  await page.locator('.uploaded-run > summary').click();
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download original JSON',exact:true}).click();
  const downloaded=await downloadPromise;assert.equal(fs.readFileSync(await downloaded.path(),'utf8'),raw);
  await page.getByLabel('Choose extractor JSON').setInputFiles(file('{bad json'));
  await expectText(page,'.upload-status','not valid JSON');
  assert.equal(await page.locator('.upload-preview').count(),0);
  await page.goto(base+'/#mace-mp-0');await page.waitForSelector('.uploaded-run');
  await page.goto(base+'/#mace-off23');await page.waitForSelector('.uploads');
  await expectText(page,'.uploads','No calculation records uploaded here yet.');
  const malicious=JSON.parse(raw);malicious.model.id={value:null,status:'unavailable',source:'test',reason:'not known'};
  malicious.system['final.info.html']={value:'<img src=x onerror="window.injected=true">',status:'extracted',source:'test'};
  await page.getByLabel('Choose extractor JSON').setInputFiles(file(JSON.stringify(malicious)));
  await expectText(page,'.upload-status','File validated');
  assert.equal(await page.getByLabel('Checkpoint association').inputValue(),'');
  assert.equal(await page.evaluate(()=>window.injected || false),false);
  assert.equal(await page.locator('.uploads img').count(),0);
  await page.setViewportSize({width:390,height:844});
  await page.locator('.uploads').scrollIntoViewIfNeeded();
  fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
  await page.screenshot({path:path.join(root,'test-results/upload-mobile.png'),fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
  await context.close();

  const sharedContext=await browser.newContext();
  await sharedContext.route('**/*',serve);
  await sharedContext.addInitScript(()=>{
    window.testWrites=[];let callback;
    const db={collection(name){return {orderBy(){return this;},limit(){return this;},where(){return this;},
      onSnapshot(fn){if(name==='extractedRuns')callback=fn;fn({docs:[]});return ()=>{};},
      async add(value){if(name!=='extractedRuns')throw Error('Wrong collection');if(window.rejectUpload)throw Error('test upload failure');window.testWrites.push(value);if(callback)callback({docs:window.testWrites.map(x=>({data:()=>x}))});}};}};
    window.claude={use:async capability=>capability==='db'?db:null};
  });
  const shared=await sharedContext.newPage();shared.on('pageerror',e=>errors.push(e.message));
  await shared.goto(base);await shared.getByLabel('Choose extractor JSON').setInputFiles(file());
  await expectText(shared,'.upload-status','File validated');
  await shared.getByRole('button',{name:'Upload to Hub',exact:true}).click();
  await expectText(shared,'.upload-status','Uploaded to the Hub');
  const writes=await shared.evaluate(()=>window.testWrites);assert.equal(writes.length,1);assert.equal(writes[0].recordJson,raw);assert.equal(writes[0].reviewStatus,'unreviewed');
  await shared.getByLabel('Choose extractor JSON').setInputFiles(file());await expectText(shared,'.upload-status','File validated');
  await shared.evaluate(()=>window.rejectUpload=true);await shared.getByRole('button',{name:'Upload to Hub',exact:true}).click();
  await expectText(shared,'.upload-status','test upload failure');
  assert.equal(await shared.evaluate(()=>window.testWrites.length),1);
  await shared.getByRole('button',{name:'Save in this browser',exact:true}).click();await expectText(shared,'.upload-status','Saved in this browser');
  assert.deepEqual(errors,[]);await sharedContext.close();
  console.log('Browser checks passed: import, local persistence/reload, exact JSON download, identity matching, model-page filtering, malformed input, escaped content, mobile layout, shared upload, and storage failure recovery.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});
