import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
async function deliver(record,data={type:'daily-local',day:'2026-11-01',note:'愿明天顺利。'}){
 const handlers={},notifications=[];let pending;
 const database={objectStoreNames:{contains:()=>true},transaction(){return {objectStore(){return {get(){const r={};queueMicrotask(()=>{r.result=record;r.onsuccess?.();});return r;}};}};},close(){}};
 const indexedDB={open(){const r={};queueMicrotask(()=>{r.result=database;r.onsuccess?.();});return r;}};
 const context={URL,Promise,AbortSignal,indexedDB,setTimeout:()=>0,self:{registration:{scope:'https://example.test/rest-calendar/',showNotification:async(title,options)=>notifications.push({title,...options})},addEventListener:(type,handler)=>handlers[type]=handler}};
 vm.runInNewContext(source,context);
 handlers.push({data:{json:()=>data},waitUntil:p=>pending=p});await pending;return notifications;
}
test('closed-app notification reads 正 as work from device-local calendar',async()=>{const n=await deliver({name:'测试人员',days:[{day:1,label:'正',kind:'work'}]});assert.equal(n.length,1);assert.equal(n[0].title,'明天上班');assert.match(n[0].body,/11月1日：正/);assert.equal(n[0].data.url,'https://example.test/rest-calendar/');});
test('duty and rest have distinct titles',async()=>{assert.equal((await deliver({days:[{day:1,label:'值班',kind:'work'}]}))[0].title,'明天值班');assert.equal((await deliver({days:[{day:1,label:'休',kind:'rest'}]}))[0].title,'明天休班');});
test('missing month still shows a visible notification as required by Safari',async()=>{const n=await deliver(null);assert.equal(n.length,1);assert.equal(n[0].title,'明日安排待设置');assert.match(n[0].icon,/rest-calendar\/icon-192.png$/);});
test('test notification renders local shift too',async()=>{const n=await deliver({days:[{day:1,label:'值班',kind:'work'}]},{type:'local-test',day:'2026-11-01'});assert.equal(n[0].title,'测试：明天值班');});
test('custom appointments are not announced as work',async()=>{const n=await deliver({name:'我的排班',days:[{day:1,label:'看医生',kind:'custom'}]});assert.equal(n[0].title,'明天：看医生');assert.doesNotMatch(n[0].body,/我的排班/);});
test('unset day is not announced as work',async()=>{const n=await deliver({days:[{day:1,label:'未设置',kind:'unknown'}]});assert.equal(n[0].title,'明日安排待设置');});
