const aAnim = id => !!ANIMS[id];

const rad_ = d => d*Math.PI/180, deg_ = r => r*180/Math.PI;
function dir_(g,l){ const G=rad_(g), L=rad_(l||0), c=Math.cos(L);
  return [Math.cos(G)*c, Math.sin(G)*c, Math.sin(L)]; }
function angl_(v){ const L=Math.hypot(v[0],v[1],v[2])||1;
  return [deg_(Math.atan2(v[1],v[0])), deg_(Math.asin(Math.max(-1,Math.min(1,v[2]/L))))]; }
function rouler_(v,r){ if(!r) return v; const R=rad_(r),c=Math.cos(R),s=Math.sin(R);
  return [v[0], v[1]*c-v[2]*s, v[1]*s+v[2]*c]; }
function complet_(ang){
  const a = Object.assign({}, ang);
  for (const k in MIROIR_){ const s=MIROIR_[k];
    if (a[k]===undefined) a[k]=a[s];
    if (a[k+"L"]===undefined) a[k+"L"]=-(a[s+"L"]||0); }
  for (const p in SUITE_){ const m=SUITE_[p];
    if (a[m]===undefined) a[m]=a[p];
    if (a[m+"L"]===undefined) a[m+"L"]=a[p+"L"]||0; }
  return a;
}
function squel_(ang, anc, cib, ro){
  const a = complet_(ang), P = {bassin0:[0,0,0]};
  P.hip=[0,0,-HA_EC_]; P.hip2=[0,0,HA_EC_];
  const pose = n => { const o=OS_[n], b=P[o.de], d=dir_(a[n], a[n+"L"]);
    P[o.a]=[b[0]+o.L*d[0], b[1]+o.L*d[1], b[2]+o.L*d[2]]; };
  pose("bassin"); pose("tronc");
  const dy=a.epauleDy||0, dy2=a.epauleDy2===undefined?dy:a.epauleDy2;
  const dx=a.epauleDx||0, dx2=a.epauleDx2===undefined?dx:a.epauleDx2;
  P.shoulder =[P.nuque[0]+dx, P.nuque[1]+dy, P.nuque[2]-EP_EC_];
  P.shoulder2=[P.nuque[0]+dx2,P.nuque[1]+dy2,P.nuque[2]+EP_EC_];
  for (const n of CHAINE_) if (n!=="bassin" && n!=="tronc") pose(n);
  if (ro) for (const k in P) P[k]=rouler_(P[k], ro);
  const c=[cib[0], cib[1], cib.length>2?cib[2]:P[anc][2]];
  const t=[c[0]-P[anc][0], c[1]-P[anc][1], c[2]-P[anc][2]];
  for (const k in P){ P[k][0]+=t[0]; P[k][1]+=t[1]; P[k][2]+=t[2]; }
  return P;
}
function ik2_(O,T,L1,L2,s,n){
  const N=n||[0,0,1];
  let v=[T[0]-O[0],T[1]-O[1],T[2]-O[2]], d=Math.hypot(v[0],v[1],v[2]);
  if (d<0.0001){ v=[1,0,0]; d=1; }
  const dc=Math.max(Math.abs(L1-L2)+0.001, Math.min(L1+L2-0.001, d));
  const u=[v[0]/d,v[1]/d,v[2]/d];
  let p=[N[1]*u[2]-N[2]*u[1], N[2]*u[0]-N[0]*u[2], N[0]*u[1]-N[1]*u[0]];
  let lp=Math.hypot(p[0],p[1],p[2]);
  if (lp<0.0001){ const al=Math.abs(u[0])<0.9?[1,0,0]:[0,1,0];
    p=[al[1]*u[2]-al[2]*u[1], al[2]*u[0]-al[0]*u[2], al[0]*u[1]-al[1]*u[0]];
    lp=Math.hypot(p[0],p[1],p[2]); }
  p=[p[0]/lp,p[1]/lp,p[2]/lp];
  let c=(dc*dc+L1*L1-L2*L2)/(2*dc*L1); c=Math.max(-1,Math.min(1,c));
  const a1=Math.acos(c), co=Math.cos(a1), si=Math.sin(a1)*s;
  const w=[u[0]*co+p[0]*si, u[1]*co+p[1]*si, u[2]*co+p[2]*si];
  const J=[O[0]+L1*w[0], O[1]+L1*w[1], O[2]+L1*w[2]];
  return [angl_(w), angl_([T[0]-J[0],T[1]-J[1],T[2]-J[2]])];
}
function racine_(de, premier){
  if (!/2$/.test(premier)) return de;
  if (de==="hip") return "hip2";
  if (de==="shoulder") return "shoulder2";
  return de;
}
function placer_(ang, A){
  const a = complet_(ang), ro = A.roCourant || 0;
  const anc = A.ciCourant || A.ci;
  for (const k of (A.iks||[])){
    const P = squel_(a, A.ancrage, anc, ro);
    const n1=k.ch[0], n2=k.ch[1];
    let L2 = OS_[n2].L; const su = SUITE_[n2];
    if (su && k.ch.length<3) L2 += OS_[su].L;
    const cib = k.cibCourante || k.cible;
    const O = P[racine_(k.de, n1)];
    const T = [cib[0], cib[1], cib.length>2?cib[2]:O[2]];
    const s = ik2_(O, T, OS_[n1].L, L2, k.signe, rouler_(k.nrm||[0,0,1], ro));
    const d1 = angl_(rouler_(dir_(s[0][0],s[0][1]), -ro));
    const d2 = angl_(rouler_(dir_(s[1][0],s[1][1]), -ro));
    a[n1]=d1[0]; a[n1+"L"]=d1[1]; a[n2]=d2[0]; a[n2+"L"]=d2[1];
    if (su && k.ch.length<3){ a[su]=d2[0]; a[su+"L"]=d2[1]; }
  }
  if (A.appui){
    const g = dd => { const z=Object.assign({},a);
      for (const k of A.appui.lev) z[k]+=dd;
      return squel_(z, A.ancrage, anc, ro); };
    let lo=-70, hi=70, fl=g(lo)[A.appui.pt][1]-A.appui.y, fh=g(hi)[A.appui.pt][1]-A.appui.y;
    if (fl*fh<=0) for (let i=0;i<30;i++){ const md=(lo+hi)/2, fm=g(md)[A.appui.pt][1]-A.appui.y;
      if (fl*fm<=0){hi=md;fh=fm;} else {lo=md;fl=fm;} }
    return g((lo+hi)/2);
  }
  return squel_(a, A.ancrage, anc, ro);
}
function projeter_(P, az){
  const A=rad_(az||0), c=Math.cos(A), s=Math.sin(A), Q={};
  for (const k in P){ const p=P[k]; Q[k]=[p[0]*c+p[2]*s, p[1], -p[0]*s+p[2]*c]; }
  return Q;
}
function fuseau_(A,B,ra,rb){
  const dx=B[0]-A[0], dy=B[1]-A[1], L=Math.hypot(dx,dy);
  if (L<0.001 || L<=Math.abs(ra-rb)){ const K=ra>rb?A:B, r=Math.max(ra,rb);
    return `M ${K[0]-r} ${K[1]} a ${r} ${r} 0 1 0 ${2*r} 0 a ${r} ${r} 0 1 0 ${-2*r} 0 Z`; }
  const phi=Math.atan2(dy,dx), al=Math.acos((ra-rb)/L);
  const p=(K,r,g)=>[K[0]+r*Math.cos(g), K[1]+r*Math.sin(g)];
  const P1=p(A,ra,phi+al),P2=p(B,rb,phi+al),P3=p(B,rb,phi-al),P4=p(A,ra,phi-al);
  const gB=(2*al>Math.PI)?1:0, gA=(al<Math.PI/2)?1:0;
  return `M ${P1[0].toFixed(2)} ${P1[1].toFixed(2)} L ${P2[0].toFixed(2)} ${P2[1].toFixed(2)}`
   +` A ${rb} ${rb} 0 ${gB} 0 ${P3[0].toFixed(2)} ${P3[1].toFixed(2)}`
   +` L ${P4[0].toFixed(2)} ${P4[1].toFixed(2)}`
   +` A ${ra} ${ra} 0 ${gA} 0 ${P1[0].toFixed(2)} ${P1[1].toFixed(2)} Z`;
}
function melAngle_(a,b,u){ const d=((b-a+180)%360+360)%360-180; return a+d*u; }
function melAngles_(A,B,u){
  const a=complet_(A), b=complet_(B), o={};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])){
    const lat=/L\d*$/.test(k), tr=/D[xy]\d*$/.test(k);
    const va=a[k]!==undefined?a[k]:((lat||tr)?0:b[k]);
    const vb=b[k]!==undefined?b[k]:((lat||tr)?0:a[k]);
    o[k]= tr ? va+(vb-va)*u : melAngle_(va,vb,u);
  }
  return o;
}
/* poses multiples : un cercle ou un saut demandent plus de deux clés */
function segment_(n,u){ const x=((u%1)+1)%1*n, i=Math.min(n-1,Math.floor(x)); return [i,(i+1)%n,x-i]; }
function lerpPt_(a,b,t){ return a.map((v,i)=>v+(b[i]-v)*t); }
function poseA_(A,u){ if(!A.poses) return melAngles_(A.a,A.b,u);
  const [i,j,t]=segment_(A.poses.length,u); return melAngles_(A.poses[i],A.poses[j],t); }
function ancreA_(A,u){ if(A.ancres){ const [i,j,t]=segment_(A.ancres.length,u); return lerpPt_(A.ancres[i],A.ancres[j],t); }
  return A.cf ? lerpPt_(A.ci,A.cf,u) : A.ci; }
function cibleA_(k,u){ if(k.cibles){ const [i,j,t]=segment_(k.cibles.length,u); return lerpPt_(k.cibles[i],k.cibles[j],t); }
  if(k.ciA) return lerpPt_(k.ciA,k.ciB,u); return k.cible; }
function roulisA_(A,u){ const r=A.ro; if(Array.isArray(r)){ const [i,j,t]=segment_(r.length,u); return melAngle_(r[i],r[j],t); } return r||0; }
/* état complet à l'instant u : angles, ancre, cibles, roulis */
function etatExo_(A,u){
  const ex = Object.assign({}, A);
  ex.ciCourant = ancreA_(A,u);
  ex.roCourant = roulisA_(A,u);
  if (A.iks) ex.iks = A.iks.map(k => Object.assign({}, k, {cibCourante: cibleA_(k,u)}));
  return {angles: poseA_(A,u), ex};
}
function etatP_(A,u){ const e=etatExo_(A,u); return projeter_(placer_(e.angles,e.ex), A.az); }

/* Courbe temporelle.
   "cycle" (défaut) : aller-retour continu, pour un mouvement répété.
   "tenue" : entrée, maintien avec une respiration à peine perceptible, sortie.
   "boucle" : parcours monotone des poses, pour un cercle ou un saut. */
function avancement_(A, q){
  if (A.forme === "boucle") return ((q%1)+1)%1;
  if (A.forme !== "tenue") return (1 - Math.cos(2*Math.PI*q)) / 2;
  const e = A.entree || 0.17, s = A.sortie || 0.84;
  const r = (A.respir === undefined) ? 0.022 : A.respir;
  const doux = t => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) / 2;
  if (q < e) return doux(q / e);
  if (q > s) return 1 - doux((q - s) / (1 - s));
  return 1 - r * (1 - Math.cos(4 * Math.PI * (q - e) / (s - e))) / 2;
}

/* registre des figures visibles + une seule boucle d'animation */
const FIGS = [];
const NSVG = "http://www.w3.org/2000/svg";

/* Cadrage automatique sur l'emprise réelle du mouvement : une pompe, large
   et plate, n'occupe pas la même boîte qu'un squat debout. */
function cadrer_(A){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for (let i=0;i<=14;i++){
    const P = etatP_(A, avancement_(A, i/14));
    for (const k in P){
      x0=Math.min(x0,P[k][0]); x1=Math.max(x1,P[k][0]);
      y0=Math.min(y0,P[k][1]); y1=Math.max(y1,P[k][1]);
    }
  }
  const m=9.5;
  x0-=m; x1+=m; y0-=m; y1=Math.max(y1+m, 98);
  return [x0, y0, x1-x0, y1-y0];
}

function activerAnims(racine){
  for (let i=FIGS.length-1;i>=0;i--) if (!FIGS[i].svg.isConnected) FIGS.splice(i,1);
  (racine||document).querySelectorAll("svg.vis-anim[data-anim]").forEach(svg => {
    if (svg.dataset.pret) return;
    const A = ANIMS[svg.dataset.anim]; if (!A) return;
    svg.dataset.pret = "1";
    const bb = cadrer_(A);
    svg.setAttribute("viewBox", bb.map(v => v.toFixed(1)).join(" "));
    svg.style.aspectRatio = String(Math.max(0.8, Math.min(3.2, bb[2]/bb[3])));
    const sol = document.createElementNS(NSVG,"line");
    sol.setAttribute("x1",bb[0]+2); sol.setAttribute("y1",95);
    sol.setAttribute("x2",bb[0]+bb[2]-2); sol.setAttribute("y2",95);
    sol.setAttribute("stroke","#2a3444"); sol.setAttribute("stroke-width",0.8);
    svg.appendChild(sol);
    const noms = ORDRE_.slice();
    const el = {};
    for (const n of noms){
      const o = document.createElementNS(NSVG, n==="tete" ? "ellipse" : "path");
      o.setAttribute("stroke-width", 1.1);
      o.setAttribute("stroke-linejoin","round");
      if (n==="tete"){ o.setAttribute("rx",TETE_.rx); o.setAttribute("ry",TETE_.ry); }
      svg.appendChild(o); el[n]=o;
    }
    const prem = A.poses ? A.poses[0] : A.a;
    const propre = prem.cuisse2 !== undefined || prem.bras2 !== undefined;
    FIGS.push({svg, A, el, noms, propre, ordre:"", t0:performance.now(),
               dernier:performance.now(), q:0, pause:false, surCycle:null});
  });
}
function figureDe(svg){ return FIGS.find(f => f.svg === svg) || null; }

function dessinerFig(f, now){
  if (f.pause){ f.t0 += now - f.dernier; }
  f.dernier = now;
  const A = f.A, q = ((now - f.t0) % A.duree) / A.duree;
  // une boucle n'est bouclée que si la phase retombe franchement de ~1 à ~0 ;
  // une simple micro-baisse ne doit pas compter une répétition
  if (q < f.q - 0.5 && f.surCycle){ try{ f.surCycle(); }catch(e){} }
  f.q = q;
  const P = etatP_(A, avancement_(A, q));
  const plat = !A.az;
  const base = f.propre ? DECP_ : DEC_, D = [base[0]*A.sens, base[1]];
  const median = (P.bassin0[2]+P.nuque[2])/2;
  const k = A.az ? 1 + (LARG_TR_-1)*Math.abs(Math.sin(rad_(A.az))) : 1;
  /* tri en profondeur, du plus lointain au plus proche */
  const rang = f.noms.map(n => {
    const z = n==="tete" ? (P.nuque[2]+P.head[2])/2
                         : (P[OS_[n].de][2]+P[OS_[n].a][2])/2;
    return {n, z};
  });
  rang.sort((a,b)=> (b.z-a.z) || (ORDRE_.indexOf(a.n)-ORDRE_.indexOf(b.n)));
  const cle = rang.map(r=>r.n).join(",");
  if (cle !== f.ordre){ f.ordre = cle; for (const r of rang) f.svg.appendChild(f.el[r.n]); }
  for (const r of rang){
    const n = r.n, o = f.el[n], fond = r.z > median + 4, d = (plat && fond) ? D : [0,0];
    const vif = n!=="tete" && A.m.indexOf(n) >= 0;
    o.setAttribute("fill", vif ? (fond?COUL_.hd:COUL_.hf) : (fond?COUL_.d:COUL_.f));
    o.setAttribute("stroke", vif ? COUL_.ho : COUL_.o);
    if (n==="tete"){
      const g = Math.atan2(P.head[1]-P.nuque[1], P.head[0]-P.nuque[0])*180/Math.PI + 90;
      const cx=P.head[0]+d[0], cy=P.head[1]+d[1];
      o.setAttribute("cx",cx); o.setAttribute("cy",cy);
      o.setAttribute("transform",`rotate(${g.toFixed(1)},${cx},${cy})`);
      continue;
    }
    const os = OS_[n], e = os.tr ? k : 1;
    o.setAttribute("d", fuseau_([P[os.de][0]+d[0],P[os.de][1]+d[1]],
                                [P[os.a][0]+d[0],P[os.a][1]+d[1]], os.r[0]*e, os.r[1]*e));
  }
}
(function boucleAnim(now){
  for (const f of FIGS) dessinerFig(f, now);
  requestAnimationFrame(boucleAnim);
})(performance.now());
