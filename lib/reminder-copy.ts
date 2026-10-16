export const FALLBACK_COPY='好好休息，给自己留一点时间。';
export async function generateReminderCopy(settings:{key:string;endpoint:string;model:string}, fetcher:typeof fetch=fetch):Promise<string>{
 const endpoint=settings.endpoint.replace(/\/$/,'');
 const response=await fetcher(endpoint.endsWith('/chat/completions')?endpoint:endpoint+'/chat/completions',{
  method:'POST',headers:{Authorization:'Bearer '+settings.key,'Content-Type':'application/json'},signal:AbortSignal.timeout(20000),
  body:JSON.stringify({model:settings.model,reasoning_effort:'none',max_completion_tokens:200,messages:[
   {role:'system',content:'生成中文休班提醒的温和短句。不要包含姓名、日期、数字、具体班次、链接或额外建议，不许推断排班。仅返回 JSON 对象 {"message":"短句"}，短句限 8 到 30 个汉字及中文标点。'},
   {role:'user',content:'对明天休班的人说一句简短、自然的祝福。'}
  ]})
 });
 if(!response.ok)throw new Error('Reminder model HTTP '+response.status);
 const data=await response.json() as any;
 const content=data.choices?.[0]?.message?.content;
 if(typeof content!=='string')throw new Error('Reminder model returned no content');
 const parsed=JSON.parse(content.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));
 const message=parsed?.message;
 if(typeof message!=='string'||message.length<8||message.length>40||!/^\p{Script=Han}[\p{Script=Han}，。！、；：\s]+$/u.test(message))throw new Error('Invalid reminder copy');
 return message.trim();
}
