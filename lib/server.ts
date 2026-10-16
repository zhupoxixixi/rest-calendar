import { env } from 'cloudflare:workers';
import { buildPushPayload } from '@block65/webcrypto-web-push';
export const runtime = env as unknown as Record<string, any>;
export const db = () => { if(!runtime.DB) throw new Error('数据库尚未就绪'); return runtime.DB as D1Database; };
export function identity(req: Request) { const id=req.headers.get('oai-authenticated-user-id'); if(!id) throw new Error('请先登录'); return id; }
export function sameOrigin(req:Request) { const origin=req.headers.get('origin'); if(origin!==new URL(req.url).origin) throw new Error('请求来源不正确'); }
export const json = (data:unknown,status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export function failure(error:unknown) { const msg=error instanceof Error?error.message:'操作失败'; return json({error:msg},msg==='请先登录'?401:400); }
export async function push(subscription:any, message:unknown) {
 const host=new URL(subscription.endpoint).hostname;
 if(!['push.apple.com','fcm.googleapis.com','updates.push.services.mozilla.com'].some(h=>host===h||host.endsWith('.'+h))) throw new Error('不支持的推送服务');
 const payload=await buildPushPayload({data:JSON.stringify(message),options:{ttl:3600}},subscription,{subject:runtime.VAPID_SUBJECT,publicKey:runtime.VAPID_PUBLIC_KEY,privateKey:runtime.VAPID_PRIVATE_KEY});
 return fetch(subscription.endpoint,{...payload,redirect:'error',signal:AbortSignal.timeout(15000)});
}
