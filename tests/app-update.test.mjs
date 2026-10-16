import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../public/sw.js',import.meta.url),'utf8').replace('const SHELL_FILES=[];',"const SHELL_FILES=['index.html','assets/app.js?v=123'];");
async function refresh(fail=false){
 const handlers={},writes=[],requests=[],replies=[],deletes=[];let pending;
 const context={URL,Date,Promise,AbortSignal,caches:{open:async()=>({put:async(key,response)=>writes.push(key)}),delete:async key=>deletes.push(key)},fetch:async(url,options)=>{requests.push({url:String(url),cache:options.cache});return {ok:!(fail&&String(url).includes('app.js'))};},indexedDB:{open(){throw new Error('Application update must not access calendar data');}},self:{registration:{scope:'https://example.test/rest-calendar/'},addEventListener:(name,handler)=>handlers[name]=handler}};
 vm.runInNewContext(source,context);
 handlers.message({data:{type:'REFRESH_APP'},ports:[{postMessage:message=>replies.push(message)}],waitUntil:p=>pending=p});await pending;
 return {writes,requests,replies,deletes};
}
test('application refresh replaces only its own shell and bypasses stale HTTP caches',async()=>{const r=await refresh();assert.deepEqual(r.writes,['https://example.test/rest-calendar/index.html','https://example.test/rest-calendar/assets/app.js?v=123']);assert.ok(r.requests.every(req=>req.cache==='no-store'&&new URL(req.url).searchParams.has('__refresh')));assert.equal(r.replies[0].ok,true);assert.equal(r.deletes.length,0);});
test('failed asset download preserves the previous complete offline shell',async()=>{const r=await refresh(true);assert.equal(r.replies[0].ok,false);assert.equal(r.writes.length,0);assert.equal(r.deletes.length,0);});
