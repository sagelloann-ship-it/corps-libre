/* Remplace la seule table ANIMS dans l'application, le moteur restant en
   place (ses sources temporaires n'existent plus). */
const fs=require("fs"), crypto=require("crypto");
const A=new Function(fs.readFileSync(__dirname+"/exercices.js","utf8")+";return ANIMS;")();
const CH="/home/claude/app/index.html";
let app=fs.readFileSync(CH,"utf8");
const ids=[...app.matchAll(/"id":"([^"]+)"/g)].map(m=>m[1]);
const abs=Object.keys(A).filter(k=>!ids.includes(k));
if(abs.length){ console.log("!! ids absents de la bibliothèque :",abs); process.exit(1); }
const lignes=Object.keys(A).map(k=>{
  const o=A[k], r={duree:o.duree,sens:o.sens,m:o.muscles,ancrage:o.ancrage};
  if(o.ancres) r.ancres=o.ancres;
  else { r.ci=o.ca; if(o.cb&&(o.cb[0]!==o.ca[0]||o.cb[1]!==o.ca[1])) r.cf=o.cb; }
  if(o.azimut) r.az=o.azimut;
  if(o.roulis) r.ro=o.roulis;
  if(o.forme) r.forme=o.forme;
  if(o.respir!==undefined) r.respir=o.respir;
  if(o.mur!==undefined) r.mur=o.mur;
  if(o.appui) r.appui={pt:o.appui.pt,y:o.appui.y,lev:o.appui.leviers};
  if(o.iks) r.iks=o.iks.map(i=>{
    const j={ch:i.chaine,de:i.de,signe:i.signe};
    if(i.cibles) j.cibles=i.cibles;
    else if(i.cibleA){ j.ciA=i.cibleA; j.ciB=i.cibleB; }
    else j.cible=i.cible;
    if(i.normale) j.nrm=i.normale;
    return j;});
  if(o.poses) r.poses=o.poses; else { r.a=o.a; r.b=o.b; }
  return JSON.stringify(k)+":"+JSON.stringify(r);});
const d=app.indexOf("const ANIMS = {"), f=app.indexOf("\n};",d)+3;
if(d<0||f<3){ console.log("!! repères introuvables"); process.exit(1); }
app=app.slice(0,d)+"const ANIMS = {\n"+lignes.join(",\n")+"\n};\n"+app.slice(f);
const anc=/VERSION_APP\s*=\s*"([^"]+)"/.exec(app)[1];
const num=(parseInt(anc.replace(/^v/,""))||17)+1;
const neuf="v"+num+"-"+crypto.createHash("sha1").update(app).digest("hex").slice(0,6);
app=app.replace('"'+anc+'"','"'+neuf+'"');
fs.writeFileSync(CH,app);
console.log("animations portées :",lignes.length,"|",anc,"->",neuf);
