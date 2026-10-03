import test from 'node:test';
import assert from 'node:assert/strict';
import {isAllowedCloudflareBuild} from '../scripts/project-command.mjs';
import {onRequest} from '../functions/_middleware.js';
if(!isAllowedCloudflareBuild()||process.env.CLOUDFLARE_BUILD_MODE!=='full')process.exit(1);
test('the password protects pages assets and vision calls without any email check',async()=>{
 for(const path of ['/','/_astro/private.js','/api/photo/guidance'])for(const value of [null,'wrong','allan44238587']){
  let next=0;
  const response=await onRequest({request:new Request('https://test'+path,{headers:value?{cookie:'__Host-test-site-access='+value}:{}}),env:{AUTH_SUPABASE_APP:{fetch:()=>assert.fail('Site access must not verify an Auth identity.')}},next:async()=>{next++;return new Response('private');}});
  assert.equal(next,value==='allan44238587'?1:0);
  assert.equal(response.status,value==='allan44238587'?200:401);
 }
});
