import { dispatch } from '@/lib/dispatch';
import { json, failure, sameOrigin } from '@/lib/server';

// This shared maintenance endpoint is protected by the Site's owner-only
// dispatch access policy. Keep the Site private; public sharing requires
// adding an explicit maintenance authorization mechanism first.
// /mcp is reserved by Sites. Use this path for unattended service access.
export async function POST(req:Request){try{
 if(req.headers.has('origin'))sameOrigin(req);
 const body=await req.json() as {dryRun?:boolean};
 if(typeof body.dryRun!=='boolean')throw new Error('请指定 dryRun');
 return json(await dispatch(body.dryRun));
}catch(e){return failure(e);}}
