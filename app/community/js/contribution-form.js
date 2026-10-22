(function(root,factory){
  if(typeof module==="object" && module.exports)module.exports=factory();
  else root.MLIPContribution=factory();
})(typeof globalThis!=="undefined" ? globalThis : this,function(){
  "use strict";
  function text(dom,id){var value=dom[id].value.trim();return value==="" ? null : value;}
  function number(dom,id){var value=text(dom,id);return value!==null && Number.isFinite(Number(value)) ? Number(value) : null;}
  function collect(dom,imported){
    var data={
      record_type:"sixPillarContribution",schema_version:"0.1.0",review_status:"draft",
      pillarA_system:{
        system_class:text(dom,"cfSystemClass"),
        identity:{formula:text(dom,"cfFormula"),num_atoms:number(dom,"cfNumAtoms"),periodicity:text(dom,"cfPeriodicity"),source:text(dom,"cfSource")},
        elements:(text(dom,"cfElements") || "").split(",").map(function(s){return s.trim();}).filter(Boolean),
        reference_method:{code:text(dom,"cfRefCode"),functional:text(dom,"cfFunctional")},
        space_group:text(dom,"cfSpaceGroup"),charge:number(dom,"cfCharge")
      },
      pillarB_model:{
        family:text(dom,"cfModelFamily"),checkpoint_version:text(dom,"cfCheckpointVersion"),release_tag:text(dom,"cfReleaseTag"),
        repo_url:text(dom,"cfRepoURL"),license:text(dom,"cfLicense"),origin:text(dom,"cfOrigin"),
        architecture:{symmetry_equivariance:text(dom,"cfEquivariance"),force_construction:text(dom,"cfForceConstruction")},
        hyperparameters:{cutoff_radius:number(dom,"cfCutoff"),parameter_count:text(dom,"cfParamCount")}
      },
      pillarC_data:{
        split_definition:{train_count:number(dom,"cfTrainCount"),test_count:number(dom,"cfTestCount"),split_strategy:text(dom,"cfSplitStrategy")},
        distribution_relationship:text(dom,"cfDistRelation"),energy_ranges:{train:text(dom,"cfTrainERange"),test:text(dom,"cfTestERange")},doi:text(dom,"cfDataDOI")
      },
      pillarD_calculation:{
        engine:text(dom,"cfEngine"),workflow:text(dom,"cfWorkflow"),
        execution_record:{hardware:text(dom,"cfHardware"),libraries:text(dom,"cfLibVersions"),train_time:text(dom,"cfTrainTime"),inference_latency:text(dom,"cfInferTime")},
        epochs:number(dom,"cfEpochs"),random_seeds:text(dom,"cfSeeds")
      },
      pillarE_property:{level:text(dom,"cfPropertyLevel"),task_type:text(dom,"cfTaskType"),description:text(dom,"cfPropertyDesc")},
      pillarF_comparison:{
        target:text(dom,"cfCompTarget"),reference_match:text(dom,"cfRefMatch"),
        metrics:{energy_mae:text(dom,"cfEnergyMAE"),force_mae:text(dom,"cfForceMAE")},
        uq:{method:text(dom,"cfUQMethod"),force_ece:text(dom,"cfForceECE"),spearman_rho:text(dom,"cfSpearmanRho")},
        evidence_status:text(dom,"cfEvidenceStatus")
      },
      contributor_metadata:{name:text(dom,"cfContribName"),github:text(dom,"cfGithub"),affiliation:text(dom,"cfAffiliation"),role:text(dom,"cfContribRole")},
      field_provenance:{}
    };
    Object.keys(dom).filter(function(id){return /^cf/.test(id) && typeof dom[id].value==="string";}).forEach(function(id){
      var value=text(dom,id),original=imported && imported.fields[id];
      data.field_provenance[id]=value===null ? {status:"unavailable",source:"not supplied"} :
        original && value===String(original.value) ? {status:original.status,source:original.source,unit:original.unit || null} :
        {status:"user_provided",source:"contribution form"};
    });
    if(imported)data.extractor_record_json=imported.raw;
    return data;
  }
  /* Only map fields with explicit meanings. Preserve every other field in raw JSON. */
  function prefill(record){
    var fields={};
    function add(id,section,key,transform){
      var field=record[section][key];
      if(!field || field.status==="unavailable" || field.value===null)return;
      var value=transform ? transform(field.value) : field.value;
      if(value===null || value===undefined || typeof value==="object")return;
      fields[id]={value:String(value),status:transform ? "inferred" : field.status,source:section+"."+key+"; "+field.source,unit:field.unit};
    }
    add("cfNumAtoms","system","final.number_of_atoms");
    var symbols="X H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
    function counts(numbers){
      if(!Array.isArray(numbers) || !numbers.length || !numbers.every(function(n){return Number.isInteger(n) && n>0 && n<symbols.length;}))return null;
      var result={};numbers.forEach(function(n){var symbol=symbols[n];result[symbol]=(result[symbol] || 0)+1;});return result;
    }
    add("cfElements","system","final.atomic_numbers",function(numbers){var c=counts(numbers);return c ? Object.keys(c).sort().join(", ") : null;});
    add("cfFormula","system","final.atomic_numbers",function(numbers){
      var c=counts(numbers);if(!c)return null;
      var order=Object.keys(c).sort();
      if(c.C)order=["C"].concat(c.H ? ["H"] : [],order.filter(function(s){return s!=="C" && s!=="H";}));
      return order.map(function(s){return s+(c[s]===1 ? "" : c[s]);}).join("");
    });
    add("cfPeriodicity","system","final.pbc",function(pbc){
      if(!Array.isArray(pbc) || pbc.length!==3 || !pbc.every(function(b){return typeof b==="boolean";}))return null;
      return ["none","1d","2d","3d"][pbc.filter(Boolean).length];
    });
    add("cfModelFamily","model","framework");
    add("cfCheckpointVersion","model","name");
    if(!fields.cfCheckpointVersion)add("cfCheckpointVersion","model","id");
    var cutoff=record.model.cutoff_radius;
    if(cutoff && ["angstrom","Å"].indexOf(cutoff.unit)!==-1)add("cfCutoff","model","cutoff_radius");
    add("cfParamCount","model","parameter_count");
    add("cfEpochs","training","epochs");
    add("cfTrainCount","training","train_count");add("cfTestCount","training","test_count");
    add("cfEngine","simulation","engine");add("cfWorkflow","simulation","type");
    /* Runtime device is not a complete hardware specification; keep it in raw data. */
    add("cfRefCode","training","reference_method",function(v){return v && v.code;});
    add("cfFunctional","training","reference_method",function(v){return v && v.functional;});
    return fields;
  }
  function escapeHTML(value){return String(value==null ? "Unknown" : value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  return {collect:collect,prefill:prefill,escapeHTML:escapeHTML};
});
