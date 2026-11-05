const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html','.json':'application/json','.webp':'image/webp','.png':'image/png','.js':'text/javascript'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);
 if(p==='/')p='/index.html'; const f=path.join('/home/claude/app',p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
 r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});
 fs.createReadStream(f).pipe(r);});
(async()=>{await new Promise(r=>srv.listen(8094,r));
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844}});
 const pg=await ctx.newPage(); const er=[]; pg.on('pageerror',e=>er.push(e.message));
 await pg.goto('http://localhost:8094/',{waitUntil:'networkidle'}); await pg.waitForTimeout(400);
 const res=await pg.evaluate(async()=>{
  const pires=[];
  for(const id of Object.keys(ANIMS)){
   const A=ANIMS[id];
   const f={A, el:{}, noms:ORDRE_.slice(), propre:true, ordre:"",
            ordreGrp:GROUPES_.map(g=>g.n), svg:{appendChild(){}},
            t0:0, dernier:0, q:0, pause:false, surCycle:null};
   for(const n of ORDRE_) f.el[n]={_a:{},setAttribute(k,v){this._a[k]=v},getAttribute(k){return this._a[k]}};
   const prec={}; let n=0;
   for(let i=0;i<120;i++){
     f.t0=-i*(A.duree/120); dessinerFig(f, 0);
     for(const nom in f.el){ const c=f.el[nom].getAttribute('fill');
       if(prec[nom]!==undefined && prec[nom]!==c) n++; prec[nom]=c; }
   }
   pires.push([id,n]);
  }
  pires.sort((a,b)=>b[1]-a[1]);
  return {pires:pires.slice(0,6), total:pires.reduce((s,x)=>s+x[1],0), nb:pires.length};
 });
 console.log('changements de teinte sur 120 images, les 6 pires :');
 for(const [id,n] of res.pires) console.log('  ', id.padEnd(36), n);
 console.log('total sur', res.nb, 'exercices :', res.total);
 console.log('erreurs :', er.length?er:'aucune');
 await b.close(); srv.close();})();
