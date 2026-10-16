export type Day = { day: number; label: string; kind: 'rest'|'work'|'custom'|'unknown'; note?: string };
export type Schedule = { name: string; month: string; days: Day[] };
export function monthKey(date = new Date()) { return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).format(date).slice(0,7); }
export function daysIn(month: string) { const [y,m]=month.split('-').map(Number); return new Date(Date.UTC(y,m,0)).getUTCDate(); }
export function validMonth(value: unknown): value is string { return typeof value==='string' && /^20\d\d-(0[1-9]|1[0-2])$/.test(value); }
export function validateSchedule(input: any, name: string, month: string): Schedule {
 if (!validMonth(month)||typeof name!=='string'||!name.trim()||name.length>40||!input || input.name !== name || input.month !== month || !Array.isArray(input.days) || input.days.length !== daysIn(month)) throw new Error('月份或天数不匹配，请检查班表');
 const seen=new Set<number>();
 const days=input.days.map((d:any) => {
  if (!Number.isInteger(d.day)||d.day<1||d.day>daysIn(month)||seen.has(d.day)||!['rest','work','custom','unknown'].includes(d.kind)||typeof d.label!=='string'||d.label.length>24||d.kind==='custom'&&!d.label.trim()) throw new Error('日期或班次内容无效');
  const label=d.label.trim();
  seen.add(d.day); return {day:d.day,label:label||'未设置',kind:d.kind==='custom'?'custom':({正:'work',值班:'work',正常:'work',休:'rest'} as Record<string,string>)[label]||d.kind,note:typeof d.note==='string'?d.note.slice(0,160):''};
 });
 return {name,month,days:days.sort((a:Day,b:Day)=>a.day-b.day)};
}
export function setDay(schedule:Schedule|null,month:string,day:number,kind:Day['kind'],label=''):Schedule {
 if(!validMonth(month)||!Number.isInteger(day)||day<1||day>daysIn(month))throw new Error('日期无效');
 const current=schedule?.month===month?validateSchedule(schedule,schedule.name,month):null;
 const days=current?.days||Array.from({length:daysIn(month)},(_,i)=>({day:i+1,label:'未设置',kind:'unknown' as const,note:''}));
 const text=kind==='work'?'上班':kind==='rest'?'休息':kind==='unknown'?'未设置':label.trim();
 const result={name:current?.name||'我的排班',month,days:days.map(d=>d.day===day?{day,label:text,kind,note:''}:d)};
 return validateSchedule(result,result.name,month);
}
export function nextDate(now=new Date()) { const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); const date=new Date(parts+'T12:00:00+09:00'); date.setUTCDate(date.getUTCDate()+1); return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date); }
