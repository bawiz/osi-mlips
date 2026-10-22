/* JSON import UI: uses the same run record for preview, persistence, and download. */
(function(){
  "use strict";
  var Import=window.MLIPImport, Store=window.MLIPRunStore;
  function el(tag,text,cls){var node=document.createElement(tag);if(text!=null)node.textContent=text;if(cls)node.className=cls;return node;}
  function button(text,fn){var b=el("button",text,"btn");b.type="button";b.addEventListener("click",fn);return b;}
  function display(value){
    var text=typeof value==="string" ? value : JSON.stringify(value);
    return text.length>400 ? text.slice(0,400)+"… (full value retained in JSON)" : text;
  }
  function download(entry){
    var blob=new Blob([entry.recordJson],{type:"application/json"}),url=URL.createObjectURL(blob),link=el("a");
    link.href=url;link.download="mliphub-"+entry.uploadId.slice(0,12)+".json";link.click();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  function metadata(record){
    var wrap=el("div",null,"metadata-sections");
    Import.SECTIONS.forEach(function(section){
      var fields=Object.keys(record[section]),group=el("details",null,"metadata-group");
      group.open=section==="model";
      group.append(el("summary",section.charAt(0).toUpperCase()+section.slice(1)+" · "+fields.length+" fields"));
      if(!fields.length){group.append(el("p","No information available in this section.","muted"));}
      else {
        var scroll=el("div",null,"metadata-scroll"),table=el("table",null,"metadata-table"),head=el("thead"),row=el("tr"),body=el("tbody");
        ["Field","Value","Unit","Status / source"].forEach(function(label){row.append(el("th",label));});
        head.append(row);table.append(head);
        fields.forEach(function(key){
          var field=record[section][key],tr=el("tr"),origin=el("td");
          var labels={id:"Checkpoint ID",name:"Checkpoint name",architecture_id:"Architecture family",implementation_class:"Implementation class",architecture:"Implementation class (legacy field)",framework:"MLIP package / family (legacy field)"};
          var fieldLabel=section==="model" && Object.prototype.hasOwnProperty.call(labels,key) ? labels[key] : key;
          tr.append(el("th",fieldLabel),el("td",field.status==="unavailable" ? field.reason : display(field.value)),el("td",field.unit || "—"));
          origin.append(el("span",field.status,"metadata-status"),el("div",field.source,"metadata-source"));tr.append(origin);body.append(tr);
        });
        table.append(body);scroll.append(table);group.append(scroll);
      }
      wrap.append(group);
    });
    if(record.artifacts.length){
      var artifacts=el("details",null,"metadata-group");artifacts.append(el("summary","Artifacts · "+record.artifacts.length));
      record.artifacts.forEach(function(a){artifacts.append(el("pre",a.role+": "+a.path+"\nSHA-256: "+a.sha256+"\n"+a.size_bytes+" bytes"));});wrap.append(artifacts);
    }
    if(record.warnings.length){
      var warnings=el("details",null,"metadata-group");warnings.append(el("summary","Extraction notes · "+record.warnings.length));
      record.warnings.forEach(function(w){warnings.append(el("p",w,"muted"));});wrap.append(warnings);
    }
    return wrap;
  }
  function mount(container,options){
    var active=true,local=[],shared=[],catalogue=[],current=null,rawText=null,fileName=null,db=null,stop=function(){},generation=0;
    container.classList.add("uploads");
    var title=el("h2","Calculation uploads"),intro=el("p","Import your extractor JSON to fill model, training, system, calculation, and environment details automatically.","prose");
    var instructions=el("p",null,"upload-instructions");instructions.append(el("span","After your calculation: "),el("code","import mliphub; mliphub.extract(atoms)"));
    var pickerLabel=el("label","Choose extractor JSON","upload-file-label"),picker=el("input");
    picker.type="file";picker.accept=".json,application/json";picker.setAttribute("aria-label","Choose extractor JSON");pickerLabel.append(picker);
    var status=el("p","Checking Hub storage…","upload-status");status.setAttribute("role","status");status.setAttribute("aria-live","polite");
    var preview=el("div"),listTitle=el("h3",options.modelId ? "Uploaded calculations for this checkpoint" : "Recent calculation uploads"),list=el("div"),listStatus=el("p",null,"muted");
    container.append(title,intro,instructions,pickerLabel,status,preview,listTitle,listStatus,list);
    function message(text,error){status.textContent=text;status.classList.toggle("upload-error",!!error);}
    function resolveLabel(id){var c=catalogue.find(function(c){return c.id===id;});return c ? c.name : (id || "Unassigned checkpoint");}
    function renderList(){
      if(!active)return;
      list.replaceChildren();
      var entries=new Map();
      local.forEach(function(x){entries.set(x.uploadId,{entry:x,where:"This browser"});});
      shared.forEach(function(x){
        var existing=entries.get(x.uploadId);
        if(!existing || existing.where!=="Shared Hub upload" || existing.entry.createdAt<x.createdAt)
          entries.set(x.uploadId,{entry:x,where:"Shared Hub upload"});
      });
      var sorted=Array.from(entries.values()).filter(function(x){return !options.modelId || x.entry.modelId===options.modelId;}).sort(function(a,b){return b.entry.createdAt-a.entry.createdAt;});
      if(!sorted.length){list.append(el("p","No calculation records uploaded here yet.","muted"));return;}
      sorted.forEach(function(item){
        var entry=item.entry;
        try{
          if(entry.recordType!=="extractedRun" || entry.schemaVersion!==Import.VERSION || !/^[a-f0-9]{64}$/.test(entry.uploadId || ""))throw new Error("Unsupported saved upload envelope.");
          var record=Import.parseRecord(entry.recordJson),summary=Import.summarize(record),details=el("details",null,"uploaded-run"),heading=el("summary");
          heading.append(el("strong",resolveLabel(entry.modelId)),el("span",item.where+" · unreviewed","run-badge"));details.append(heading);
          details.append(el("p","Run "+summary.runId+" · collected "+summary.collectedAt,"muted"));
          var facts=summary.presentFields+" available fields · "+summary.unavailableFields+" unavailable";
          if(summary.atomCount!=null)facts+=" · "+summary.atomCount+" atoms";
          details.append(el("p",facts,"muted"));
          details.append(button("Download original JSON",function(){download(entry);}),metadata(record));list.append(details);
        }catch(error){list.append(el("p","A saved upload could not be read: "+error.message,"upload-error"));}
      });
    }
    function showPreview(){
      preview.replaceChildren();if(!current)return;
      var identity=Import.resolveIdentity(current,catalogue),summary=Import.summarize(current),card=el("div",null,"upload-preview");
      card.append(el("h3","Imported metadata"),el("p",summary.presentFields+" available fields · "+summary.unavailableFields+" unavailable · "+summary.artifactCount+" artifacts","muted"));
      var label=el("label","Checkpoint association","checkpoint-label"),select=el("select");select.setAttribute("aria-label","Checkpoint association");
      var empty=el("option","Unassigned — preserve the record without a checkpoint link");empty.value="";select.append(empty);
      catalogue.forEach(function(c){var option=el("option",c.name+(c.kind==="knownVariant" ? " (known variant)" : ""));option.value=c.id;option.disabled=!!identity.architectureId && identity.architectureId!==c.architectureId;select.append(option);});
      select.value=identity.modelId || "";label.append(select);card.append(label);
      card.append(el("p",identity.modelId ? "Matched automatically: "+resolveLabel(identity.modelId)+". No metadata needs to be retyped." : identity.reason+" You may keep it unassigned or select a checkpoint.","muted"));
      card.append(el("p","Uploaded calculations are contributed records. They do not change curated claims or establish accuracy, uncertainty calibration, or known failure modes.","muted"));
      var actions=el("div",null,"upload-actions"),sharedButton,localButton;
      async function save(sharedMode){
        sharedButton.disabled=localButton.disabled=true;picker.disabled=true;
        try{
          var entry=await Import.createSubmission(current,{catalogue:catalogue,modelId:select.value || null,fileName:fileName,recordJson:rawText});
          if(sharedMode){
            await Store.saveShared(db,entry);shared=shared.filter(function(x){return x.uploadId!==entry.uploadId;}).concat(entry);
            if(active)message("Uploaded to the Hub. All metadata and its sources have been preserved.");
          } else {
            await Store.saveLocal(entry);local=local.filter(function(x){return x.uploadId!==entry.uploadId;}).concat(entry);
            if(active)message("Saved in this browser. This record has not been uploaded to shared Hub storage.");
          }
          if(active){select.disabled=true;renderList();}
        }catch(error){if(active){message("Could not save: "+error.message,true);sharedButton.disabled=!db;localButton.disabled=false;}}
        finally{if(active)picker.disabled=false;}
      }
      sharedButton=button("Upload to Hub",function(){return save(true);});sharedButton.disabled=!db;
      localButton=button("Save in this browser",function(){return save(false);});actions.append(sharedButton,localButton);card.append(actions);
      card.append(metadata(current));preview.append(card);
    }
    var ready=Promise.resolve(options.catalogue).then(function(items){if(active){catalogue=items || [];renderList();showPreview();}}).catch(function(error){if(active)message("Catalogue could not be loaded: "+error.message,true);});
    Promise.resolve(options.db).then(function(connection){
      if(!active)return;db=connection;
      message(db ? "Shared Hub upload is available. Choose a JSON file to review its metadata." : "Shared Hub storage is not connected. You can import and save records in this browser.");
      showPreview();
      if(db)stop=Store.subscribeShared(db,function(entries){if(active){shared=entries;renderList();}},function(){if(active)listStatus.textContent="Shared uploads could not be loaded. Local records are still available.";});
    }).catch(function(error){if(active)message("Shared Hub storage is unavailable: "+error.message,true);});
    Store.listLocal().then(function(entries){if(active){local=entries;renderList();}}).catch(function(error){if(active)listStatus.textContent="Local records could not be loaded: "+error.message;});
    picker.addEventListener("change",async function(){
      var selected=picker.files[0],token=++generation;current=null;rawText=null;preview.replaceChildren();
      if(!selected)return;
      try{
        if(selected.size>Import.MAX_BYTES)throw new Error("Choose a JSON file no larger than 10 MiB.");
        var text=await selected.text(),record=Import.parseRecord(text);await ready;
        if(!active || token!==generation)return;
        current=record;rawText=text;fileName=selected.name;showPreview();message("File validated. Review the extracted information, then choose where to save it.");
      }catch(error){if(active && token===generation)message(error.message,true);}
    });
    return function(){active=false;generation++;stop();};
  }
  window.MLIPUploads={mount:mount};
})();
