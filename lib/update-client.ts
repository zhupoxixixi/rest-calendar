export const UPDATE_CHECK_KEY='rest-calendar-update-day';
export const UPDATE_VIEW_KEY='rest-calendar-update-view';
export function updateDay(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function checkedToday(){try{return localStorage.getItem(UPDATE_CHECK_KEY)===updateDay();}catch{return false;}}
export function markUpdateChecked(){try{localStorage.setItem(UPDATE_CHECK_KEY,updateDay());}catch{}}
function deadline<T>(promise:Promise<T>,ms:number,message:string):Promise<T>{return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(message)),ms);promise.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});}
async function fresh(url:URL){const target=new URL(url);target.searchParams.set('__refresh',String(Date.now()));const response=await fetch(target,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('暂时无法获取更新，请稍后重试');return response;}
async function activate(worker:ServiceWorker){if(worker.state==='activated')return;await deadline(new Promise<void>((resolve,reject)=>{const check=()=>{if(worker.state==='activated'){worker.removeEventListener('statechange',check);resolve();}else if(worker.state==='redundant'){worker.removeEventListener('statechange',check);reject(new Error('更新未完成，请稍后重试'));}};worker.addEventListener('statechange',check);check();}),20000,'更新用时较长，请稍后重试');}
async function refreshShell(registration:ServiceWorkerRegistration){
 await registration.update();const next=registration.installing||registration.waiting;if(next)await activate(next);
 const active=registration.active;if(!active)return;
 await deadline(new Promise<void>((resolve,reject)=>{const channel=new MessageChannel();channel.port1.onmessage=event=>{channel.port1.close();event.data?.ok?resolve():reject(new Error('资源未更新完成，请稍后重试'));};active.postMessage({type:'REFRESH_APP'},[channel.port2]);}),20000,'更新用时较长，请稍后重试');
}
// Only application resources are refreshed. Never delete IndexedDB, device
// credentials, service-worker registrations or notification subscriptions.
export async function prepareAppUpdate(force=false,canReload=()=>true):Promise<{state:'current'|'deferred'|'ready';url?:string}>{
 if(!navigator.onLine)throw new Error('当前离线，联网后再刷新；本机日历仍可使用');
 const base=new URL('./',document.baseURI),versionResponse=await fresh(new URL('version.json',base));
 const release=await versionResponse.json() as {version?:unknown};const version=release?.version;if(typeof version!=='string'||!/^[a-f0-9]{12,64}$/.test(version))throw new Error('更新信息暂不可用，请稍后重试');
 const current=document.querySelector('meta[name="rest-calendar-version"]')?.getAttribute('content');
 if(!force&&current===version)return {state:'current'};
 const response=await fresh(base),html=await response.text(),doc=new DOMParser().parseFromString(html,'text/html');
 if(doc.querySelector('meta[name="rest-calendar-version"]')?.getAttribute('content')!==version)throw new Error('新版本正在发布，请稍后再刷新');
 const assets=new Set<string>();for(const element of doc.querySelectorAll('script[src],link[rel="stylesheet"],link[rel="modulepreload"]')){const path=element.getAttribute('src')||element.getAttribute('href');if(!path)continue;const url=new URL(path,base);if(url.origin===base.origin)assets.add(url.href);}
 if(!assets.size)throw new Error('新版本资源尚未就绪，请稍后再刷新');
 await Promise.all([...assets].map(async url=>{const response=await fresh(new URL(url));await response.arrayBuffer();}));
 if('serviceWorker'in navigator){const registration=await navigator.serviceWorker.getRegistration(base.href)||await navigator.serviceWorker.register(new URL('sw.js',base).href,{updateViaCache:'none'});await refreshShell(registration);}
 if(!canReload())return {state:'deferred'};
 const next=new URL(location.href);next.searchParams.set('__refresh',String(Date.now()));return {state:'ready',url:next.href};
}
