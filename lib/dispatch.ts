import { db, push } from './server';
import { nextDate } from './calendar';
export async function dispatch(dryRun=false) {
 const day=nextDate(), month=day.slice(0,7), num=Number(day.slice(8));
 const {results}=await db().prepare('SELECT s.user_id,s.name,s.days,p.endpoint,p.subscription FROM schedules s JOIN subscriptions p ON p.user_id=s.user_id WHERE s.month=? AND p.enabled=1 LIMIT 500').bind(month).all<any>();
 let eligible=0,sent=0,failed=0;
 for(const row of results) {
  const item=JSON.parse(row.days).find((d:any)=>d.day===num);if(item?.kind!=='rest')continue;eligible++;
  if(dryRun) continue;
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(row.endpoint)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const id=day+':'+hash;
  const reservation=await db().prepare("INSERT OR IGNORE INTO deliveries(id,user_id,day,status,updated_at) VALUES(?,?,?,'sending',?)").bind(id,row.user_id,day,new Date().toISOString()).run();
  if(!reservation.meta.changes)continue;
  try{const res=await push(JSON.parse(row.subscription),{title:'明天休班',body:row.name+'，'+day+' 是'+item.label+'。好好休息。',tag:'rest-'+day,url:'/'});
   if(res.status===404||res.status===410) await db().prepare('DELETE FROM subscriptions WHERE endpoint=?').bind(row.endpoint).run();
   if(!res.ok)throw new Error('push failed');sent++;
   await db().prepare("UPDATE deliveries SET status='sent',updated_at=? WHERE id=?").bind(new Date().toISOString(),id).run();
  }catch{failed++;await db().prepare("UPDATE deliveries SET status='failed',updated_at=? WHERE id=?").bind(new Date().toISOString(),id).run();}
 }
 return {day,eligible,sent,failed,dryRun};
}
