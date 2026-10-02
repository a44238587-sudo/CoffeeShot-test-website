import test from 'node:test';
import assert from 'node:assert/strict';
import {isAllowedCloudflareBuild} from '../scripts/project-command.mjs';
import {onRequest} from '../functions/_middleware.js';
import {defaultAuthCookieNames} from 'website-auth-sdk/cloudflare-pages';
if(!isAllowedCloudflareBuild()||process.env.CLOUDFLARE_BUILD_MODE!=='full')process.exit(1);
test('owner gate protects pages assets and vision calls before downstream execution',async()=>{
 const rid='owner-contract',cookie=defaultAuthCookieNames('coffeeframe').accessCookieName;
 for(const path of ['/','/_astro/private.js','/api/photo/guidance'])for(const identity of ['anonymous','other','unverified','owner']){
  let next=0;
  const response=await onRequest({request:new Request('https://test'+path,{headers:{'x-request-id':rid,...(identity==='anonymous'?{}:{cookie:cookie+'=fixture'})}}),env:{AUTH_SUPABASE_APP:{fetch:async()=>Response.json({ok:true,rid,valid:true,user:{email:identity==='other'?'other@example.com':'a44238587@gmail.com',emailConfirmedAt:identity==='unverified'?null:'2026-01-01T00:00:00Z'}})}},next:async()=>{next++;return new Response('private');}});
  assert.equal(next,identity==='owner'?1:0);
  assert.equal(response.status,identity==='owner'?200:identity==='anonymous'?401:403);
  assert.match(response.headers.get('cache-control'),/no-store/);
 }
});
