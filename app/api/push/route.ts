import { db, push } from '@/lib/server';
import {deviceIdentity,reply,options,apiError} from '@/lib/public-api';
import {nextDate} from '@/lib/calendar';
export const OPTIONS=options;
export async function POST(req:Request) {try{
 const user=await deviceIdentity(req),{subscription,action}=await req.json() as any;
 if(!subscription?.endpoint||typeof subscription.endpoint!=='string'||subscription.endpoint.length>2048) throw new Error('通知订阅无效');
 const url=new URL(subscription.endpoint);
 if(url.protocol!=='https:'||!['push.apple.com','fcm.googleapis.com','updates.push.services.mozilla.com'].some(h=>url.hostname===h||url.hostname.endsWith('.'+h))) throw new Error('不支持的推送服务');
 if(action==='disable'){await db().prepare('DELETE FROM subscriptions WHERE endpoint=? AND user_id=?').bind(subscription.endpoint,user).run();return reply(req,{ok:true});}
 if(!/^[A-Za-z0-9_-]{86,88}$/.test(subscription.keys?.p256dh||'')||!/^[A-Za-z0-9_-]{22,24}$/.test(subscription.keys?.auth||'')) throw new Error('通知密钥无效');
 if(action==='test') {const stored=await db().prepare('SELECT endpoint FROM subscriptions WHERE endpoint=? AND user_id=?').bind(subscription.endpoint,user).first();if(!stored) throw new Error('请先开启通知');const sent=await push(subscription,{type:'local-test',day:nextDate(),note:'这是一条测试通知。',title:'明日安排',tag:'rest-test'});if(!sent.ok)throw new Error('推送服务未接受通知，请重新开启');return reply(req,{ok:true});}
 await db().prepare('INSERT INTO subscriptions(endpoint,user_id,subscription,enabled,created_at) VALUES(?,?,?,1,?) ON CONFLICT(endpoint) DO UPDATE SET user_id=excluded.user_id,subscription=excluded.subscription,enabled=1').bind(subscription.endpoint,user,JSON.stringify(subscription),new Date().toISOString()).run();
 return reply(req,{ok:true});
 }catch(e){return apiError(req,e);} }
