/* Moteur d'animation — squelette tridimensionnel, caméra orientable.

   Longueurs d'os calées sur Drillis & Contini (1966), en fraction de la
   taille H : bras 0,186 H · avant-bras 0,146 H · main 0,108 H ·
   cuisse 0,245 H · jambe 0,246 H · tronc hanche-épaule 0,288 H ·
   tête 0,130 H. Ici H = 81,5 unités, sol à y = 95.

   ANGLES. Chaque os est orienté par deux angles ABSOLUS, en degrés :
     g   — angle sagittal, convention écran : 0 = droite, 90 = bas, -90 = haut
     lat — sortie du plan sagittal, 0 = dans le plan, ±90 = vers / loin du
           spectateur. Clé « <os>L » dans la pose ; absente vaut 0.
   Direction = (cos g · cos lat, sin g · cos lat, sin lat).
   À lat = 0 on retrouve exactement l'ancien moteur plan.

   CAMÉRA. `azimut` fait tourner la figure autour de la verticale avant
   projection orthographique. 0 = profil, 90 = face, 35 = trois quarts.

   MEMBRES. Deux exemplaires de chaque membre. Le second, sans angles
   propres, recopie le premier — avec le latéral inversé, ce qui donne une
   pose symétrique. Les racines des membres sont écartées de la ligne
   médiane : épaules à ±10, hanches à ±7,8. Invisible de profil, c'est ce
   qui donne sa largeur à la vue de face.

   ÉPAULES. `epauleDy` descend ou remonte la racine des bras sans toucher
   au cou — c'est une translation de l'omoplate sur le gril costal, pas une
   rotation. Vaut 0 par défaut. */

const OS = {
  bassin: {de:"bassin0", a:"chest",    L:10.5, r:[4.85,4.40], tronc:1},
  tronc:  {de:"chest",   a:"nuque",    L:13,   r:[5.61,6.25], tronc:1},
  cou:    {de:"nuque",   a:"head",     L:9.5,  r:[2.70,2.33]},
  bras:   {de:"shoulder", a:"elbow",   L:15,   r:[3.90,2.92]},
  avbras: {de:"elbow",    a:"poignet", L:11.9, r:[2.78,2.21]},
  main:   {de:"poignet",  a:"hand",    L:8.6,  r:[2.21,1.80]},
  cuisse: {de:"hip",      a:"knee",    L:20,   r:[5.55,3.38]},
  jambe:  {de:"knee",     a:"ankle",   L:20,   r:[3.60,1.95]},
  pied:   {de:"ankle",    a:"toe",     L:9,    r:[2.17,1.50]},
  bras2:  {de:"shoulder2",a:"elbow2",  L:15,   r:[3.90,2.92]},
  avbras2:{de:"elbow2",   a:"poignet2",L:11.9, r:[2.78,2.21]},
  main2:  {de:"poignet2", a:"hand2",   L:8.6,  r:[2.21,1.80]},
  cuisse2:{de:"hip2",     a:"knee2",   L:20,   r:[5.55,3.38]},
  jambe2: {de:"knee2",    a:"ankle2",  L:20,   r:[3.60,1.95]},
  pied2:  {de:"ankle2",   a:"toe2",    L:9,    r:[2.17,1.50]}
};
const CHAINE = ["bassin","tronc","cou","bras","avbras","main","cuisse","jambe","pied",
                "bras2","avbras2","main2","cuisse2","jambe2","pied2"];
const MIROIR = {bras2:"bras", avbras2:"avbras", main2:"main",
                cuisse2:"cuisse", jambe2:"jambe", pied2:"pied"};
/* os qui prolonge le précédent quand il n'a pas d'angle propre : sa longueur
   s'ajoute à la portée de la cinématique inverse */
const SUITE = {avbras:"main", avbras2:"main2"};

/* ordre de départage quand deux os sont à la même profondeur */
const ORDRE = ["cuisse2","jambe2","pied2","bras2","avbras2","main2",
               "bassin","tronc","cou","tete",
               "cuisse","jambe","pied","bras","avbras","main"];

const TETE = {rx:4.4, ry:5.3};
const DECAL = [-2.6, 1.3];       // parallaxe de style, vue de profil seulement
const DECAL_PROPRE = [-1.0, 0.6];
const ECART_EPAULE = 10.0;       // demi-largeur biacromiale
const ECART_HANCHE = 7.8;        // demi-largeur bi-iliaque
const LARGEUR_TRONC = 1.22;      // le buste est plus large que profond

const rad = d => d * Math.PI / 180;
const deg = r => r * 180 / Math.PI;

/* direction unitaire d'un os à partir de ses deux angles */
function dir(g, lat){
  const G = rad(g), L = rad(lat || 0), c = Math.cos(L);
  return [Math.cos(G)*c, Math.sin(G)*c, Math.sin(L)];
}
function complet(angles){
  const a = Object.assign({}, angles);
  for (const k in MIROIR){
    const src = MIROIR[k];
    if (a[k] === undefined) a[k] = a[src];
    if (a[k+"L"] === undefined) a[k+"L"] = -(a[src+"L"] || 0);
  }
  /* la main prolonge l'avant-bras tant qu'on ne lui donne rien */
  for (const [p, m] of Object.entries(SUITE)){
    if (a[m] === undefined) a[m] = a[p];
    if (a[m+"L"] === undefined) a[m+"L"] = a[p+"L"] || 0;
  }
  return a;
}

/* roulis : rotation du corps entier autour de l'axe avant-arrière de l'écran.
   90° couche une figure debout sur le flanc. Le sol reste horizontal, la
   translation d'ancrage venant après. */
function rouler(v, r){
  if (!r) return v;
  const R = rad(r), c = Math.cos(R), s = Math.sin(R);
  return [v[0], v[1]*c - v[2]*s, v[1]*s + v[2]*c];
}
const derouler = (v, r) => rouler(v, -r);

function squelette(angles, ancrage, cible, roulis){
  const a = complet(angles);
  const P = {bassin0:[0,0,0]};
  P.hip  = [0, 0, -ECART_HANCHE];
  P.hip2 = [0, 0,  ECART_HANCHE];
  const pose = n => {
    const o = OS[n], b = P[o.de], d = dir(a[n], a[n+"L"]);
    P[o.a] = [b[0]+o.L*d[0], b[1]+o.L*d[1], b[2]+o.L*d[2]];
  };
  pose("bassin"); pose("tronc");
  /* l'omoplate glisse sur le gril costal : une translation, pas une rotation.
     dy monte ou descend l'épaule, dx l'avance ou la recule. */
  const dy  = a.epauleDy  || 0, dy2 = a.epauleDy2 === undefined ? dy : a.epauleDy2;
  const dx  = a.epauleDx  || 0, dx2 = a.epauleDx2 === undefined ? dx : a.epauleDx2;
  P.shoulder  = [P.nuque[0]+dx,  P.nuque[1]+dy,  P.nuque[2]-ECART_EPAULE];
  P.shoulder2 = [P.nuque[0]+dx2, P.nuque[1]+dy2, P.nuque[2]+ECART_EPAULE];
  for (const n of CHAINE) if (n !== "bassin" && n !== "tronc") pose(n);
  if (roulis) for (const k in P) P[k] = rouler(P[k], roulis);

  const c = [cible[0], cible[1], cible.length > 2 ? cible[2] : P[ancrage][2]];
  const t = [c[0]-P[ancrage][0], c[1]-P[ancrage][1], c[2]-P[ancrage][2]];
  for (const k in P){ P[k][0]+=t[0]; P[k][1]+=t[1]; P[k][2]+=t[2]; }
  return P;
}

/* Cinématique inverse à deux segments, dans le plan de normale n.
   Par défaut n = l'axe de profondeur : on retrouve alors au signe près la
   formule plane d'origine, ce qui garde les anciens exercices intacts. */
function ik2(O, T, L1, L2, s, n){
  const N = n || [0,0,1];
  let v = [T[0]-O[0], T[1]-O[1], T[2]-O[2]];
  let d = Math.hypot(v[0], v[1], v[2]);
  const mn = Math.abs(L1-L2)+0.001, mx = L1+L2-0.001;
  if (d < 0.0001){ v = [1,0,0]; d = 1; }
  const dc = Math.max(mn, Math.min(mx, d));
  const u = [v[0]/d, v[1]/d, v[2]/d];
  /* perpendiculaire à u dans le plan : p = normale ∧ u */
  let p = [N[1]*u[2]-N[2]*u[1], N[2]*u[0]-N[0]*u[2], N[0]*u[1]-N[1]*u[0]];
  let lp = Math.hypot(p[0], p[1], p[2]);
  if (lp < 0.0001){ /* u colinéaire à la normale : plan indéterminé */
    const alt = Math.abs(u[0]) < 0.9 ? [1,0,0] : [0,1,0];
    p = [alt[1]*u[2]-alt[2]*u[1], alt[2]*u[0]-alt[0]*u[2], alt[0]*u[1]-alt[1]*u[0]];
    lp = Math.hypot(p[0], p[1], p[2]);
  }
  p = [p[0]/lp, p[1]/lp, p[2]/lp];
  let c = (dc*dc + L1*L1 - L2*L2)/(2*dc*L1); c = Math.max(-1, Math.min(1, c));
  const al = Math.acos(c), co = Math.cos(al), si = Math.sin(al)*s;
  const w = [u[0]*co + p[0]*si, u[1]*co + p[1]*si, u[2]*co + p[2]*si];
  const J = [O[0]+L1*w[0], O[1]+L1*w[1], O[2]+L1*w[2]];
  const w2 = [T[0]-J[0], T[1]-J[1], T[2]-J[2]];
  return [angles(w), angles(w2)];
}
/* angles (g, lat) d'un vecteur */
function angles(v){
  const L = Math.hypot(v[0], v[1], v[2]) || 1;
  const lat = deg(Math.asin(Math.max(-1, Math.min(1, v[2]/L))));
  return [deg(Math.atan2(v[1], v[0])), lat];
}

/* racine d'une chaîne de cinématique inverse : « hip » vaut hip2 pour la
   seconde jambe, « shoulder » vaut shoulder2 pour le second bras */
function racine(de, premier){
  if (!/2$/.test(premier)) return de;
  if (de === "hip") return "hip2";
  if (de === "shoulder") return "shoulder2";
  return de;
}

function placer(angles_, ex){
  const a = complet(angles_);
  const ro = ex.roulis || 0;
  for (const k of (ex.iks || (ex.ik ? [ex.ik] : []))){
    const P = squelette(a, ex.ancrage, ex.cibleAnc, ro);
    const n1 = k.chaine[0], n2 = k.chaine[1];
    let L2 = OS[n2].L;
    const suite = SUITE[n2];
    if (suite && k.chaine.length < 3) L2 += OS[suite].L;
    const cib = k.cibleCourante || k.cible;
    const O = P[racine(k.de, n1)];
    const T = [cib[0], cib[1], cib.length > 2 ? cib[2] : O[2]];
    /* la cible est donnée à l'écran : on résout dans le repère roulé,
       puis on ramène les directions dans le repère du corps */
    const s = ik2(O, T, OS[n1].L, L2, k.signe, rouler(k.normale || [0,0,1], ro));
    const d1 = angles(derouler(dir(s[0][0], s[0][1]), ro));
    const d2 = angles(derouler(dir(s[1][0], s[1][1]), ro));
    a[n1] = d1[0]; a[n1+"L"] = d1[1];
    a[n2] = d2[0]; a[n2+"L"] = d2[1];
    if (suite && k.chaine.length < 3){ a[suite] = d2[0]; a[suite+"L"] = d2[1]; }
  }
  if (ex.appui){
    const g = dd => { const z = Object.assign({}, a);
      for (const k of ex.appui.leviers) z[k] += dd;
      return squelette(z, ex.ancrage, ex.cibleAnc, ro); };
    let lo=-70, hi=70, fl=g(lo)[ex.appui.pt][1]-ex.appui.y, fh=g(hi)[ex.appui.pt][1]-ex.appui.y;
    if (fl*fh <= 0) for (let i=0;i<32;i++){ const md=(lo+hi)/2, fm=g(md)[ex.appui.pt][1]-ex.appui.y;
      if (fl*fm <= 0){hi=md;fh=fm;} else {lo=md;fl=fm;} }
    return g((lo+hi)/2);
  }
  return squelette(a, ex.ancrage, ex.cibleAnc, ro);
}

/* Projection orthographique. Renvoie {x, y, z} : z est la profondeur,
   croissante vers le fond. */
function projeter(P, azimut){
  const A = rad(azimut || 0), ca = Math.cos(A), sa = Math.sin(A), Q = {};
  for (const k in P){
    const p = P[k];
    Q[k] = [p[0]*ca + p[2]*sa, p[1], -p[0]*sa + p[2]*ca];
  }
  return Q;
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
  /* l'union des deux poses, et non les seules clés de la première : un angle
     latéral présent à l'arrivée seulement était autrement perdu en silence */
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])){
    const lat = /L\d*$/.test(k), trans = /D[xy]\d*$/.test(k);
    /* une clé absente d'une pose vaut 0 si c'est un latéral ou une
       translation, sinon elle garde la valeur de l'autre pose */
    const va = a[k] !== undefined ? a[k] : ((lat||trans) ? 0 : b[k]);
    const vb = b[k] !== undefined ? b[k] : ((lat||trans) ? 0 : a[k]);
    o[k] = trans ? va+(vb-va)*u : melAngle(va, vb, u);
  }
  return o;
}

/* POSES MULTIPLES

   Deux clés suffisent à un aller-retour. Il en faut davantage pour un
   cercle — d'épaule, de bras, de poignet, de hanche — et pour un saut, qui
   passe par le sol, l'air, puis le sol. `poses` remplace alors a/b, `ancres`
   remplace ca/cb, et chaque cinématique inverse peut recevoir `cibles`.
   Le parcours boucle : la dernière clé rejoint la première. */
function segment(n, u){
  const x = (u % 1 + 1) % 1 * n, i = Math.min(n-1, Math.floor(x));
  return [i, (i+1) % n, x - i];
}
function poseA(A, u){
  if (!A.poses) return melAngles(A.a, A.b, u);
  const [i,j,t] = segment(A.poses.length, u);
  return melAngles(A.poses[i], A.poses[j], t);
}
function lerpPt(a, b, t){ return a.map((v,i) => v + (b[i]-v)*t); }
function ancreA(A, u){
  if (A.ancres){ const [i,j,t] = segment(A.ancres.length, u); return lerpPt(A.ancres[i], A.ancres[j], t); }
  return lerpPt(A.ca, A.cb, u);
}
function cibleA_(k, u){
  if (k.cibles){ const [i,j,t] = segment(k.cibles.length, u); return lerpPt(k.cibles[i], k.cibles[j], t); }
  if (k.cibleA) return lerpPt(k.cibleA, k.cibleB, u);
  return k.cible;
}
function roulisA(A, u){
  const r = A.roulis;
  if (Array.isArray(r)){ const [i,j,t] = segment(r.length, u); return melAngle(r[i], r[j], t); }
  return r || 0;
}
/* état complet d'un exercice à l'instant u : angles, ancre, cibles, roulis */
function etatExo(A, u){
  const ex = Object.assign({}, A);
  ex.cibleAnc = ancreA(A, u);
  ex.roulis = roulisA(A, u);
  if (A.iks) ex.iks = A.iks.map(k => Object.assign({}, k, {cibleCourante: cibleA_(k, u)}));
  return {angles: poseA(A, u), ex};
}

/* Courbe temporelle.
   "cycle"  : aller-retour continu — un mouvement répété.
   "tenue"  : entrée en position, maintien avec une respiration à peine
              perceptible, puis retour. */
function avancement(A, q){
  /* "boucle" : parcours monotone des poses, pour un cercle ou un saut */
  if (A.forme === "boucle") return (q % 1 + 1) % 1;
  if (A.forme !== "tenue") return (1 - Math.cos(2*Math.PI*q)) / 2;
  const e = A.entree || 0.17, s = A.sortie || 0.84, r = A.respir === undefined ? 0.022 : A.respir;
  const doux = t => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) / 2;
  if (q < e) return doux(q / e);
  if (q > s) return 1 - doux((q - s) / (1 - s));
  const dans = (q - e) / (s - e);
  return 1 - r * (1 - Math.cos(2 * Math.PI * 2 * dans)) / 2;
}
