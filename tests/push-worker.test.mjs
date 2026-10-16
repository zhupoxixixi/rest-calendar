import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';

const built=await build({stdin:{contents:`import {push} from './lib/server.ts'; export default {async fetch(req){try{const response=await push(await req.json(),{type:'local-test',title:'明日安排'});return Response.json({status:response.status,ok:response.ok});}catch(e){return Response.json({error:e.message},{status:500});}}};`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'browser',external:['cloudflare:workers']});
const signing=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
const privateKey=await crypto.subtle.exportKey('jwk',signing.privateKey);
const b64=value=>Buffer.from(value).toString('base64url');
const bindings={VAPID_SUBJECT:'mailto:test@example.com',VAPID_PUBLIC_KEY:b64(await crypto.subtle.exportKey('raw',signing.publicKey)),VAPID_PRIVATE_KEY:privateKey.d};
const recipient=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
const subscription={endpoint:'https://web.push.apple.com/test-only',keys:{p256dh:b64(await crypto.subtle.exportKey('raw',recipient.publicKey)),auth:b64(crypto.getRandomValues(new Uint8Array(16)))}};

test('push runs in Workers; redirects never forward encrypted payload or authorization',async t=>{
 for(const status of [201,302,404,410])await t.test('provider status '+status,async()=>{
  const requests=[];
  const mf=new Miniflare({modules:true,script:built.outputFiles[0].text,compatibilityDate:'2026-05-15',bindings,outboundService:async req=>{requests.push({url:req.url,authorization:req.headers.get('Authorization'),body:await req.arrayBuffer()});return new Response(null,{status,headers:status===302?{Location:'https://other.example.test/leak'}:{}});}});
  try{const response=await mf.dispatchFetch('https://worker.test/',{method:'POST',body:JSON.stringify(subscription)});const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));assert.deepEqual(data,{status,ok:status===201});assert.equal(requests.length,1);assert.equal(requests[0].url,subscription.endpoint);assert.ok(requests[0].authorization);assert.ok(requests[0].body.byteLength>0);}finally{await mf.dispose();}
 });
});
