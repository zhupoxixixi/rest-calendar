export type Day = { day: number; label: string; kind: 'rest'|'work'|'unknown'; note?: string };
export type Schedule = { name: string; month: string; days: Day[] };
export function monthKey(date = new Date()) { return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).format(date).slice(0,7); }
export function daysIn(month: string) { const [y,m]=month.split('-').map(Number); return new Date(Date.UTC(y,m,0)).getUTCDate(); }
export function validMonth(value: unknown): value is string { return typeof value==='string' && /^20\d\d-(0[1-9]|1[0-2])$/.test(value); }
export function validateSchedule(input: any, name: string, month: string): Schedule {
 if (!input || input.name !== name || input.month !== month || !Array.isArray(input.days) || input.days.length !== daysIn(month)) throw new Error('姓名、月份或天数不匹配，请核对图片后重试');
 const seen=new Set<number>();
 const days=input.days.map((d:any) => {
  if (!Number.isInteger(d.day)||d.day<1||d.day>daysIn(month)||seen.has(d.day)||!['rest','work','unknown'].includes(d.kind)||typeof d.label!=='string'||d.label.length>24) throw new Error('识别结果不完整，请使用清晰完整的月度排班表');
  seen.add(d.day); return {day:d.day,label:d.label.trim()||'待确认',kind:({正:'work',值班:'work',正常:'work',休:'rest'} as Record<string,string>)[d.label.trim()]||d.kind,note:typeof d.note==='string'?d.note.slice(0,160):''};
 });
 return {name,month,days:days.sort((a:Day,b:Day)=>a.day-b.day)};
}
export function nextDate(now=new Date()) { const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now); const date=new Date(parts+'T12:00:00+09:00'); date.setUTCDate(date.getUTCDate()+1); return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date); }
