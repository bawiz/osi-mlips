(function(root,factory){
  if (typeof module === "object" && module.exports) module.exports=factory();
  else root.MLIPRunStore=factory();
})(typeof globalThis !== "undefined" ? globalThis : this,function(){
  "use strict";
  function open(){
    return new Promise(function(resolve,reject){
      if (!globalThis.indexedDB){reject(new Error("This browser does not support persistent local storage."));return;}
      var request=indexedDB.open("mlip-hub-extracted-runs",1);
      request.onupgradeneeded=function(){request.result.createObjectStore("runs",{keyPath:"uploadId"});};
      request.onsuccess=function(){resolve(request.result);};
      request.onerror=function(){reject(request.error || new Error("Could not open local storage."));};
    });
  }
  async function saveLocal(entry){
    var db=await open();
    return new Promise(function(resolve,reject){
      var tx=db.transaction("runs","readwrite");
      tx.objectStore("runs").put(entry);
      tx.oncomplete=function(){db.close();resolve(entry);};
      tx.onerror=tx.onabort=function(){db.close();reject(tx.error || new Error("Could not save the record locally."));};
    });
  }
  async function listLocal(){
    var db=await open();
    return new Promise(function(resolve,reject){
      var tx=db.transaction("runs","readonly"),request=tx.objectStore("runs").getAll();
      tx.oncomplete=function(){db.close();resolve(request.result || []);};
      tx.onerror=tx.onabort=function(){db.close();reject(tx.error || new Error("Could not read local records."));};
    });
  }
  async function saveShared(db,entry){
    if (!db) throw new Error("Shared Hub storage is not connected. You can save this record in this browser.");
    await db.collection("extractedRuns").add(entry);
    return entry;
  }
  function subscribeShared(db,onEntries,onError){
    if (!db) return function(){};
    return db.collection("extractedRuns").orderBy("createdAt","desc").limit(50).onSnapshot(function(snapshot){
      onEntries(snapshot.docs.map(function(doc){return doc.data();}));
    },onError);
  }
  return {saveLocal:saveLocal,listLocal:listLocal,saveShared:saveShared,subscribeShared:subscribeShared};
});
