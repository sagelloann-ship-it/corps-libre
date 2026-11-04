/* Moteur d'animation — squelette à membres indépendants.

   Longueurs d'os calées sur Drillis & Contini (1966), en fraction de la
   taille H : bras 0,186 H · avant-bras+main 0,254 H · cuisse 0,245 H ·
   jambe 0,246 H · tronc hanche-épaule 0,288 H · tête 0,130 H.
   Ici H = 81,5 unités, sol à y = 95, cheville à 0,039 H du sol.

   Longueurs d'os FIXES, poses décrites par des angles. Chaque membre existe
   en deux exemplaires : le membre proche (bras, cuisse…) et le membre
   éloigné (bras2, cuisse2…). Si les angles du second ne sont pas donnés, il
   recopie le premier avec un léger décalage de profondeur. Donnés, il prend
   sa propre position — ce qui permet les fentes, les appuis asymétriques et
   les mouvements d'un seul côté.

   Angles en degrés, convention écran : 0 = droite, 90 = bas, -90 = haut. */

const OS = {
  bassin:{de:"hip",     a:"chest",    L:10.5, r:[4.85,4.40]},
  tronc: {de:"chest",   a:"shoulder", L:13,   r:[5.61,6.25]},
  cou:   {de:"shoulder",a:"head",     L:9.5,  r:[2.70,2.33]},
  bras:  {de:"shoulder",a:"elbow",    L:15, r:[3.90,2.92]},
  avbras:{de:"elbow",   a:"hand",     L:20.5, r:[2.78,1.80]},
  cuisse:{de:"hip",     a:"knee",     L:20,   r:[5.55,3.38]},
  jambe: {de:"knee",    a:"ankle",    L:20,   r:[3.60,1.95]},
  pied:  {de:"ankle",   a:"toe",      L:9,  r:[2.17,1.50]},
  bras2:  {de:"shoulder",a:"elbow2",  L:15, r:[3.90,2.92]},
  avbras2:{de:"elbow2",  a:"hand2",   L:20.5, r:[2.78,1.80]},
  cuisse2:{de:"hip",     a:"knee2",   L:20,   r:[5.55,3.38]},
  jambe2: {de:"knee2",   a:"ankle2",  L:20,   r:[3.60,1.95]},
  pied2:  {de:"ankle2",  a:"toe2",    L:9,  r:[2.17,1.50]}
};
const CHAINE = ["bassin","tronc","cou","bras","avbras","cuisse","jambe","pied",
                "bras2","avbras2","cuisse2","jambe2","pied2"];
const MIROIR = {bras2:"bras", avbras2:"avbras", cuisse2:"cuisse", jambe2:"jambe", pied2:"pied"};

/* membres éloignés d'abord, puis tronc et tête, puis membres proches */
const ORDRE = [
  {os:"cuisse2",fond:1},{os:"jambe2",fond:1},{os:"pied2",fond:1},
  {os:"bras2",fond:1},{os:"avbras2",fond:1},
  {os:"bassin"},{os:"tronc"},{os:"cou"},{tete:1},
  {os:"cuisse"},{os:"jambe"},{os:"pied"},{os:"bras"},{os:"avbras"}
];
const TETE = {rx:4.4, ry:5.3};
const DECAL = [-2.6, 1.3];      // profondeur quand le membre éloigné recopie l'autre
const DECAL_PROPRE = [-1.0, 0.6];// profondeur quand il a ses propres angles

const rad = d => d * Math.PI / 180;

function complet(angles){
  const a = Object.assign({}, angles);
  for (const k in MIROIR) if (a[k] === undefined) a[k] = a[MIROIR[k]];
  return a;
}
function squelette(angles, ancrage, cible){
  const a = complet(angles), P = {hip:[0,0]};
  for (const n of CHAINE){
    const o = OS[n], g = rad(a[n]), b = P[o.de];
    P[o.a] = [b[0] + o.L*Math.cos(g), b[1] + o.L*Math.sin(g)];
  }
  const dx = cible[0]-P[ancrage][0], dy = cible[1]-P[ancrage][1];
  for (const k in P){ P[k][0] += dx; P[k][1] += dy; }
  return P;
}
function ik2(O,T,L1,L2,s){
  let d = Math.hypot(T[0]-O[0], T[1]-O[1]);
  const mn = Math.abs(L1-L2)+0.001, mx = L1+L2-0.001;
  d = Math.max(mn, Math.min(mx, d));
  const v = Math.atan2(T[1]-O[1], T[0]-O[0]);
  let c = (d*d + L1*L1 - L2*L2)/(2*d*L1); c = Math.max(-1, Math.min(1, c));
  const a1 = v + s*Math.acos(c), J = [O[0]+L1*Math.cos(a1), O[1]+L1*Math.sin(a1)];
  return [a1*180/Math.PI, Math.atan2(T[1]-J[1], T[0]-J[0])*180/Math.PI];
}
function placer(angles, ex){
  let a = complet(angles);
  for (const k of (ex.iks || (ex.ik ? [ex.ik] : []))){
    const P = squelette(a, ex.ancrage, ex.cibleAnc);
    const s = ik2(P[k.de], k.cible, OS[k.chaine[0]].L, OS[k.chaine[1]].L, k.signe);
    a[k.chaine[0]] = s[0]; a[k.chaine[1]] = s[1];
  }
  if (ex.appui){
    const g = dd => { const z = Object.assign({}, a);
      for (const k of ex.appui.leviers) z[k] += dd;
      return squelette(z, ex.ancrage, ex.cibleAnc); };
    let lo=-70, hi=70, fl=g(lo)[ex.appui.pt][1]-ex.appui.y, fh=g(hi)[ex.appui.pt][1]-ex.appui.y;
    if (fl*fh <= 0) for (let i=0;i<32;i++){ const md=(lo+hi)/2, fm=g(md)[ex.appui.pt][1]-ex.appui.y;
      if (fl*fm <= 0){hi=md;fh=fm;} else {lo=md;fl=fm;} }
    return g((lo+hi)/2);
  }
  return squelette(a, ex.ancrage, ex.cibleAnc);
}
function fuseau(A,B,ra,rb){
  const dx=B[0]-A[0], dy=B[1]-A[1], L=Math.hypot(dx,dy);
  if (L<0.001 || L<=Math.abs(ra-rb)){ const K = ra>rb?A:B, r = Math.max(ra,rb);
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
function melAngle(a,b,u){ const d=((b-a+180)%360+360)%360-180; return a+d*u; }
function melAngles(A,B,u){
  const a=complet(A), b=complet(B), o={};
  for (const k in a) o[k] = melAngle(a[k], b[k], u);
  return o;
}

/* Courbe temporelle.

   "cycle"  : aller-retour continu — un mouvement répété.
   "tenue"  : entrée en position, maintien avec une respiration à peine
              perceptible, puis retour. C'est la forme juste pour un
              étirement ou un gainage, où il n'y a rien à répéter. */
function avancement(A, q){
  if (A.forme !== "tenue") return (1 - Math.cos(2*Math.PI*q)) / 2;
  const e = A.entree || 0.17, s = A.sortie || 0.84, r = A.respir === undefined ? 0.022 : A.respir;
  const doux = t => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) / 2;
  if (q < e) return doux(q / e);
  if (q > s) return 1 - doux((q - s) / (1 - s));
  const dans = (q - e) / (s - e);
  return 1 - r * (1 - Math.cos(2 * Math.PI * 2 * dans)) / 2;
}
