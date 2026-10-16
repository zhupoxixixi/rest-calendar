import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateReminderCopy} from '../lib/reminder-copy.ts';
const settings={key:'test-key',endpoint:'https://example.test/v1/gateway',model:'gpt-6-luna'};
test('uses the configured gateway and Luna; sends no roster or personal data',async()=>{
 let calls=0;
 const message=await generateReminderCopy(settings,async(url,options)=>{
  calls++;assert.equal(url,'https://example.test/v1/gateway/chat/completions');
  const body=JSON.parse(options.body);assert.equal(body.model,'gpt-6-luna');assert.equal(body.reasoning_effort,'none');assert.equal(body.max_completion_tokens,200);
  assert.equal(options.headers.Authorization,'Bearer test-key');
  return Response.json({choices:[{message:{content:'{"message":"明天好好休息，给自己留一点时间。"}'}}]});
 });
 assert.equal(calls,1);assert.equal(message,'明天好好休息，给自己留一点时间。');
});
test('rejects fabricated dates and URLs',async()=>{
 for(const message of ['明天 2026-10-17 休班','点击 https://example.test 查看','休']){
  await assert.rejects(()=>generateReminderCopy(settings,async()=>Response.json({choices:[{message:{content:JSON.stringify({message})}}]})));
 }
});
test('does not retry API errors',async()=>{
 let calls=0;await assert.rejects(()=>generateReminderCopy(settings,async()=>{calls++;return new Response('',{status:429});}));assert.equal(calls,1);
});
