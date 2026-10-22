/* Keep main's curated GUI and mount the contribution workspaces behind routes. */
(function(root,factory){
  if(typeof module === "object" && module.exports) module.exports=factory();
  else root.MLIPWorkspaceShell=factory();
})(typeof globalThis !== "undefined" ? globalThis : this,function(){
  "use strict";
  var VIEWS={
    catalog:{title:"Catalogue & benchmarks",description:"Explore the extended contribution catalogue, inspect six pillars, and shortlist entries for comparison. These entries are separate from the curated Model Pages."},
    uq:{title:"UQ benchmarks",description:"Explore the contribution branch's precomputed ammonia studies. Training budgets and evidence labels belong to each study; they are not universal model guarantees."},
    knowledge:{title:"MACE knowledge graph",description:"Explore model families, training corpora and task relationships from the contribution catalogue."},
    contribute:{title:"Contribute",description:"Prepare a six-pillar contribution. For automatic metadata collection, use Calculation uploads. Exported drafts do not publish or change curated Model Pages."}
  };
  function workspaceKey(hash){
    var parts=hash.replace(/^#/,"").split("/");
    return parts.length===2 && parts[0]==="workspace" && Object.prototype.hasOwnProperty.call(VIEWS,parts[1]) ? parts[1] : null;
  }
  function mount(options){
    var frame=null,current=null;
    function showFrame(){
      if(frame && current && frame.contentWindow.MLIPWorkspace) frame.contentWindow.MLIPWorkspace.show(current);
    }
    return {
      select:function(hash){
        current=workspaceKey(hash);
        options.main.hidden=!!current;options.panel.hidden=!current;
        options.nav.querySelectorAll("a[data-section]").forEach(function(link){
          var selected=link.getAttribute("data-section")===(current || (hash==="uploads" ? "uploads" : hash.split("/")[0]==="discover" ? "discover" : "hub"));
          if(selected)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");
        });
        if(!current)return false;
        options.title.textContent=VIEWS[current].title;
        options.description.textContent=VIEWS[current].description;
        if(!frame){
          frame=options.createFrame();frame.title="Usefulness Boundary Hub workspaces";
          frame.className="workspace-frame";
          frame.addEventListener("load",showFrame);
          frame.src="community/index.html?embedded=1#view-"+current;
          options.host.append(frame);
        }
        showFrame();
        return true;
      }
    };
  }
  return {VIEWS:VIEWS,workspaceKey:workspaceKey,mount:mount};
});
