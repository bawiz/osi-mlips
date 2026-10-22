/* One editable catalogue; generate the offline browser asset deterministically. */
const fs=require('node:fs'),path=require('node:path');
const directory=path.join(__dirname,'../app/community/data');
const catalog=JSON.parse(fs.readFileSync(path.join(directory,'catalog.json'),'utf8'));
const output='// Generated from catalog.json by npm run build:catalog. Do not edit.\nwindow.MLIP_CATALOG = '+JSON.stringify(catalog,null,2)+';\n';
if(process.argv.includes('--check')){
  if(fs.readFileSync(path.join(directory,'catalog.js'),'utf8')!==output){
    console.error('Catalogue asset is stale. Run npm run build:catalog.');process.exitCode=1;
  }
}else fs.writeFileSync(path.join(directory,'catalog.js'),output);
