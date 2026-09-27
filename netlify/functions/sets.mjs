import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';
import seed from '../seed.mjs';

const headers = { 'Cache-Control':'no-store', 'Content-Type':'application/json; charset=utf-8' };
const respond = (data,status=200) => new Response(JSON.stringify(data),{status,headers});
const validSku = sku => /^\d{5,9}$/.test(sku);
const checkPassword = candidate => {
  const secret=process.env.NETLIFY_ADMIN_PASSWORD;
  if(!secret || secret.length<12) return false;
  const a=Buffer.from(candidate||''),b=Buffer.from(secret);
  return a.length===b.length && timingSafeEqual(a,b);
};

export default async function handler(request) {
  if(request.method==='GET') {
    try {
      const store=getStore({name:'katys-stamp-sets',consistency:'strong'});
      const {blobs}=await store.list({prefix:'sets/'});
      const sets=[];
      for(let i=0;i<blobs.length;i+=25) {
        const page=await Promise.all(blobs.slice(i,i+25).map(({key})=>store.get(key,{type:'json'})));
        sets.push(...page.filter(Boolean));
      }
      return respond(sets);
    } catch(e) { console.error('Sets GET',e); return respond({error:'Der gemeinsame Bestand ist gerade nicht erreichbar.'},503); }
  }
  if(request.method!=='POST') return respond({error:'Methode nicht erlaubt.'},405);
  if(!process.env.NETLIFY_ADMIN_PASSWORD || process.env.NETLIFY_ADMIN_PASSWORD.length<12) return respond({error:'Der Administrator muss zuerst NETLIFY_ADMIN_PASSWORD auf Netlify festlegen (mindestens 12 Zeichen).'},503);
  if(!checkPassword(request.headers.get('X-Admin-Password'))) return respond({error:'Admin-Passwort falsch.'},401);
  if(Number(request.headers.get('content-length')||0)>3_000_000) return respond({error:'Das Cover ist zu groß. Bitte ein kleineres Foto wählen.'},413);
  try {
    const form=await request.formData();
    const string=k=>String(form.get(k)||'').trim();
    const sku=string('sku').replace(/\s/g,'');
    const name=string('name');
    if(!validSku(sku)||!name||name.length>150) return respond({error:'Bitte Namen und gültige Artikelnummer eingeben.'},400);
    if(seed.some(s=>s.sku===sku)) return respond({error:'Diese Artikelnummer gehört bereits zum Startbestand.'},409);
    const store=getStore({name:'katys-stamp-sets',consistency:'strong'});
    const images=getStore({name:'katys-stamp-covers',consistency:'strong'});
    if(await store.get(`sets/${sku}`)) return respond({error:'Diese Artikelnummer ist bereits erfasst.'},409);
    const file=form.get('image');
    let key='',imageKey='';
    if(file instanceof File && file.size){
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2_000_000) return respond({error:'Bitte ein JPG-, PNG- oder WebP-Cover bis 2 MB auswählen.'},400);
      const bytes=new Uint8Array(await file.arrayBuffer());
      const jpg=file.type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216;
      const png=file.type==='image/png'&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
      const webp=file.type==='image/webp'&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
      if(!jpg&&!png&&!webp) return respond({error:'Das Cover hat kein gültiges Bildformat.'},400);
      key=`covers/${crypto.randomUUID()}`;
      await images.set(key,file,{metadata:{contentType:file.type}});
      imageKey=`/.netlify/functions/image?id=${key.split('/')[1]}`;
    }
    const record={sku,name,motifs:string('motifs').slice(0,1000),topics:string('topics').slice(0,1000),phrases:string('phrases').split(/\n|;/).map(s=>s.trim()).filter(Boolean).slice(0,50),location:string('location').slice(0,150),imageKey,createdAt:new Date().toISOString()};
    try {
      const {modified}=await store.setJSON(`sets/${sku}`,record,{onlyIfNew:true});
      if(!modified) {if(key)await images.delete(key);return respond({error:'Diese Artikelnummer ist bereits erfasst.'},409);}
    } catch(e) {if(key)await images.delete(key).catch(()=>{});throw e;}
    return respond(record,201);
  } catch(e) {console.error('Sets POST',e);return respond({error:'Set konnte nicht gespeichert werden.'},500);}
}
