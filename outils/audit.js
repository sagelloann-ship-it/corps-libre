/* CONTRÔLE ANATOMIQUE — version tridimensionnelle

   Invariant central, indépendant de toute convention d'orientation : une
   figure a une chiralité unique. Genou et coude sont des charnières : leur
   axe est médio-latéral. Tous les genoux plient donc dans le même sens,
   tous les coudes dans le sens OPPOSÉ — vrai debout, à plat ventre, sur le
   dos, à quatre pattes, et vrai aussi quand le membre sort du plan sagittal.

   Les angles étant désormais à deux composantes, la flexion d'une
   articulation est l'angle entre les deux vecteurs directeurs, signé par la
   composante médio-latérale de leur produit vectoriel. À latéral nul on
   retombe exactement sur l'ancienne mesure plane.

   S'y ajoutent les amplitudes de goniométrie courante — sagittales ET
   frontales — et le contrôle du battement des extrémités. */
const fs=require('fs');
const {poseA, avancement} = new Function(
  fs.readFileSync('/home/claude/anim/figure.js','utf8') + ';return {poseA, avancement};')();
const ANIMS = new Function(
  fs.readFileSync('/home/claude/anim/exercices.js','utf8') + ';return ANIMS;')();

const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
const vec=(g,l)=>{const G=rad(g),L=rad(l||0),c=Math.cos(L);
  return [Math.cos(G)*c, Math.sin(G)*c, Math.sin(L)];};
/* flexion signée : amplitude en 3D, signe donné par l'axe médio-latéral */
function flex(dp,dc){
  const x=dp[1]*dc[2]-dp[2]*dc[1], y=dp[2]*dc[0]-dp[0]*dc[2], z=dp[0]*dc[1]-dp[1]*dc[0];
  const s=Math.hypot(x,y,z), c=dp[0]*dc[0]+dp[1]*dc[1]+dp[2]*dc[2];
  const a=deg(Math.atan2(s,c));
  return z<0 ? -a : a;
}
/* écart au plan sagittal d'un os, compté positif en abduction.
   Le membre 1 est du côté z négatif, le membre 2 du côté z positif. */
/* Mesure absolue, non relative au bassin. La mesure relative paraît plus
   juste mais produit des faux positifs : un corps construit en pente
   uniforme — planche latérale — a des segments de tronc et de jambe aux
   latéraux de signes opposés, puisqu'ils vont dans des sens opposés le long
   du corps, alors que la hanche y est parfaitement alignée. */
const ecart=(l,second)=> (second? 1:-1) * (l||0);

const N=30, MORT=6;

/* Valeurs AAOS / APTA relevées :
   genou flexion 135-150 · coude 140-150 · hanche flexion 120-125,
   extension 20-30, abduction 40-45, adduction 20-30 — portée à 45 en
   passif, le genou croisant le corps dans les étirements du fessier ·
   épaule flexion 180, extension 50-60, adduction croisée 40-50 ·
   cheville dorsiflexion 20, flexion plantaire 50, soit 70 d'amplitude
   totale : un exercice peut déclarer `chevilleAmple` quand le mouvement
   la parcourt vraiment, comme la poussée d'un saut ·
   rachis cervical flexion 45-60, extension 45-75, inclinaison 45 ·
   rachis thoraco-lombaire flexion 45-80, extension 25, inclinaison 35-40.
   Marge de 5° accordée : ce sont des références, pas des bornes dures. */
const LIM={genou:150, coude:150, hancheMax:130, hancheMin:-30,
           epauleMax:180, epauleMin:-60, rachis:60, nuque:65,
           chevilleMin:18, chevilleMax:162, chevilleBat:40, chevilleBatSaut:75,
           hancheAbd:50, hancheAdd:-45, epauleAdd:-50,
           inclinaison:45, inclinaisonCou:50};

let anomalies=0, propres=[];
for(const cle of Object.keys(ANIMS)){
  const A=ANIMS[cle], pb=[], S={};
  const push=(k,v)=>{(S[k]=S[k]||[]).push(v);};
  for(let i=0;i<=N;i++){
    const g=poseA(A,avancement(A,i/N));
    const d=n=>vec(g[n], g[n+"L"]);
    push("genou",  flex(d("cuisse"),  d("jambe")));
    push("genou2", flex(d("cuisse2"), d("jambe2")));
    push("coude",  flex(d("bras"),    d("avbras")));
    push("coude2", flex(d("bras2"),   d("avbras2")));
    push("poignet",  flex(d("avbras"),  d("main")));
    push("poignet2", flex(d("avbras2"), d("main2")));
    push("cheville",  flex(d("jambe"),  d("pied")));
    push("cheville2", flex(d("jambe2"), d("pied2")));
    push("hanche",  180-Math.abs(flex(d("bassin"), d("cuisse"))));
    push("hanche2", 180-Math.abs(flex(d("bassin"), d("cuisse2"))));
    push("epaule",  180-Math.abs(flex(d("tronc"), d("bras"))));
    push("epaule2", 180-Math.abs(flex(d("tronc"), d("bras2"))));
    push("rachis", Math.abs(flex(d("bassin"), d("tronc"))));
    push("nuque",  Math.abs(flex(d("tronc"),  d("cou"))));
    /* plan frontal */
    push("abdHanche",  ecart(g.cuisseL,  false));
    push("abdHanche2", ecart(g.cuisse2L, true));
    push("abdEpaule",  ecart(g.brasL,  false));
    push("abdEpaule2", ecart(g.bras2L, true));
    push("inclBassin", Math.abs(g.bassinL||0));
    push("inclTronc",  Math.abs((g.troncL||0)-(g.bassinL||0)));
    push("inclCou",    Math.abs((g.couL||0)-(g.troncL||0)));
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
  for(const [k,lib] of [["poignet","poignet"],["poignet2","poignet opposé"]]){
    const amp=Math.max(Math.abs(mn(k)),Math.abs(mx(k)));
    if(amp>80) pb.push(`${lib} : ${amp.toFixed(0)}° de flexion (max 80°)`);
  }
  for(const [k,lib] of [["cheville","cheville"],["cheville2","cheville opposée"]]){
    const a=Math.abs(mn(k)), b=Math.abs(mx(k));
    const limBat = A.chevilleAmple ? LIM.chevilleBatSaut : LIM.chevilleBat;
    if(A.piedAuSol){ const bat0=mx(k)-mn(k);
      if(bat0>limBat) pb.push(`${lib} : bat de ${bat0.toFixed(0)}° par rapport au tibia`);
      continue; }
    if(Math.min(a,b)<LIM.chevilleMin) pb.push(`${lib} : ${Math.min(a,b).toFixed(0)}° du tibia, le pied s'aligne sur la jambe`);
    if(Math.max(a,b)>LIM.chevilleMax) pb.push(`${lib} : ${Math.max(a,b).toFixed(0)}° du tibia, angle impossible`);
    const bat=mx(k)-mn(k);
    if(bat>limBat) pb.push(`${lib} : bat de ${bat.toFixed(0)}° par rapport au tibia`);
  }
  for(const [k,lib,lo,hi] of [["hanche","hanche",LIM.hancheMin,LIM.hancheMax],
      ["hanche2","hanche opposée",LIM.hancheMin,LIM.hancheMax],
      ["epaule","épaule",LIM.epauleMin,LIM.epauleMax],
      ["epaule2","épaule opposée",LIM.epauleMin,LIM.epauleMax],
      ["rachis","rachis",0,LIM.rachis],["nuque","nuque",0,LIM.nuque],
      ["abdHanche","abduction de hanche",LIM.hancheAdd,LIM.hancheAbd],
      ["abdHanche2","abduction de hanche opposée",LIM.hancheAdd,LIM.hancheAbd],
      ["abdEpaule","écartement d'épaule",LIM.epauleAdd,100],
      ["abdEpaule2","écartement d'épaule opposée",LIM.epauleAdd,100],
      ["inclBassin","inclinaison du bassin",0,LIM.inclinaison],
      ["inclTronc","inclinaison latérale du buste",0,LIM.inclinaison],
      ["inclCou","inclinaison latérale du cou",0,LIM.inclinaisonCou]]){
    if(mn(k)<lo-1) pb.push(`${lib} : ${mn(k).toFixed(0)}° (min ${lo}°)`);
    if(mx(k)>hi+1) pb.push(`${lib} : ${mx(k).toFixed(0)}° (max ${hi}°)`);
  }
  if(pb.length){ anomalies+=pb.length; console.log('\n⚠  '+(A.nom||cle)); pb.forEach(x=>console.log('      '+x)); }
  else propres.push(A.nom||cle);
}
console.log('\n────────');
console.log('conformes : '+propres.length+' / '+Object.keys(ANIMS).length+(propres.length?'  ('+propres.join(', ')+')':''));
console.log(anomalies+' anomalie(s) à corriger.');
