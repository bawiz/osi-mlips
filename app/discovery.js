(function(){
  "use strict";
  var Evidence=window.MLIPEvidence,Store=window.MLIPRunStore,demoPromise;
  function el(tag,text,cls){var n=document.createElement(tag);if(text!=null)n.textContent=String(text);if(cls)n.className=cls;return n;}
  function button(text,fn){var n=el("button",text,"btn");n.type="button";n.addEventListener("click",fn);return n;}
  function option(select,value,text){var n=el("option",text);n.value=value;select.append(n);}
  function download(row){
    var url=URL.createObjectURL(new Blob([row.raw],{type:"application/json"})),link=el("a");
    link.href=url;link.download="mliphub-"+row.record.run_id+".json";link.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  function loadDemo(){
    if(!demoPromise)demoPromise=fetch("data/demo-records.json").then(function(response){if(!response.ok)throw Error("Demo library could not be loaded");return response.json();}).then(function(records){
      if(!Array.isArray(records) || records.length>1000)throw Error("Invalid demo library");
      return records.map(function(record){var row=Evidence.indexRecord(record,{source:"Synthetic fixture"});if(!row.synthetic)throw Error("Unlabelled demo record");return row;});
    }).catch(function(error){demoPromise=null;throw error;});
    return demoPromise;
  }
  function mount(root,options){
    var active=true,stop=function(){},demo=[],local=[],shared=[],errors=[],criteria={},history=[],page=0,invalidUploads=0,contributions={rows:[],errors:[]};
    root.classList.add("discovery");
    var heading=el("h1","Find an MLIP"),intro=el("p","Describe your system and calculation. Explore candidate checkpoints through the training and usage records contributed to the Hub.","prose");
    var label=el("label","Evidence source","discovery-source"),source=el("select");
    source.setAttribute("aria-label","Evidence source");option(source,"demo","Synthetic demonstration · 320 records");option(source,"uploads","Contributed records · unreviewed");option(source,"uploaded-demo","Uploaded synthetic records · demonstration only");label.append(source);
    source.value=["demo","uploads","uploaded-demo"].includes(options.source) ? options.source : "demo";
    var notice=el("p",null,"evidence-notice");notice.setAttribute("role","status");
    var stats=el("div",null,"evidence-stats"),pipeline=el("p","Extract or upload → validate → index records → filter evidence → inspect candidates","evidence-pipeline");
    var chat=el("section",null,"discovery-chat"),messages=el("div",null,"discovery-messages"),form=el("form"),query=el("textarea");
    messages.setAttribute("role","log");messages.setAttribute("aria-live","polite");query.setAttribute("aria-label","Describe your calculation");query.rows=3;query.maxLength=1200;
    query.placeholder="For example: bulk Cu molecular dynamics on CPU at 300 K";
    var submit=el("button","Find candidates","btn");submit.type="submit";
    var reset=button("New search",function(){criteria={};history=[];page=0;query.value="";search.value="";kind.value="all";onlyMatches.checked=false;details.hidden=true;render();});
    form.append(query,submit,reset);chat.append(el("h2","Ask the evidence library"),messages,form);
    var prompts=el("div",null,"discovery-prompts");
    ["Bulk Cu molecular dynamics on CPU at 300 K","Liquid water MD at 300 K","Silicon phonons on CPU at 600 K"].forEach(function(text){prompts.append(button(text,function(){ask(text);}));});chat.append(prompts);
    chat.append(el("p","Filters: elements/formula, task, system class, Kelvin temperature or range, atom count, CPU/GPU and reference functional. Element sets match exactly by default; say “containing Cu” to allow extra elements. Stoichiometry, charge and local structure still need validation. Follow up to refine the visible filters.","muted"));
    var chips=el("div",null,"criteria-chips"),results=el("section",null,"discovery-results"),charts=el("section",null,"evidence-charts");
    var funnel=el("div"),coverage=el("div",null,"coverage-chart");charts.append(funnel,coverage);
    var library=el("section",null,"evidence-record-library"),search=el("input"),kind=el("select"),onlyMatches=el("input"),controls=el("div",null,"library-controls"),tableHost=el("div",null,"evidence-table-scroll"),pager=el("div",null,"library-pager"),details=el("section",null,"evidence-detail");
    search.type="search";search.placeholder="Search model, element, task or run ID";search.setAttribute("aria-label","Search evidence records");kind.setAttribute("aria-label","Record type");
    option(kind,"all","All record types");option(kind,"training","Training records");option(kind,"usage","Usage records");
    option(kind,"unknown","Unclassified records");kind.value="all";
    onlyMatches.type="checkbox";var matchLabel=el("label","Only matching usage records ");matchLabel.append(onlyMatches);controls.append(search,kind,matchLabel);
    library.append(el("h2","Record library"),controls,tableHost,pager);details.hidden=true;
    var status=el("p","Loading evidence…","muted");status.setAttribute("role","status");
    root.append(heading,intro,label,notice,stats,pipeline,chat,chips,results,charts,library,details,status);
    function rows(){
      if(source.value==="demo"){invalidUploads=0;return demo;}
      invalidUploads=contributions.errors.length;
      return contributions.rows.filter(function(row){return source.value==="uploaded-demo" ? row.synthetic : !row.synthetic;});
    }
    function inspect(row){
      details.replaceChildren(el("h2",row.name+" · "+(row.synthetic ? "synthetic record" : "unreviewed contribution")),el("p","Run "+row.record.run_id+" · "+row.source,"muted"),button("Download extractor JSON",function(){download(row);}),button("Close record",function(){details.hidden=true;}));
      var pre=el("pre",row.raw.slice(0,50000));details.append(pre);
      if(row.raw.length>50000)details.append(el("p","Preview shortened. The download preserves the complete original JSON.","muted"));
      details.hidden=false;
      if(details.scrollIntoView)details.scrollIntoView({behavior:"smooth",block:"start"});
    }
    function ask(text){
      text=text.trim();if(!text)return;
      criteria=Evidence.parse(text,criteria);history.push({role:"You",text:text});
      var result=Evidence.recommend(rows(),criteria),answer;
      if(result.needs.length)answer="Please specify "+result.needs.join(" and ")+". I will keep the filters already supplied.";
      else if(!result.candidates.length)answer="No usage record in this source satisfies all active filters. This is an evidence gap, not proof that a model cannot perform the calculation. Try broadening a filter or adding relevant records.";
      else answer="Found "+result.candidates.length+" candidate checkpoints across "+result.matched.length+" matching usage records. Ranked by exact element-set coverage, then the number of matching reports. Inspect the records before selecting a model.";
      if(/\b(?:accuracy|mae|rmse|fastest|speed|error)\b/i.test(text))answer+=" Numerical accuracy/speed targets are not automatic filters here; those require comparable reference datasets, structures, units and hardware. No cross-benchmark performance ranking is inferred.";
      if(/\b(?:NVT|NPT|pressure|charge|charged|spin|magnetic|magnetism|defects?|uncertainty|calibration|reactive)\b|GPa|Celsius|°C/i.test(text))answer+=" Additional requirements such as ensemble, pressure, charge, magnetism, reactive behaviour or uncertainty are not automatic filters. The candidates satisfy only the visible supported filters.";
      if(result.identityConflicts.length)answer+=" "+result.identityConflicts.length+" checkpoint IDs have conflicting architecture or artifact identities and were excluded pending review.";
      history.push({role:"Hub",text:answer});query.value="";page=0;render();
    }
    function renderChips(){
      chips.replaceChildren();
      var labels={elements:"Elements",elementMatch:"Element-set match",task:"Task",domain:"System",hardware:"Hardware",atoms:"Reported run ≥ atoms",atomsMax:"Reported run ≤ atoms",atomsExact:"Reported run = atoms",functional:"Reference"};
      Object.keys(labels).forEach(function(key){if(criteria[key]!=null){
        var value=Array.isArray(criteria[key]) ? criteria[key].join(", ") : criteria[key];
        chips.append(button(labels[key]+": "+value+" ×",function(){delete criteria[key];page=0;render();}));
      }});
      if(criteria.tempMin!=null)chips.append(button("Reported temperature: "+criteria.tempMin+(criteria.tempMax!==criteria.tempMin ? "–"+criteria.tempMax : "")+" K ×",function(){delete criteria.tempMin;delete criteria.tempMax;render();}));
    }
    function renderResults(result){
      results.replaceChildren(el("h2","Candidate checkpoints"));
      if(result.needs.length){results.append(el("p","Describe "+result.needs.join(" and ")+" to get candidates.","muted"));return;}
      if(!result.candidates.length){results.append(el("p","No matching evidence. Unknown metadata never counts as satisfying a requirement.","muted"));return;}
      if(result.candidates.length>8)results.append(el("p","Showing the first 8 of "+result.candidates.length+" candidates. Refine the visible filters to narrow this list.","muted"));
      result.candidates.slice(0,8).forEach(function(candidate,index){
        var card=el("article",null,"candidate-card");card.append(el("h3",(index+1)+". "+candidate.name),el("p",candidate.architecture+" · "+candidate.rows.length+" matching usage records · "+(candidate.rows[0].synthetic ? "synthetic demonstration" : "unreviewed evidence"),"muted"));
        var reports=candidate.rows.slice(0,3).map(function(row){return row.elements.join("–")+", "+(Evidence.tasks[row.task] || row.task)+", "+(row.atoms==null ? "unknown size" : row.atoms+" atoms")+", "+(row.temperature==null ? "unknown temperature" : row.temperature+" K")+", "+(row.hardware || "unknown hardware")+", "+(row.outcome || "completion unknown");});
        reports.forEach(function(text){card.append(el("p",text));});
        card.append(button("Inspect matching record",function(){inspect(candidate.rows[0]);}),button("Show evidence in library",function(){search.value=candidate.id;onlyMatches.checked=true;kind.value="usage";page=0;render();if(library.scrollIntoView)library.scrollIntoView({behavior:"smooth",block:"start"});}));results.append(card);
      });
      results.append(el("p","These are candidates for validation, not a universal “best MLIP”. Element coverage and reported usage do not establish transferability or accuracy on a new system.","muted"));
    }
    function renderCharts(data,result){
      funnel.replaceChildren(el("h2","How the filters narrow the evidence"));
      var base=Math.max(1,result.stages[0].count);
      result.stages.forEach(function(stage){
        var row=el("div",null,"funnel-row"),track=el("div",null,"funnel-track"),bar=el("span");bar.style.width=(100*stage.count/base)+"%";track.append(bar);row.append(el("span",stage.label),track,el("strong",stage.count));funnel.append(row);
      });
      coverage.replaceChildren(el("h2","Reported task coverage"),el("p","Each cell counts usage records excluding reported failures. Click a cell to filter the task and inspect that checkpoint’s records. Counts do not measure predictive quality.","muted"));
      var models=new Map(),taskSet=new Set();
      data.filter(function(r){return r.id && r.kind==="usage" && !r.failed;}).forEach(function(r){if(!models.has(r.id))models.set(r.id,{name:r.name,counts:{}});var m=models.get(r.id);m.counts[r.task]=(m.counts[r.task] || 0)+1;taskSet.add(r.task);});
      var taskKeys=Array.from(taskSet).filter(Boolean).sort(),table=el("table"),thead=el("thead"),head=el("tr"),body=el("tbody");head.append(el("th","Checkpoint"));taskKeys.forEach(function(t){head.append(el("th",Evidence.tasks[t] || t));});thead.append(head);table.append(thead);
      if(models.size>30)coverage.append(el("p","Showing the first 30 checkpoints; the record library below searches all loaded records.","muted"));
      Array.from(models.entries()).slice(0,30).forEach(function(pair){var tr=el("tr");tr.append(el("th",pair[1].name));taskKeys.forEach(function(t){var cell=el("td"),count=pair[1].counts[t] || 0,b=button(count,function(){criteria.task=t;search.value=pair[0];onlyMatches.checked=false;kind.value="usage";page=0;render();});b.disabled=!count;b.style.background="rgba(73,195,216,"+(count ? Math.min(.65,.12+count*.045) : .02)+")";b.setAttribute("aria-label",pair[1].name+", "+(Evidence.tasks[t] || t)+", "+count+" records");cell.append(b);tr.append(cell);});body.append(tr);});table.append(body);coverage.append(table);
    }
    function renderTable(data,result){
      var q=search.value.trim().toLowerCase(),matches=new Set(result.matched.map(function(r){return r.key;}));
      var filtered=data.filter(function(r){return (kind.value==="all" || r.kind===kind.value) && (!onlyMatches.checked || matches.has(r.key)) && (!q || [r.id,r.name,r.task,r.elements.join(" "),r.record.run_id].join(" ").toLowerCase().includes(q));});
      page=Math.min(page,Math.max(0,Math.ceil(filtered.length/20)-1));tableHost.replaceChildren();pager.replaceChildren();
      if(!filtered.length){tableHost.append(el("p","No records in this view. Upload and save a calculation, change source, or clear filters.","muted"));return;}
      var table=el("table"),head=el("tr"),thead=el("thead"),body=el("tbody");["Checkpoint / evidence","Type","System","Task","Conditions","Record"].forEach(function(s){head.append(el("th",s));});thead.append(head);table.append(thead);
      filtered.slice(page*20,page*20+20).forEach(function(r){var tr=el("tr");tr.className=matches.has(r.key) && criteria.task ? "matched-record" : "";tr.append(el("td",r.name+" · "+(r.synthetic ? "SYNTHETIC" : "UNREVIEWED")),el("td",r.kind+" · "+(r.outcome || "completion unknown")),el("td",r.elements.join("–") || "Unknown"),el("td",Evidence.tasks[r.task] || r.task || "Unknown"),el("td",(r.atoms==null ? "?" : r.atoms)+" atoms · "+(r.temperature==null ? "?" : r.temperature)+" K · "+(r.hardware || "?")));var action=el("td");action.append(button("Inspect",function(){inspect(r);}));tr.append(action);body.append(tr);});table.append(body);tableHost.append(table);
      var back=button("Previous",function(){page--;render();}),next=button("Next",function(){page++;render();});back.disabled=page===0;next.disabled=(page+1)*20>=filtered.length;pager.append(back,el("span",filtered.length+" records · page "+(page+1)+" of "+Math.ceil(filtered.length/20)),next);
    }
    function render(){
      if(!active)return;var data=rows(),result=Evidence.recommend(data,criteria),models=new Set(data.map(function(r){return r.id;}).filter(Boolean));
      notice.textContent=source.value==="uploads" ? "Unreviewed contributed records. Self-reported metadata and metrics require validation; they do not change curated Model Pages." : "SYNTHETIC DEMONSTRATION. All checkpoint names, calculations and numerical results in this source are fictional. No recommendation here is evidence about a real MLIP.";
      stats.replaceChildren();[["Records",data.length],["Checkpoints",models.size],["Training reports",data.filter(function(r){return r.kind==="training";}).length],["Usage reports",data.filter(function(r){return r.kind==="usage";}).length]].forEach(function(s){var card=el("div");card.append(el("strong",s[1]),el("span",s[0]));stats.append(card);});
      messages.replaceChildren();(history.length ? history.slice(-8) : [{role:"Hub",text:"Tell me your elements or formula and the calculation task. Add temperature, atom count, hardware or reference functional if these matter. I will show the filters, evidence gaps and records behind each candidate."}]).forEach(function(m){var p=el("p");p.append(el("strong",m.role+": "),el("span",m.text));messages.append(p);});
      renderChips();renderResults(result);renderCharts(data,result);renderTable(data,result);
      status.textContent=(source.value==="demo" ? "Bundled demonstration library." : "Includes browser-local records and up to 50 recent connected shared uploads. Training and usage reports retain their original JSON.")+" "+data.filter(function(r){return r.kind==="unknown";}).length+" records lack task/type classification. "+invalidUploads+" invalid uploaded records excluded."+ (errors.length ? " "+errors.join(" ") : "");
    }
    form.addEventListener("submit",function(event){event.preventDefault();ask(query.value);});
    query.addEventListener("keydown",function(event){if(event.key==="Enter" && !event.shiftKey){event.preventDefault();ask(query.value);}});
    source.addEventListener("change",function(){history=[];page=0;details.hidden=true;render();});search.addEventListener("input",function(){page=0;render();});kind.addEventListener("change",function(){if(kind.value==="training")onlyMatches.checked=false;page=0;render();});onlyMatches.addEventListener("change",function(){page=0;render();});
    render();
    loadDemo().then(function(data){if(active){demo=data;render();}}).catch(function(error){if(active){errors.push(error.message);render();}});
    Store.listLocal().then(function(entries){if(active){local=entries.map(function(e){return Object.assign({},e,{librarySource:"This browser"});});contributions=Evidence.indexEntries(local.concat(shared));render();}}).catch(function(error){if(active){errors.push("Local library unavailable: "+error.message);render();}});
    Promise.resolve(options.db).then(function(db){if(!active || !db)return;stop=Store.subscribeShared(db,function(entries){if(active){shared=entries.map(function(e){return Object.assign({},e,{librarySource:"Shared Hub"});});contributions=Evidence.indexEntries(local.concat(shared));render();}},function(){if(active){errors.push("Shared library could not be loaded.");render();}});}).catch(function(){if(active){errors.push("Shared storage is not connected.");render();}});
    return function(){active=false;stop();root.classList.remove("discovery");};
  }
  window.MLIPDiscovery={mount:mount};
})();
