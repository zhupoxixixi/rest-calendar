import {db,runtime,json} from './server';
export async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
export function checkOrigin(req:Request){
 const origin=req.headers.get('origin');
 const allowed=[new URL(req.url).origin,'https://zhupoxixixi.github.io'];
 if(import.meta.env.DEV)allowed.push('http://127.0.0.1:5173','http://127.0.0.1:4173','http://localhost:5173');
 if(origin&&!allowed.includes(origin))throw new Error('请求来源不正确');
 if(req.method!=='GET'&&req.method!=='OPTIONS'&&!origin)throw new Error('缺少请求来源');
 return origin;
}
export function reply(req:Request,data:unknown,status=200){const res=json(data,status);const origin=req.headers.get('origin');if(origin&&[new URL(req.url).origin,'https://zhupoxixixi.github.io','http://127.0.0.1:5173','http://127.0.0.1:4173','http://localhost:5173'].includes(origin))res.headers.set('Access-Control-Allow-Origin',origin);res.headers.set('Vary','Origin');return res;}
export function options(req:Request){try{checkOrigin(req);const res=reply(req,null,200);res.headers.set('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.headers.set('Access-Control-Allow-Headers','Authorization,Content-Type,X-Device-ID');res.headers.set('Access-Control-Max-Age','600');return res;}catch{return new Response(null,{status:403});}}
export function apiError(req:Request,e:unknown){return reply(req,{error:e instanceof Error?e.message:'操作失败'},e instanceof Error&&e.message==='设备凭据无效'?401:400);}
export async function deviceIdentity(req:Request){checkOrigin(req);const id=req.headers.get('x-device-id')||'',token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');if(!/^[a-f0-9-]{36}$/.test(id)||!/[A-Za-z0-9_-]{40,50}/.test(token))throw new Error('设备凭据无效');const row=await db().prepare('SELECT token_hash FROM devices WHERE id=?').bind(id).first<any>();if(!row||row.token_hash!==await digest(token))throw new Error('设备凭据无效');return 'device:'+id;}
export async function ipHash(req:Request){return digest((req.headers.get('cf-connecting-ip')||'local')+'|'+(runtime.DEVICE_RATE_SALT||runtime.VAPID_PRIVATE_KEY));}
