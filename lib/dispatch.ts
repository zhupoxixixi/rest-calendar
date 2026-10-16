import { db, push, runtime } from './server';
import { nextDate } from './calendar';
import { FALLBACK_COPY, generateReminderCopy } from './reminder-copy';

async function dailyCopy(day:string){
 const claim=await db().prepare("INSERT OR IGNORE INTO reminder_copy(day,status,created_at) VALUES(?,'processing',?)").bind(day,new Date().toISOString()).run();
 if(!claim.meta.changes){const cached=await db().prepare('SELECT message,status FROM reminder_copy WHERE day=?').bind(day).first<any>();return {message:cached?.message||FALLBACK_COPY,source:cached?.status==='model'?'cache':'fallback',modelCalled:false};}
 let message=FALLBACK_COPY,source='fallback';
 if(runtime.ROSTER_API_KEY){try{message=await generateReminderCopy({key:runtime.ROSTER_API_KEY,endpoint:runtime.ROSTER_API_ENDPOINT||'https://factchat-cloud.mindlogic.ai/v1/gateway',model:runtime.ROSTER_MODEL||'gpt-6-luna'});source='model';}catch{/* Keep reminders available if the model is unavailable. No automatic retry. */}}
 await db().prepare('UPDATE reminder_copy SET message=?,status=? WHERE day=?').bind(message,source,day).run();
 return {message,source,modelCalled:!!runtime.ROSTER_API_KEY};
}
export async function dispatch(dryRun=false) {
 const day=nextDate();
 const {results}=await db().prepare("SELECT user_id,endpoint,subscription FROM subscriptions WHERE enabled=1 AND user_id LIKE 'device:%' LIMIT 500").all<any>();
 let eligible=0,sent=0,failed=0;
 let copy:{message:string;source:string;modelCalled:boolean}|null=null;
 for(const row of results) {
  eligible++;
  if(dryRun) continue;
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(row.endpoint)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const id=day+':'+hash;
  const reservation=await db().prepare("INSERT OR IGNORE INTO deliveries(id,user_id,day,status,updated_at) VALUES(?,?,?,'sending',?)").bind(id,row.user_id,day,new Date().toISOString()).run();
  if(!reservation.meta.changes)continue;
  try{copy??=await dailyCopy(day);const res=await push(JSON.parse(row.subscription),{type:'daily-local',title:'明日安排',day,note:copy.message,tag:'rest-'+day});
   if(res.status===404||res.status===410) await db().prepare('DELETE FROM subscriptions WHERE endpoint=?').bind(row.endpoint).run();
   if(!res.ok)throw new Error('push failed');sent++;
   await db().prepare("UPDATE deliveries SET status='sent',updated_at=? WHERE id=?").bind(new Date().toISOString(),id).run();
  }catch{failed++;await db().prepare("UPDATE deliveries SET status='failed',updated_at=? WHERE id=?").bind(new Date().toISOString(),id).run();}
 }
 return {day,eligible,sent,failed,dryRun,model:runtime.ROSTER_MODEL||'gpt-6-luna',modelCalled:copy?.modelCalled||false,copySource:copy?.source||'not-needed'};
}
