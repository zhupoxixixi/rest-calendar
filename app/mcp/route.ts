import { json } from '@/lib/server';
import { dispatch } from '@/lib/dispatch';
export async function POST(req:Request){
 const body=await req.json() as any;let result:any;
 if(body.method==='server/discover')result={supportedVersions:['2026-07-28'],capabilities:{tools:{}}};
 else if(body.method==='initialize')result={protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'rest-calendar',version:'1.0.0'}};
 else if(body.method==='tools/list')result={tools:[{name:'send_rest_reminders',description:'向订阅用户发送明天休班通知。每天韩国时间20:00调用。已发送的通知不会重复发送。dryRun=true 只检查，不发送。',inputSchema:{type:'object',properties:{dryRun:{type:'boolean'}},additionalProperties:false}}]};
 else if(body.method==='tools/call'&&body.params?.name==='send_rest_reminders'){try{result={content:[{type:'text',text:JSON.stringify(await dispatch(body.params.arguments?.dryRun===true))}]};}catch{result={content:[{type:'text',text:'推送任务失败，请检查服务配置'}],isError:true};}}
 else if(body.method?.startsWith('notifications/'))return new Response(null,{status:202});
 else return json({jsonrpc:'2.0',id:body.id,error:{code:-32601,message:'Method not found'}},400);
 return json({jsonrpc:'2.0',id:body.id,result});
}
