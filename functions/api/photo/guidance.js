import { defaultAuthCookieNames } from 'website-auth-sdk/cloudflare-pages';
const {accessCookieName}=defaultAuthCookieNames('coffeeframe');
/** Root owner guard runs first. Only same-origin cookie-authenticated previews reach the private product API. */
export async function onRequest({request,env}) {
  const rid=request.headers.get('x-request-id');
  const fail=(status)=>Response.json({ok:false,rid,error:{code:'photo_guidance_failed',message:'Vision guidance unavailable.',category:'dependency',retryable:status>=500}},{status,headers:{'cache-control':'private, no-store','x-request-id':rid??''}});
  if(request.method!=='POST')return fail(405);
  if(new URL(request.url).search || !rid || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(rid))return fail(400);
  if(request.headers.get('origin')!==new URL(request.url).origin)return fail(403);
  const parts=(request.headers.get('cookie')??'').split(';').map(s=>s.trim());
  const cookie=parts.find(s=>s.startsWith(accessCookieName+'='));
  if(!cookie)return fail(401);
  let token;try{token=decodeURIComponent(cookie.slice(accessCookieName.length+1));}catch{return fail(401);}
  const controller=new AbortController(),abort=()=>controller.abort();
  request.signal.addEventListener('abort',abort,{once:true});if(request.signal.aborted)abort();
  const timer=setTimeout(abort,20000);
  try {
    const headers={'authorization':'Bearer '+token,'x-request-id':rid,'content-type':request.headers.get('content-type')??''};
    const upstream=await env.COFFEEFRAME_API.fetch('https://coffeeframe-api.internal/photo/guidance',{method:'POST',headers,body:request.body,signal:controller.signal,redirect:'manual'});
    if(upstream.status!==200){await upstream.body?.cancel();return fail([400,401,403,413,415,422,429].includes(upstream.status)?upstream.status:502);}
    const data=await upstream.json();
    if(upstream.headers.get('x-request-id')!==rid || data.ok!==true || data.rid!==rid || typeof data.frameId!=='string' || typeof data.guidance?.message!=='string' || data.guidance.message.length>180 || typeof data.guidance.ready!=='boolean')return fail(502);
    return Response.json({ok:true,rid,frameId:data.frameId,guidance:{message:data.guidance.message,ready:data.guidance.ready}},{headers:{'cache-control':'private, no-store','x-request-id':rid}});
  } catch{return fail(502);} finally{clearTimeout(timer);request.signal.removeEventListener('abort',abort);}
}
