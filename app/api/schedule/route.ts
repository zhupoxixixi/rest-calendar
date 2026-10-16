import { db, identity, sameOrigin, json, failure } from '@/lib/server';
import { validateSchedule, validMonth } from '@/lib/calendar';
export async function POST(req:Request) {try{
 sameOrigin(req);const user=identity(req),body=await req.json() as any;
 if(!validMonth(body.month)||typeof body.name!=='string'||!body.name.trim()||body.name.length>40) throw new Error('姓名或月份无效');
 const schedule=validateSchedule(body,body.name.trim(),body.month);
 if(schedule.days.some(d=>d.kind==='unknown')) throw new Error('请先确认所有待核对日期，再保存');
 const key=user+':'+schedule.month;
 await db().prepare('INSERT INTO schedules(id,user_id,month,name,days,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,days=excluded.days,updated_at=excluded.updated_at').bind(key,user,schedule.month,schedule.name,JSON.stringify(schedule.days),new Date().toISOString()).run();
 return json({ok:true});
 }catch(e){return failure(e);} }
