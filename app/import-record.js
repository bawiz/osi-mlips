/* Shared, dependency-free extractor upload contract. Also executable in Node tests. */
(function(root, factory){
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MLIPImport = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function(){
  "use strict";
  var VERSION = "0.1.0";
  var SECTIONS = ["model", "training", "system", "simulation", "environment", "results", "reliability", "provenance"];
  var STATUSES = ["extracted", "user_provided", "inferred", "unavailable"];
  var MAX_BYTES = 10 * 1024 * 1024;
  function object(x){ return x !== null && typeof x === "object" && !Array.isArray(x); }
  function own(x,k){ return Object.prototype.hasOwnProperty.call(x,k); }
  function fail(message){ throw new Error(message); }
  function keysOnly(x, allowed, path){
    Object.keys(x).forEach(function(k){ if (allowed.indexOf(k)<0) fail(path+": unsupported field "+k); });
  }
  function validateRecord(raw){
    if (!object(raw)) fail("The file must contain one extractor JSON record.");
    keysOnly(raw, ["schema_version","run_id","created_at","artifacts","warnings"].concat(SECTIONS), "Record");
    if (raw.schema_version !== VERSION) fail("Unsupported extractor schema version. Expected "+VERSION+".");
    if (typeof raw.run_id !== "string" || !raw.run_id.trim() || raw.run_id.length>200) fail("A nonempty run_id of at most 200 characters is required.");
    if (typeof raw.created_at !== "string" || !Number.isFinite(Date.parse(raw.created_at))) fail("A valid record creation timestamp is required.");
    var remaining = 500000;
    function json(x, depth){
      if (--remaining < 0 || depth>32) fail("Metadata exceeds the supported size or nesting limit.");
      if (x === null || typeof x === "string" || typeof x === "boolean") return;
      if (typeof x === "number" && Number.isFinite(x)) return;
      if (Array.isArray(x)){ x.forEach(function(v){ json(v,depth+1); }); return; }
      if (object(x)){ Object.keys(x).forEach(function(k){ json(x[k],depth+1); }); return; }
      fail("Metadata must contain finite JSON values.");
    }
    SECTIONS.forEach(function(section){
      if (!object(raw[section])) fail("Missing or invalid metadata section: "+section);
      Object.keys(raw[section]).forEach(function(key){
        var f = raw[section][key], path = section+"."+key;
        if (!object(f)) fail(path+": expected a provenance-bearing field.");
        keysOnly(f,["value","status","source","unit","reason"],path);
        if (STATUSES.indexOf(f.status)<0) fail(path+": invalid extraction status.");
        if (typeof f.source !== "string" || !f.source.length) fail(path+": source is required.");
        if (f.unit != null && typeof f.unit !== "string") fail(path+": unit must be text or null.");
        if (f.reason != null && typeof f.reason !== "string") fail(path+": reason must be text or null.");
        if (f.status === "unavailable"){
          if (f.value != null || !f.reason) fail(path+": unavailable values require null and an explanation.");
        } else if (f.value == null) fail(path+": a known value cannot be null.");
        if (own(f,"value")) json(f.value,0);
      });
    });
    if (!Array.isArray(raw.artifacts) || !Array.isArray(raw.warnings)) fail("artifacts and warnings must be arrays.");
    raw.warnings.forEach(function(w){ if (typeof w !== "string") fail("Warnings must be text."); });
    raw.artifacts.forEach(function(a){
      if (!object(a)) fail("Invalid artifact.");
      keysOnly(a,["path","role","sha256","size_bytes"],"Artifact");
      if (typeof a.path!=="string" || typeof a.role!=="string" || !/^[a-f0-9]{64}$/.test(a.sha256 || "") ||
          !Number.isSafeInteger(a.size_bytes) || a.size_bytes<0) fail("Invalid artifact path, role, checksum, or size.");
    });
    return raw;
  }
  function parseRecord(text){
    if (typeof text !== "string" || new TextEncoder().encode(text).length>MAX_BYTES) fail("Choose a JSON file no larger than 10 MiB.");
    var raw;
    try { raw=JSON.parse(text); } catch(e){ fail("The selected file is not valid JSON."); }
    return validateRecord(raw);
  }
  function value(record,section,key){
    var f=record[section] && record[section][key];
    return f && f.status!=="unavailable" ? f.value : null;
  }
  function slug(text){ return typeof text === "string" ? text.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") : ""; }
  function architecture(record){
    var explicit=value(record,"model","architecture_id");
    if (typeof explicit==="string" && explicit.trim()) return slug(explicit);
    var known=["mace","chgnet","nequip","allegro","sevennet","mtp"];
    var family=slug(value(record,"model","framework"));
    return known.indexOf(family)>=0 ? family : null;
  }
  function resolveIdentity(record,catalogue){
    var family=architecture(record), matches=new Map(), methods=new Set();
    if (Number(value(record,"model","member_count"))>1) return { modelId:null,architectureId:family,method:"unresolved",reason:"This record contains multiple model members. Their checkpoint identity needs explicit association." };
    var declarations=[];
    Object.keys(record.model).forEach(function(k){
      if (/^(id|name|checkpoint_id|checkpoint_name|model_id|model_name)$/.test(k) || /\.(checkpoint_id|checkpoint_name|hub_model_id|model_id|model_name)$/.test(k)){
        var v=value(record,"model",k); if (typeof v==="string") declarations.push(slug(v));
      }
    });
    var hashes=record.artifacts.filter(function(a){return a.role==="model";}).map(function(a){return a.sha256;});
    (catalogue || []).forEach(function(c){
      var aliases=[c.id,c.name].concat(c.aliases || []).map(slug);
      if (declarations.some(function(d){return d && aliases.indexOf(d)>=0;})){ matches.set(c.id,c); methods.add("declared_identity"); }
      if ((c.sha256 || []).some(function(h){return hashes.indexOf(h)>=0;})){ matches.set(c.id,c); methods.add("artifact_hash"); }
    });
    if (matches.size===1){
      var c=Array.from(matches.values())[0];
      if (family && c.architectureId!==family) return {modelId:null,architectureId:family,method:"unresolved",reason:"The checkpoint declaration conflicts with the architecture family."};
      return {modelId:c.id,architectureId:c.architectureId,method:Array.from(methods).join("+"),reason:"Exact catalogue identity match."};
    }
    return {modelId:null,architectureId:family,method:"unresolved",reason:matches.size>1 ? "Conflicting checkpoint identities were found." : "No exact checkpoint identity was found. Architecture alone does not identify a checkpoint."};
  }
  function summarize(record){
    var present=0,missing=0;
    SECTIONS.forEach(function(s){Object.keys(record[s]).forEach(function(k){ if(record[s][k].status==="unavailable") missing++; else present++; });});
    return {runId:record.run_id,collectedAt:record.created_at,architectureId:architecture(record),
      atomCount:value(record,"system","final.number_of_atoms") ?? value(record,"system","initial.number_of_atoms"),
      elements:value(record,"system","final.elements"),
      energy:value(record,"results","energy"),energyUnit:(record.results.energy || {}).unit || null,
      presentFields:present,unavailableFields:missing,artifactCount:record.artifacts.length};
  }
  async function createSubmission(record, options){
    options=options || {};
    validateRecord(record);
    var catalogue=options.catalogue || [], association=resolveIdentity(record,catalogue);
    if (own(options,"modelId") && options.modelId===null && association.modelId){
      association={modelId:null,architectureId:association.architectureId,method:"user_unassigned",reason:"Saved without a catalogue association."};
    }
    if (options.modelId){
      var chosen=catalogue.find(function(c){return c.id===options.modelId;});
      if (!chosen) fail("Select an existing catalogue checkpoint or leave the record unassigned.");
      if (association.architectureId && chosen.architectureId!==association.architectureId) fail("The selected checkpoint has a different architecture family.");
      if (association.modelId && association.modelId!==chosen.id) fail("The selected checkpoint conflicts with the identity in the file.");
      association={modelId:chosen.id,architectureId:chosen.architectureId,method:association.modelId ? association.method : "user_selected",reason:"Associated with an existing catalogue checkpoint."};
    }
    var recordJson=options.recordJson || JSON.stringify(record);
    // Validate the preserved text too: the displayed record and stored file must agree.
    if (JSON.stringify(parseRecord(recordJson))!==JSON.stringify(record)) fail("The preserved file differs from the displayed record.");
    var cryptoProvider=options.crypto || globalThis.crypto;
    if (!cryptoProvider || !cryptoProvider.subtle) fail("Secure file hashing is unavailable. Open the Hub over HTTPS or localhost.");
    var digest=await cryptoProvider.subtle.digest("SHA-256",new TextEncoder().encode(recordJson));
    var hash=Array.from(new Uint8Array(digest)).map(function(b){return b.toString(16).padStart(2,"0");}).join("");
    return {schemaVersion:VERSION,recordType:"extractedRun",uploadId:hash,runId:record.run_id,
      modelId:association.modelId,architectureId:association.architectureId,associationMethod:association.method,
      createdAt:Date.now(),collectedAt:record.created_at,reviewStatus:"unreviewed",
      fileName:options.fileName || "mliphub-metadata.json",recordJson:recordJson};
  }
  return {VERSION:VERSION,SECTIONS:SECTIONS,MAX_BYTES:MAX_BYTES,parseRecord:parseRecord,validateRecord:validateRecord,
    value:value,architecture:architecture,resolveIdentity:resolveIdentity,summarize:summarize,createSubmission:createSubmission};
});
