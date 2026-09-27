const clean = value => value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/<[^>]*>/g,'').trim();
export default async function handler(request){
  const sku=new URL(request.url).searchParams.get('sku')||'';
  if(!/^\d{5,9}$/.test(sku))return Response.json({error:'Ungültige Artikelnummer.'},{status:400,headers:{'Cache-Control':'no-store'}});
  try{
    const response=await fetch(`https://www.stampinup.de/products/${sku}`,{headers:{'User-Agent':'Mozilla/5.0 (compatible; KatysStempelfinder/1.0)'},signal:AbortSignal.timeout(6500)});
    if(!response.ok)throw Error('Produkt nicht im Herstellerkatalog');
    const html=(await response.text()).slice(0,350000);
    const title=clean(html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']+)/i)?.[1]||html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
    if(!title||/404|not found|stampin.up!\s*$/i.test(title))throw Error('Kein passender Produktname');
    return Response.json({name:title.replace(/\s*\|.*$/,'').replace(/\s*[-–]\s*Stampin.?\s*Up.*/i,'').trim(),source:'Stampin’ Up!',url:`https://www.stampinup.de/products/${sku}`},{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({error:'Beim Hersteller derzeit nicht gefunden. Das Set kann trotzdem mit einem Coverfoto erfasst werden.',searchUrl:`https://www.google.com/search?q=${encodeURIComponent('"'+sku+'" "Stampin Up" Stempelset')}`},{status:404,headers:{'Cache-Control':'no-store'}});}
}
