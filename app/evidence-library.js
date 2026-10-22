/* Structured retrieval from extractor records; no execution or untrusted text prompting. */
(function(root,factory){
  if(typeof module==="object" && module.exports)module.exports=factory(require('./import-record.js'));
  else root.MLIPEvidence=factory(root.MLIPImport);
})(typeof globalThis!=="undefined" ? globalThis : this,function(Import){
  "use strict";
  var symbols="X H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
  var tasks={md:"Molecular dynamics",single_point:"Single point",relaxation:"Relaxation",phonons:"Phonons",elastic:"Elastic properties",vibrations:"Molecular vibrations",diffusion:"Diffusion",adsorption:"Adsorption",training:"Training"};
  function value(r,s,k){return Import.value(r,s,k);}
  function finite(x){return typeof x==="number" && Number.isFinite(x) ? x : null;}
  function task(raw){
    var s=typeof raw==="string" ? raw.toLowerCase().replace(/[ -]/g,"_") : "";
    return {molecular_dynamics:"md",geometry_optimization:"relaxation",optimization:"relaxation",singlepoint:"single_point",train:"training"}[s] || s;
  }
  function indexRecord(record,context){
    Import.validateRecord(record);context=context || {};
    var id=value(record,"model","id"),elements=value(record,"system","final.elements"),numbers=value(record,"system","final.atomic_numbers");
    if(!Array.isArray(elements) && Array.isArray(numbers))elements=numbers.map(function(n){return symbols[n];});
    elements=Array.isArray(elements) ? Array.from(new Set(elements.filter(function(e){return symbols.indexOf(e)>0;}))).sort() : [];
    var reference=value(record,"training","reference_method"),device=value(record,"environment","model_device"),temperature=value(record,"simulation","temperature_K");
    if(temperature==null && (record.simulation.temperature || {}).unit==="K")temperature=value(record,"simulation","temperature");
    var runTask=task(value(record,"simulation","type") || value(record,"simulation","run_type")),kind=value(record,"provenance","record_kind"),outcome=value(record,"results","status");
    if(runTask==="unspecified")runTask="";
    if(typeof id!=="string" || !id.trim())id=typeof context.modelId==="string" ? context.modelId : null;
    return {
      key:context.key || record.run_id,id:id,name:value(record,"model","name") || id || "Unassigned checkpoint",
      architecture:value(record,"model","architecture_id") || value(record,"model","framework") || "Unknown",
      kind:kind==="training" || runTask==="training" ? "training" : runTask || kind==="usage" ? "usage" : "unknown",task:runTask,
      outcome:typeof outcome==="string" ? outcome : null,failed:typeof outcome==="string" && /^(failed|interrupted|cancelled|error)$/i.test(outcome),
      elements:elements,atoms:finite(value(record,"system","final.number_of_atoms")),
      domain:value(record,"system","class") || value(record,"system","final.info.system_class") || null,
      temperature:finite(temperature),hardware:typeof device==="string" ? /cuda|gpu|mps/i.test(device) ? "gpu" : /^cpu/i.test(device) ? "cpu" : null : null,
      functional:reference && typeof reference==="object" ? reference.functional || null : null,
      synthetic:value(record,"provenance","synthetic")===true || /^demo-/.test(id || ""),
      artifactSignature:record.artifacts.filter(function(a){return a.role==="model";}).map(function(a){return a.sha256;}).sort().join(":"),
      source:context.source || "record",record:record,raw:context.raw || JSON.stringify(record,null,2)+"\n"
    };
  }
  function indexEntries(entries){
    var rows=[],errors=[],seen=new Set();
    entries.forEach(function(entry){
      try{
        if(entry.recordType!=="extractedRun" || entry.schemaVersion!==Import.VERSION || !/^[a-f0-9]{64}$/.test(entry.uploadId || ""))throw new Error("Unsupported saved record envelope");
        if(seen.has(entry.uploadId))return;
        var record=Import.parseRecord(entry.recordJson);
        rows.push(indexRecord(record,{key:entry.uploadId,source:entry.librarySource || "Contributed upload",modelId:entry.modelId,raw:entry.recordJson}));
        seen.add(entry.uploadId);
      }catch(error){errors.push(error.message);}
    });
    return {rows:rows,errors:errors};
  }
  function parse(text,previous){
    var c=Object.assign({},previous || {}),lower=text.toLowerCase(),elements=new Set();
    var names={copper:["Cu"],aluminium:["Al"],aluminum:["Al"],iron:["Fe"],nickel:["Ni"],silicon:["Si"],germanium:["Ge"],carbon:["C"],hydrogen:["H"],oxygen:["O"],nitrogen:["N"],lithium:["Li"],sodium:["Na"],chlorine:["Cl"],platinum:["Pt"],water:["H","O"],ammonia:["N","H"],silica:["Si","O"],methane:["C","H"]};
    Object.keys(names).forEach(function(name){if(new RegExp("\\b"+name+"\\b").test(lower))names[name].forEach(function(e){elements.add(e);});});
    var ignored=new Set(["I","In","As","He","CPU","GPU","DFT","MD","NVT","NPT","ASE","UQ","MLIP","MLIPs","MACE","PBE","MAE","RMSE","JSON","HUB"]);
    var chemistryText=text.replace(/\d+(?:\.\d+)?\s*K\b/g,"");
    (chemistryText.replace(/[₀-₉]/g,function(n){return String("₀₁₂₃₄₅₆₇₈₉".indexOf(n));}).match(/\b(?:[A-Z][a-z]?\d*)+\b/g) || []).forEach(function(formula){
      if(ignored.has(formula))return;
      var tokens=formula.match(/[A-Z][a-z]?\d*/g) || [],found=tokens.map(function(t){return t.replace(/\d/g,"");});
      if(found.length && found.every(function(e){return symbols.indexOf(e)>0;}))found.forEach(function(e){elements.add(e);});
    });
    if(elements.size){c.elements=Array.from(elements).sort();c.elementMatch=/\b(?:including|containing)\b|at least these elements/.test(lower) ? "contains" : "exact";}
    var patterns=[[/\b(?:molecular dynamics|md)\b/,"md"],[/\b(?:single[ -]point|energy and forces)\b/,"single_point"],[/\b(?:relaxation|relax|optimisation|optimization|minimi[sz])/,"relaxation"],[/\bphonon/,"phonons"],[/\belastic/,"elastic"],[/\bvibration/,"vibrations"],[/\bdiffusion\b/,"diffusion"],[/\badsorption\b/,"adsorption"]];
    patterns.forEach(function(pair){if(pair[0].test(lower))c.task=pair[1];});
    if(/\b(?:molecular dynamics|md)\b/.test(lower) && c.task==="single_point")c.task="md";
    if(/\b(?:surface|slab)\b/.test(lower))c.domain="surface";
    else if(/\b(?:liquid|aqueous)\b/.test(lower))c.domain="liquid";
    else if(/\b(?:molecule|molecular system|isolated)\b/.test(lower))c.domain="molecule";
    else if(/\b(?:bulk|crystal|solid)\b/.test(lower))c.domain="bulk";
    if(/\bcpu\b|no gpu|without.*gpu/.test(lower))c.hardware="cpu";else if(/\bgpu\b|\bcuda\b/.test(lower))c.hardware="gpu";
    var count=/(\d+(?:\.\d+)?)\s*(k)?\s*atoms?\b/i.exec(text.replace(/,/g,""));
    if(count){
      delete c.atoms;delete c.atomsMax;delete c.atomsExact;
      var size=Number(count[1])*(count[2] ? 1000 : 1),prefix=text.replace(/,/g,"").slice(Math.max(0,count.index-24),count.index).toLowerCase();
      if(/(?:at most|up to|under|less than|max(?:imum)?)\s*$/.test(prefix))c.atomsMax=size;
      else if(/exactly\s*$/.test(prefix))c.atomsExact=size;
      else c.atoms=size;
    }
    var range=/(\d+(?:\.\d+)?)\s*(?:K\s*)?[-–]\s*(\d+(?:\.\d+)?)\s*K\b/i.exec(text);
    var temp=/(\d+(?:\.\d+)?)\s*K\b/.exec(text);
    if(range){c.tempMin=Math.min(Number(range[1]),Number(range[2]));c.tempMax=Math.max(Number(range[1]),Number(range[2]));}
    else if(temp)c.tempMin=c.tempMax=Number(temp[1]);
    var functional=/\b(r2SCAN|SCAN|PBE\+U|PBE)\b/i.exec(text);if(functional)c.functional=functional[1].toUpperCase();
    if(/any (?:temperature|temp)|remove temperature/.test(lower)){delete c.tempMin;delete c.tempMax;}
    if(/any hardware|either cpu or gpu/.test(lower))delete c.hardware;
    if(/any size|remove.*atom.*limit/.test(lower)){delete c.atoms;delete c.atomsMax;delete c.atomsExact;}
    if(/any (?:phase|domain)/.test(lower))delete c.domain;
    return c;
  }
  function recommend(rows,c){
    c=c || {};var needs=[];
    if(!c.elements || !c.elements.length)needs.push("chemical elements or a formula");
    if(!c.task)needs.push("calculation task, such as MD, relaxation or phonons");
    var usage=rows.filter(function(r){return r.kind==="usage" && r.id;}),identities=new Map();
    usage.forEach(function(r){if(!identities.has(r.id))identities.set(r.id,{architectures:new Set(),artifacts:new Set()});var i=identities.get(r.id);if(r.architecture!=="Unknown")i.architectures.add(String(r.architecture).toLowerCase());if(r.artifactSignature)i.artifacts.add(r.artifactSignature);});
    var identityConflicts=Array.from(identities.entries()).filter(function(pair){return pair[1].architectures.size>1 || pair[1].artifacts.size>1;}).map(function(pair){return pair[0];});
    var working=usage.filter(function(r){return !r.failed && !identityConflicts.includes(r.id);});
    var stages=[{label:"Usage records with checkpoint identity",count:usage.length},{label:"Exclude reported failures / identity conflicts",count:working.length}];
    var filters=[
      [c.elementMatch==="contains" ? "Reported elements contain requested set" : "Exact reported element set",c.elements && c.elements.length,function(r){return c.elements.every(function(e){return r.elements.includes(e);}) && (c.elementMatch==="contains" || c.elements.length===r.elements.length);}],
      ["System class",c.domain,function(r){return r.domain===c.domain;}],
      ["Calculation task",c.task,function(r){return r.task===c.task;}],
      ["Hardware",c.hardware,function(r){return r.hardware===c.hardware;}],
      ["Atom count ≥ "+c.atoms,c.atoms!=null,function(r){return r.atoms!==null && r.atoms>=c.atoms;}],
      ["Atom count ≤ "+c.atomsMax,c.atomsMax!=null,function(r){return r.atoms!==null && r.atoms<=c.atomsMax;}],
      ["Atom count = "+c.atomsExact,c.atomsExact!=null,function(r){return r.atoms===c.atomsExact;}],
      ["Reported temperature in requested interval",c.tempMin!=null,function(r){return r.temperature!==null && r.temperature>=c.tempMin && r.temperature<=c.tempMax;}],
      ["Reference functional",c.functional,function(r){return typeof r.functional==="string" && r.functional.toUpperCase()===c.functional;}]
    ];
    filters.forEach(function(f){if(f[1]){working=working.filter(f[2]);stages.push({label:f[0],count:working.length});}});
    var groups=new Map();
    working.forEach(function(r){
      if(!groups.has(r.id))groups.set(r.id,{id:r.id,name:r.name,architecture:r.architecture,rows:[],exactComposition:0});
      var g=groups.get(r.id);g.rows.push(r);
      if(c.elements && c.elements.length===r.elements.length)g.exactComposition++;
    });
    var candidates=Array.from(groups.values()).sort(function(a,b){return b.exactComposition-a.exactComposition || b.rows.length-a.rows.length || a.id.localeCompare(b.id);});
    return {needs:needs,stages:stages,matched:working,candidates:needs.length ? [] : candidates,identityConflicts:identityConflicts,
      excludedModels:new Set(usage.map(function(r){return r.id;})).size-candidates.length};
  }
  return {tasks:tasks,indexRecord:indexRecord,indexEntries:indexEntries,parse:parse,recommend:recommend};
});
