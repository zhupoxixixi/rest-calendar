import { dispatch } from '@/lib/dispatch';
import { json, failure, runtime, db } from '@/lib/server';

// This shared maintenance endpoint is protected by the Site's owner-only
// dispatch access policy. Keep the Site private; public sharing requires
// adding an explicit maintenance authorization mechanism first.
// /mcp is reserved by Sites. Use this path for unattended service access.
export async function POST(req:Request){try{
 const token=req.headers.get('x-reminder-key');
 if(!token)return json({managedBy:'github-actions',sent:0,failed:0,copySource:'not-needed'});
 if(!runtime.CRON_TOKEN||token!==runtime.CRON_TOKEN)return json({error:'Unauthorized'},403);
 const body=await req.json() as {dryRun?:boolean;action?:string};
 if(body.action==='storage-audit'){const schedules=await db().prepare('SELECT COUNT(*) n FROM schedules').first<any>();const results=await db().prepare('SELECT COUNT(*) n FROM imports WHERE result IS NOT NULL').first<any>();return json({legacySchedules:schedules?.n||0,legacyResults:results?.n||0});}
 if(typeof body.dryRun!=='boolean')throw new Error('请指定 dryRun');
 return json(await dispatch(body.dryRun));
}catch(e){return failure(e);}}
