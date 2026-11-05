/* Pompe piquée : on cherche les deux poses ensemble, parce que la cible des
   mains est commune et que la cheville doit rester dans son amplitude (au
   moins 18° du tibia) en haut comme en bas. */
const fs=require("fs");
const F=new Function(fs.readFileSync("figure.js","utf8")+";return {etatExo,placer,projeter,OS};")();
const base={avant:[0,1],nom:"x",duree:3000,sens:-1,muscles:[],ancrage:"toe",ca:[70,94],cb:[70,94]};
const pos=(ang,cible)=>{const A=Object.assign({},base,{a:ang,b:ang,
  iks:[{chaine:["bras","avbras"],de:"shoulder",cible,signe:-1},
       {chaine:["bras2","avbras2"],de:"shoulder2",cible,signe:-1}]});
  const e=F.etatExo(A,0);return F.projeter(F.placer(e.angles,e.ex),0);};
const pen=(v,lo,hi)=>v<lo?lo-v:v>hi?v-hi:0;

/* --- pose haute : V inversé, hanche ~90°, bras presque tendu --- */
let hauts=[];
for(let leg=58;leg<=80;leg++) for(let pied=10;pied<=58;pied+=2){
  if(Math.abs(leg-pied)<19) continue;                   // amplitude de cheville
  for(const ouv of [90,94,98,102]){
  const tr=leg+ouv;
  const a={bassin:tr,tronc:tr,cou:tr-40,cuisse:leg,jambe:leg,pied};
  const p=pos(a,[30,92]);
  if(p.ankle[1]>93||p.ankle[1]<78){continue;}
  const mainX=p.shoulder[0], mainY=92;                  // main à l'aplomb de l'épaule
  const d=mainY-p.shoulder[1];
  const s=2*pen(d,33,35.3)+pen(p.hip[1],40,52)+0.5*pen(mainX,22,40)+0.05*(ouv-90);
  hauts.push({s:+s.toFixed(2),leg,pied,tr,ouv,cible:[+mainX.toFixed(1),92],
    hip:p.hip.map(v=>+v.toFixed(1)),bras:+d.toFixed(1)});}
}
hauts.sort((a,b)=>a.s-b.s);
console.log("pose haute, meilleures :");
for(const h of hauts.slice(0,4)) console.log(" ",JSON.stringify(h));

/* --- pose basse, pour la meilleure pose haute --- */
const H=hauts[0];
let bas=[];
for(let leg=38;leg<=66;leg++) for(let pied=0;pied<=60;pied+=2){
  if(Math.abs(leg-pied)<19) continue;
  if(Math.abs((H.leg-H.pied)-(leg-pied))>38) continue;  // battement de cheville
  for(let tr=95;tr<=150;tr+=2) for(let cou=100;cou<=175;cou+=5){
    const p=pos({bassin:tr,tronc:tr,cou,cuisse:leg,jambe:leg,pied},H.cible);
    const d=Math.hypot(p.shoulder[0]-H.cible[0],p.shoulder[1]-92);
    if(d<14||d>28) continue;
    if(p.ankle[1]>93||p.knee[1]>p.ankle[1]) continue;
    const s=2*pen(p.head[0],H.cible[0]-9,H.cible[0]-1)   // tête un peu en avant
           +2*pen(p.head[1],82,88)                        // basse, sans toucher
           +1.5*pen(p.hip[1],48,60)
           +1.5*pen(p.shoulder[1]-p.hip[1],13,24)
           +pen(tr-leg,58,85);
    bas.push({s:+s.toFixed(2),leg,pied,tr,cou,
      tete:p.head.map(v=>+v.toFixed(1)),hip:p.hip.map(v=>+v.toFixed(1)),
      ep:p.shoulder.map(v=>+v.toFixed(1)),bras:+d.toFixed(1)});
  }
}
bas.sort((a,b)=>a.s-b.s);
console.log("pose basse, meilleures :");
for(const b of bas.slice(0,4)) console.log(" ",JSON.stringify(b));
