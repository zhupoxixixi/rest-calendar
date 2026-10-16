import { db, identity, runtime, json, failure } from '@/lib/server';
import { monthKey, validMonth } from '@/lib/calendar';
export async function GET(req:Request) { try {
 const user=identity(req),month=new URL(req.url).searchParams.get('month')||monthKey(); if(!validMonth(month)) throw new Error('月份无效');
 const [row,quota,sub]=await Promise.all([
 db().prepare('SELECT * FROM schedules WHERE user_id=? AND month=?').bind(user,month).first<any>(),
 db().prepare('SELECT COUNT(*) AS used FROM imports WHERE user_id=? AND billing_month=?').bind(user,monthKey()).first<any>(),
 db().prepare('SELECT COUNT(*) AS total FROM subscriptions WHERE user_id=? AND enabled=1').bind(user).first<any>()]);
 return json({schedule:row?{name:row.name,month:row.month,days:JSON.parse(row.days),updatedAt:row.updated_at}:null,used:quota?.used||0,limit:10,billingMonth:monthKey(),pushKey:runtime.VAPID_PUBLIC_KEY||null,pushEnabled:!!sub?.total,recognitionReady:!!runtime.ROSTER_API_KEY});
 }catch(e){return failure(e);} }
