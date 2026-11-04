/* CONTRÔLE ANATOMIQUE

   Invariant central, indépendant de toute convention d'orientation : une
   figure vue de profil a une chiralité unique. Tous les genoux plient dans
   le même sens, tous les coudes dans le sens OPPOSÉ. C'est vrai debout, à
   plat ventre, sur le dos ou à quatre pattes.

   S'y ajoutent les amplitudes de goniométrie courante, et un contrôle des
   extrémités : les angles du modèle étant absolus, un pied immobile par
   rapport au tibia doit quand même voir son angle évoluer — sans quoi il bat
   tout seul, ou s'aligne sur le tibia comme s'il n'y avait pas de cheville. */
const fs=require('fs');
const {melAngles, avancement} = new Function(
  fs.readFileSync('/home/claude/anim/figure.js','utf8') + ';return {melAngles, avancement};')();
const ANIMS = new Function(
  fs.readFileSync('/home/claude/anim/exercices.js','utf8') + ';return ANIMS;')();

const rel=(a,b)=>{let d=((b-a+180)%360+360)%360-180;return d;};
const N=30, MORT=6;

/* Valeurs AAOS / APTA relevées :
   genou flexion 135-150 · coude 140-150 · hanche flexion 120-125,
   extension 20-30 · épaule flexion 180, extension 50-60 ·
   cheville dorsiflexion 20, flexion plantaire 50 ·
   rachis cervical flexion 45-60, extension 45-75 ·
   rachis thoraco-lombaire flexion 45-80, extension 25.
   Marge de 5° accordée : ce sont des références, pas des bornes dures. */
const LIM={genou:150, coude:150, hancheMax:130, hancheMin:-30,
           epauleMax:180, epauleMin:-60, rachis:60, nuque:65,
           chevilleMin:18, chevilleMax:162, chevilleBat:40};

let anomalies=0, propres=[];
for(const cle of Object.keys(ANIMS)){
  const A=ANIMS[cle], pb=[], S={};
  const push=(k,v)=>{(S[k]=S[k]||[]).push(v);};
  for(let i=0;i<=N;i++){
    const g=melAngles(A.a,A.b,avancement(A,i/N));
    push("genou",  rel(g.cuisse,  g.jambe));
    push("genou2", rel(g.cuisse2, g.jambe2));
    push("coude",  rel(g.bras,    g.avbras));
    push("coude2", rel(g.bras2,   g.avbras2));
    push("cheville",  rel(g.jambe,  g.pied));
    push("cheville2", rel(g.jambe2, g.pied2));
    push("hanche",  180-Math.abs(rel(g.bassin, g.cuisse)));
    push("hanche2", 180-Math.abs(rel(g.bassin, g.cuisse2)));
    push("epaule",  180-Math.abs(rel(g.tronc, g.bras)));
    push("epaule2", 180-Math.abs(rel(g.tronc, g.bras2)));
    push("rachis", Math.abs(rel(g.bassin, g.tronc)));
    push("nuque",  Math.abs(rel(g.tronc,  g.cou)));
  }
  const mn=k=>Math.min(...S[k]), mx=k=>Math.max(...S[k]);
  const signes=k=>[...new Set(S[k].filter(v=>Math.abs(v)>MORT).map(Math.sign))];

  // chiralité : déduite des genoux, à défaut des coudes
  let chi=0;
  for(const k of ["genou","genou2"]){ const s=signes(k); if(s.length===1 && !chi) chi=s[0];
    if(s.length>1) pb.push(`${k} plie dans les deux sens au cours du cycle`); }
  if(!chi) for(const k of ["coude","coude2"]){ const s=signes(k); if(s.length===1 && !chi) chi=-s[0]; }

  if(chi){
    for(const k of ["genou","genou2"]){ const s=signes(k);
      if(s.length===1 && s[0]!==chi) pb.push(`${k} plie à l'envers (${mn(k).toFixed(0)}° à ${mx(k).toFixed(0)}°)`); }
    for(const k of ["coude","coude2"]){ const s=signes(k);
      if(s.length>1) pb.push(`${k} plie dans les deux sens`);
      else if(s.length===1 && s[0]!==-chi) pb.push(`${k} plie à l'envers (${mn(k).toFixed(0)}° à ${mx(k).toFixed(0)}°)`); }
  }
  for(const [k,lib] of [["genou","genou"],["genou2","genou opposé"],["coude","coude"],["coude2","coude opposé"]]){
    const amp=Math.max(Math.abs(mn(k)),Math.abs(mx(k)));
    const lim=k.startsWith("genou")?LIM.genou:LIM.coude;
    if(amp>lim+1) pb.push(`${lib} : ${amp.toFixed(0)}° de flexion (max ${lim}°)`);
  }
  for(const [k,lib] of [["cheville","cheville"],["cheville2","cheville opposée"]]){
    const a=Math.abs(mn(k)), b=Math.abs(mx(k));
    if(A.piedAuSol){ const bat0=mx(k)-mn(k);
      if(bat0>LIM.chevilleBat) pb.push(`${lib} : bat de ${bat0.toFixed(0)}° par rapport au tibia`);
      continue; }
    if(Math.min(a,b)<LIM.chevilleMin) pb.push(`${lib} : ${Math.min(a,b).toFixed(0)}° du tibia, le pied s'aligne sur la jambe`);
    if(Math.max(a,b)>LIM.chevilleMax) pb.push(`${lib} : ${Math.max(a,b).toFixed(0)}° du tibia, angle impossible`);
    const bat=mx(k)-mn(k);
    if(bat>LIM.chevilleBat) pb.push(`${lib} : bat de ${bat.toFixed(0)}° par rapport au tibia`);
  }
  for(const [k,lib,lo,hi] of [["hanche","hanche",LIM.hancheMin,LIM.hancheMax],
      ["hanche2","hanche opposée",LIM.hancheMin,LIM.hancheMax],
      ["epaule","épaule",LIM.epauleMin,LIM.epauleMax],
      ["epaule2","épaule opposée",LIM.epauleMin,LIM.epauleMax],
      ["rachis","rachis",0,LIM.rachis],["nuque","nuque",0,LIM.nuque]]){
    if(mn(k)<lo-1) pb.push(`${lib} : ${mn(k).toFixed(0)}° (min ${lo}°)`);
    if(mx(k)>hi+1) pb.push(`${lib} : ${mx(k).toFixed(0)}° (max ${hi}°)`);
  }
  if(pb.length){ anomalies+=pb.length; console.log('\n⚠  '+(A.nom||cle)); pb.forEach(x=>console.log('      '+x)); }
  else propres.push(A.nom||cle);
}
console.log('\n────────');
console.log('conformes : '+propres.length+' / '+Object.keys(ANIMS).length+(propres.length?'  ('+propres.join(', ')+')':''));
console.log(anomalies+' anomalie(s) à corriger.');
