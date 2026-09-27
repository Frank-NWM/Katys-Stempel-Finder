import { getStore } from '@netlify/blobs';
export default async function handler(request) {
  if(request.method!=='GET')return new Response('Methode nicht erlaubt',{status:405});
  const id=new URL(request.url).searchParams.get('id')||'';
  if(!/^[0-9a-f-]{36}$/i.test(id))return new Response('Nicht gefunden',{status:404});
  try {
    const store=getStore({name:'katys-stamp-covers',consistency:'strong'});
    const entry=await store.getWithMetadata(`covers/${id}`,{type:'arrayBuffer'});
    if(!entry)return new Response('Nicht gefunden',{status:404});
    const type=entry.metadata?.contentType;
    return new Response(entry.data,{headers:{'Content-Type':['image/jpeg','image/png','image/webp'].includes(type)?type:'image/jpeg','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch(e){console.error('Image GET',e);return new Response('Cover nicht erreichbar',{status:503});}
}
