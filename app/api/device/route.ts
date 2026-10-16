import {db,runtime} from '@/lib/server';
import {checkOrigin,digest,ipHash,reply,options,apiError,deviceIdentity} from '@/lib/public-api';
import {monthKey} from '@/lib/calendar';
export const OPTIONS=options;
export async function POST(req:Request){try{
 checkOrigin(req);const {id,token}=await req.json() as any;
 if(!/^[a-f0-9-]{36}$/.test(id)||!/^[A-Za-z0-9_-]{40,50}$/.test(token))throw new Error('设备信息无效');
 const old=await db().prepare('SELECT token_hash FROM devices WHERE id=?').bind(id).first<any>();
 const hash=await digest(token);
 if(old){if(old.token_hash!==hash)throw new Error('设备凭据无效');return reply(req,{ok:true});}
 const originHash=await ipHash(req),start=monthKey()+'-01';
 const row=await db().prepare('INSERT OR IGNORE INTO devices(id,token_hash,origin_hash,created_at) SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM devices WHERE origin_hash=? AND created_at>=?)<20 AND (SELECT COUNT(*) FROM devices WHERE created_at>=?)<500').bind(id,hash,originHash,new Date().toISOString(),originHash,start,start).run();
 if(!row.meta.changes)return reply(req,{error:'本月新设备注册较多，请稍后再试'},429);
 return reply(req,{ok:true});
 }catch(e){return apiError(req,e);}}
export async function GET(req:Request){try{const user=await deviceIdentity(req);const row=await db().prepare('SELECT COUNT(*) used FROM imports WHERE user_id=? AND billing_month=?').bind(user,monthKey()).first<any>();return reply(req,{used:row?.used||0,limit:10,billingMonth:monthKey(),pushKey:runtime.VAPID_PUBLIC_KEY||null,recognitionReady:!!runtime.ROSTER_API_KEY});}catch(e){return apiError(req,e);}}
