/* Read user-selected files in the browser. No requests, code execution or weights loading. */
(function(root,factory){
  if(typeof module==="object" && module.exports)module.exports=factory(require('./import-record.js'));
  else root.MLIPDirectory=factory(root.MLIPImport);
})(typeof globalThis!=="undefined" ? globalThis : this,function(Import){
  "use strict";
  var MAX_FILES=1000,MAX_FILE_BYTES=10*1024*1024,MAX_TOTAL_BYTES=32*1024*1024,MAX_ATOMS=5000;
  var symbols="X H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
  function object(value){return value!==null && typeof value==="object" && !Array.isArray(value);}
  function field(value,source,unit,status){return {value:value,status:status || "extracted",source:source,unit:unit || null,reason:null};}
  function missing(reason){return {value:null,status:"unavailable",source:"browser directory extraction",unit:null,reason:reason};}
  var aliases={
    model_id:["model","id"],checkpoint_id:["model","id"],hub_model_id:["model","id"],
    model_name:["model","name"],checkpoint_name:["model","name"],framework:["model","framework"],architecture_id:["model","architecture_id"],
    cutoff:["model","cutoff_radius"],r_max:["model","cutoff_radius"],cutoff_radius:["model","cutoff_radius"],parameter_count:["model","parameter_count"],
    epochs:["training","epochs"],max_epochs:["training","epochs"],max_num_epochs:["training","epochs"],optimizer:["training","optimizer"],
    learning_rate:["training","learning_rate"],batch_size:["training","batch_size"],loss:["training","loss"],loss_weights:["training","loss_weights"],
    train_file:["training","dataset_path"],train_data:["training","dataset_path"],train_count:["training","train_count"],test_count:["training","test_count"],
    reference_method:["training","reference_method"],reference_code:["training","reference_code"],functional:["training","functional"],
    ensemble:["simulation","ensemble"],timestep:["simulation","timestep"],timestep_fs:["simulation","timestep_fs","fs"],
    temperature:["simulation","temperature"],temperature_K:["simulation","temperature_K","K"],steps:["simulation","steps"],
    thermostat:["simulation","thermostat"],barostat:["simulation","barostat"],engine:["simulation","engine"],
    device:["environment","declared_device"],dtype:["environment","declared_dtype"],precision:["environment","declared_precision"],
    seed:["training","seed"],random_seed:["training","seed"]
  };
  function scalar(text){
    text=text.trim();
    if(!/^["']/.test(text))text=text.replace(/\s+#.*$/,"").trim();
    if(!text || /^[&*!>|]/.test(text))return undefined;
    if(/^null$|^none$|^~$/i.test(text))return undefined;
    if(/^true$|^false$/i.test(text))return text.toLowerCase()==="true";
    if(/^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(text)){var n=Number(text);return Number.isFinite(n) ? n : undefined;}
    if(text[0]==='"' || text[0]==='[' || text[0]==='{'){
      try{return JSON.parse(text);}catch(error){return undefined;}
    }
    if(text[0]==="'")return text.endsWith("'") ? text.slice(1,-1).replace(/''/g,"'") : undefined;
    return text.replace(/\s+#.*$/,"").trim() || undefined;
  }
  /* Basic XYZ / extXYZ species and Cartesian-position columns, first and last frame. */
  function xyz(text){
    var lines=text.split(/\r?\n/),index=0,first,last,frames=0;
    while(index<lines.length){
      while(index<lines.length && !lines[index].trim())index++;
      if(index===lines.length)break;
      if(!/^\d+$/.test(lines[index].trim()))throw new Error("Invalid XYZ atom count at line "+(index+1));
      var count=Number(lines[index++]);
      if(count<1 || count>MAX_ATOMS)throw new Error("XYZ frames support 1–"+MAX_ATOMS+" atoms");
      if(index+count>=lines.length)throw new Error("Truncated XYZ frame");
      var comment=lines[index++],properties=/\bProperties=(?:"([^"]+)"|([^\s]+))/.exec(comment),speciesOffset=0,posOffset=1,width=4;
      if(properties){
        var parts=(properties[1] || properties[2]).split(":"),offset=0;speciesOffset=posOffset=-1;
        if(parts.length%3)throw new Error("Unsupported extXYZ Properties descriptor");
        for(var p=0;p<parts.length;p+=3){
          var columns=Number(parts[p+2]);
          if(!Number.isSafeInteger(columns) || columns<1)throw new Error("Invalid extXYZ column count");
          if(parts[p]==="species" && columns===1)speciesOffset=offset;
          if(parts[p]==="pos" && columns===3)posOffset=offset;
          offset+=columns;
        }
        width=offset;
        if(speciesOffset<0 || posOffset<0)throw new Error("extXYZ needs species and pos columns");
      }
      var frame={number_of_atoms:count,atomic_numbers:[],positions:[]};
      for(var a=0;a<count;a++){
        var columns=lines[index++].trim().split(/\s+/),symbol=columns[speciesOffset],z=symbols.indexOf(symbol);
        var position=columns.slice(posOffset,posOffset+3).map(Number);
        if(columns.length<width || z<1 || position.length!==3 || !position.every(Number.isFinite))throw new Error("Invalid XYZ atom at line "+index);
        frame.atomic_numbers.push(z);frame.positions.push(position);
      }
      var lattice=/\bLattice="([^"]+)"/.exec(comment),pbc=/\bpbc="([^"]+)"/i.exec(comment);
      if(lattice){
        var cell=lattice[1].trim().split(/\s+/).map(Number);
        if(cell.length!==9 || !cell.every(Number.isFinite))throw new Error("Invalid extXYZ Lattice");
        frame.cell=[cell.slice(0,3),cell.slice(3,6),cell.slice(6,9)];
      }
      if(pbc){
        var flags=pbc[1].trim().split(/\s+/);
        if(flags.length!==3 || !flags.every(function(f){return /^(T|F|true|false|1|0)$/i.test(f);}))throw new Error("Invalid extXYZ PBC");
        frame.pbc=flags.map(function(f){return /^(T|true|1)$/i.test(f);});
      }
      frame.comment=comment;
      if(!first)first=frame;last=frame;frames++;
    }
    if(!frames)throw new Error("Empty XYZ file");
    return {initial:first,final:last,frames:frames};
  }
  async function extract(files,options){
    options=options || {};files=Array.from(files || []);
    if(!files.length)throw new Error("Select a calculation folder containing files.");
    if(files.length>MAX_FILES)throw new Error("Select one calculation folder with at most "+MAX_FILES+" files.");
    var cryptoProvider=options.crypto || globalThis.crypto;
    if(!cryptoProvider || !cryptoProvider.subtle || !cryptoProvider.randomUUID)throw new Error("Open the Hub over HTTPS or localhost to extract a folder.");
    var record={schema_version:Import.VERSION,run_id:cryptoProvider.randomUUID(),created_at:new Date().toISOString(),artifacts:[],warnings:[]};
    Import.SECTIONS.forEach(function(section){record[section]=Object.create(null);});
    ["id","name","framework","architecture_id","cutoff_radius","parameter_count"].forEach(function(key){record.model[key]=missing("Not found in supported saved files");});
    ["datasets","hyperparameters","reference_method","epochs","optimizer"].forEach(function(key){record.training[key]=missing("Not preserved in the scanned files");});
    record.reliability.accuracy=missing("Reference comparisons are not computed by folder extraction");
    record.reliability.uncertainty=missing("Uncertainty diagnostics are not computed by folder extraction");
    record.results.status=missing("Execution was not observed; a folder does not establish completion");
    record.environment.execution_hardware=missing("Browser hardware does not identify the machine used for this calculation");
    record.provenance.collector=field("Usefulness Boundary Hub browser extractor 0.1.0","Hub directory reader");
    record.provenance.mode=field("browser_directory_extraction","Hub directory reader");
    record.warnings.push("Saved-file extraction only: calculation code and model weights are not executed. Files stay in this browser until you explicitly upload the generated metadata.");
    var candidates=new Map(),inventory=[],cache=[],bytes=0,existing=[],geometries=0,observations=0;
    function cancelled(){if(options.cancelled && options.cancelled())throw new Error("Folder extraction cancelled");}
    function observe(section,key,value,source,unit,status){
      if(value==null)return;
      if(++observations>2048)throw new Error("Too many metadata fields; select a smaller calculation folder.");
      var f=field(value,source,unit,status),slot=section+"\0"+key;
      record[section]["file["+source+"]."+key]=f;
      if(!candidates.has(slot))candidates.set(slot,[]);
      candidates.get(slot).push(f);
    }
    function declaration(key,value,source,status,section){
      var mapped=Object.prototype.hasOwnProperty.call(aliases,key) ? aliases[key] : null;
      if(section && Import.SECTIONS.indexOf(section)>=0){
        var unit=null;
        if(object(value) && Object.prototype.hasOwnProperty.call(value,"value") && typeof value.unit==="string"){unit=value.unit;value=value.value;}
        observe(section,key,value,source+" (saved declaration)",unit,status);return;
      }
      if(mapped)observe(mapped[0],mapped[1],value,source+" (saved declaration)",mapped[2],status);
    }
    function jsonConfig(value,source){
      if(!object(value))return;
      Object.keys(value).forEach(function(key){
        if(Import.SECTIONS.indexOf(key)>=0 && object(value[key])){
          Object.keys(value[key]).forEach(function(name){declaration(name,value[key][name],source+"#"+key+"."+name,"extracted",key);});
        }else declaration(key,value[key],source+"#"+key,"extracted");
      });
    }
    function textConfig(text,source,notebook){
      /* Whitelisted scalar declarations only. YAML lists/anchors, expressions and code are not evaluated. */
      var section=null;
      text.split(/\r?\n/).slice(0,50000).forEach(function(line,index){
        var sectionMatch=/^\s*\[([a-z_]+)\]\s*$/.exec(line);
        if(sectionMatch){section=Import.SECTIONS.indexOf(sectionMatch[1])>=0 ? sectionMatch[1] : null;return;}
        var match=/^\s*([A-Za-z_][A-Za-z_0-9]*)\s*[:=]\s*(.+?)\s*$/.exec(line);
        if(!match)return;
        if(notebook && !/^(?:["']|[-+]?\d|[-+]?\.\d|true\s*$|false\s*$)/i.test(match[2]))return;
        var value=scalar(match[2]);
        if(notebook && typeof value==="string" && !/^["']/.test(match[2]))return;
        if(value!==undefined)declaration(match[1],value,source+":"+(index+1),notebook ? "inferred" : "extracted",section);
      });
    }
    /* Read only supported text files, within explicit memory limits. */
    for(var i=0;i<files.length;i++){
      cancelled();var file=files[i],path=file.webkitRelativePath || file.name;
      if(typeof path!=="string" || !path || path.split(/[\\/]/).some(function(p){return p==="..";}))throw new Error("Invalid relative file path");
      if(!Number.isSafeInteger(file.size) || file.size<0)throw new Error("Invalid file size");
      var entry={path:path,size_bytes:file.size,read:false,reader:null,reason:null};inventory.push(entry);
      if(/(?:^|\/)(?:\.git|node_modules|\.venv|__pycache__)(?:\/|$)/.test(path)){entry.reason="Development/cache directory";continue;}
      if(!/\.(json|ipynb|yaml|yml|toml|ini|cfg|log|out|txt|xyz|extxyz)$/i.test(path)){entry.reason="Unsupported file type; binary model/trajectory formats require the Python extractor";continue;}
      if(file.size>MAX_FILE_BYTES || bytes+file.size>MAX_TOTAL_BYTES){entry.reason="Reader size limit";continue;}
      if(options.onProgress)options.onProgress("Reading "+path);
      bytes+=file.size;
      var text;
      try{text=await file.text();}catch(error){entry.reason="Could not read file";record.warnings.push(path+": "+error.message);continue;}
      cancelled();
      if(text.includes("\0")){entry.reason="Binary content";continue;}
      var parsed;
      if(/\.(json|ipynb)$/i.test(path)){
        try{parsed=JSON.parse(text);}catch(error){entry.reason="Invalid JSON";record.warnings.push(path+": invalid JSON; skipped");continue;}
        if(object(parsed) && parsed.schema_version && parsed.run_id){
          try{Import.parseRecord(text);existing.push({record:parsed,recordJson:text,fileName:file.name,path:path});}
          catch(error){entry.reason="Invalid extractor record";record.warnings.push(path+": "+error.message);continue;}
        }
      }
      entry.read=true;entry.reader=/\.(xyz|extxyz)$/i.test(path) ? "xyz" : /\.ipynb$/i.test(path) ? "notebook" : parsed ? "json" : "scalar declarations";
      cache.push({text:text,parsed:parsed,path:path,file:file,entry:entry});
    }
    if(existing.length>1)throw new Error("This folder contains multiple extractor records. Select a single calculation folder or import one JSON record directly.");
    if(existing.length===1)return Object.assign(existing[0],{message:"Imported existing extractor record "+existing[0].path+" unchanged. Other files were not merged."});
    for(var j=0;j<cache.length;j++){
      cancelled();var item=cache[j],before=observations;
      try{
        if(item.entry.reader==="xyz"){
          var trajectory;
          try{trajectory=xyz(item.text);}catch(error){
            item.entry.read=false;item.entry.reason=error.message;
            record.warnings.push(item.path+": "+error.message+"; skipped");continue;
          }
          geometries++;
          ["initial","final"].forEach(function(which){
            Object.keys(trajectory[which]).forEach(function(key){observe("system",which+"."+key,trajectory[which][key],item.path+"#"+which,null);});
          });
          observe("simulation","saved_frame_count",trajectory.frames,item.path);
          record.warnings.push(item.path+": coordinate/cell units were not declared; no units or missing periodicity were assumed. The last saved frame does not establish run completion.");
        }else if(item.entry.reader==="notebook"){
          var notebook=item.parsed;
          if(!Array.isArray(notebook.cells))throw new Error("Invalid notebook cells");
          if(notebook.metadata && notebook.metadata.language_info)observe("environment","notebook_language",notebook.metadata.language_info,item.path+"#metadata.language_info");
          notebook.cells.forEach(function(cell,index){
            if(cell.cell_type==="code")textConfig(Array.isArray(cell.source) ? cell.source.join("") : String(cell.source || ""),item.path+"#cell"+index,true);
          });
          record.warnings.push(item.path+": notebook literals are inferred declarations; execution order, live objects and runtime results were not inspected.");
        }else if(item.entry.reader==="json")jsonConfig(item.parsed,item.path);
        else textConfig(item.text,item.path,false);
      }catch(error){
        /* Reader errors must not leave a half-imported file or canonical candidates. */
        throw new Error(item.path+": "+error.message);
      }
      item.entry.extracted_fields=observations-before;
      var digest=await cryptoProvider.subtle.digest("SHA-256",await item.file.arrayBuffer());
      record.artifacts.push({path:item.path,role:"input",sha256:Array.from(new Uint8Array(digest)).map(function(b){return b.toString(16).padStart(2,"0");}).join(""),size_bytes:item.file.size});
    }
    if(!observations)throw new Error("No supported metadata found. Try JSON configuration, scalar settings/logs, a saved notebook, or an XYZ/extXYZ structure; binary formats need the Python extractor.");
    candidates.forEach(function(values,slot){
      var split=slot.split("\0"),section=split[0],key=split[1];
      if(section==="provenance")return;
      if(section==="system" && geometries>1)return;
      var distinct=new Set(values.map(function(v){return JSON.stringify([v.value,v.unit]);}));
      if(distinct.size===1){
        var f=values[0];record[section][key]=field(f.value,values.map(function(v){return v.source;}).join("; "),f.unit,values.some(function(v){return v.status==="inferred";}) ? "inferred" : "extracted");
      }else{
        record[section][key]=missing("Conflicting saved declarations; see the file-specific fields");
        record.warnings.push(section+"."+key+": conflicting saved values were kept separately.");
      }
    });
    if(geometries>1)record.warnings.push("Multiple structure files found: initial/final structures are retained per file; no single calculation system was selected.");
    record.provenance.file_inventory=field(inventory,"Browser-selected relative file paths and sizes");
    record.provenance.reader_limits=field({max_files:MAX_FILES,max_file_bytes:MAX_FILE_BYTES,max_total_bytes:MAX_TOTAL_BYTES,max_atoms_per_frame:MAX_ATOMS},"Browser reader limits");
    var skipped=inventory.filter(function(f){return !f.read;}).length;
    if(skipped)record.warnings.push(skipped+" files skipped; see provenance.file_inventory for reasons.");
    var json=JSON.stringify(record,null,2)+"\n";
    Import.parseRecord(json);
    return {record:record,recordJson:json,fileName:"mliphub-directory-metadata.json",message:"Extracted metadata from "+inventory.filter(function(f){return f.read;}).length+" supported files in this browser. Review it before saving or uploading."};
  }
  return {extract:extract,MAX_FILES:MAX_FILES,MAX_FILE_BYTES:MAX_FILE_BYTES,MAX_TOTAL_BYTES:MAX_TOTAL_BYTES};
});
