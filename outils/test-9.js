const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html','.json':'application/json','.webp':'image/webp','.png':'image/png','.js':'text/javascript'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);
 if(p==='/')p='/index.html'; const f=path.join('/home/claude/app',p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});
 fs.createReadStream(f).pipe(r);});
(async()=>{await new Promise(r=>srv.listen(8099,r));
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},locale:'fr-FR'});
 const pg=await ctx.newPage();
 const err=[]; pg.on('pageerror',e=>err.push(e.message));
 await pg.goto('http://localhost:8099/',{waitUntil:'networkidle'});
 await pg.waitForTimeout(500);
 const res=await pg.evaluate(async()=>{
  const out=[];
  for(const id of Object.keys(ANIMS)){
    ouvrirExo(id);
    await new Promise(r=>setTimeout(r,320));
    const svg=document.querySelector('#det-body .vis-anim');
    const n=svg?svg.querySelectorAll('path').length:0;
    const vb=svg?svg.getAttribute('viewBox'):'—';
    const d1=svg?svg.querySelector('path').getAttribute('d'):'';
    await new Promise(r=>setTimeout(r,420));
    const d2=svg?svg.querySelector('path').getAttribute('d'):'';
    // longueurs d'os sur tout le cycle
    const A=ANIMS[id]; let ecart=0;
    for(let i=0;i<=20;i++){
      const P=etatP_(A,avancement_(A,i/20));
      for(const k in OS_){const o=OS_[k];
        ecart=Math.max(ecart,Math.abs(Math.hypot(P[o.a][0]-P[o.de][0],P[o.a][1]-P[o.de][1],P[o.a][2]-P[o.de][2])-o.L));}
    }
    out.push({id, nom:PAR_ID[id].nom, segments:n, anime:d1!==d2,
              ratio:+(svg.style.aspectRatio), ecart:+ecart.toFixed(4),
              forme:A.forme||"cycle"});
    document.querySelector('#det-x').click();
    await new Promise(r=>setTimeout(r,120));
  }
  return out;
 });
 console.log('exercice'.padEnd(34),'seg  animé  ratio  forme   écart os');
 for(const r of res) console.log(r.nom.padEnd(34), String(r.segments).padStart(3),
   String(r.anime).padStart(6), r.ratio.toFixed(2).padStart(6), r.forme.padEnd(7), r.ecart);
 console.log('\nerreurs JS :', err.length?err:'aucune');
 console.log('exercices animés :', res.length, '/ 131');
 await b.close(); srv.close();
})();
