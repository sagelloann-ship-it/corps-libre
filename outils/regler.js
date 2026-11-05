/* Outil de réglage : positions réelles des articulations pour les nouveaux
   exercices, à plusieurs instants du cycle. Sert à caler les appuis au sol
   avant tout rendu. */
const fs = require("fs");
const F = new Function(fs.readFileSync("/home/claude/anim/figure.js","utf8")
  + ";return {etatExo, placer, projeter, avancement, OS};")();
const {NOUVEAUX} = require("/home/claude/anim/nouveaux.js");

const P = (A,u) => { const e = F.etatExo(A,u); return F.projeter(F.placer(e.angles, e.ex), A.azimut); };
const n2 = v => v.toFixed(1).padStart(6);

const SUIVI = ["hand","hand2","toe","toe2","knee","knee2","hip","shoulder",
               "head","ankle","ankle2","bassin0","nuque"];

const cles = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(NOUVEAUX);
for (const cle of cles){
  const A = NOUVEAUX[cle];
  if (!A){ console.log("inconnu :", cle); continue; }
  console.log("\n=== " + cle + " — " + A.nom + " ===");
  for (const q of [0, 0.5, 1]){
    const p = P(A, F.avancement(A, q));
    console.log(" u=" + q + "  " + SUIVI.filter(k=>p[k])
      .map(k => `${k}(${n2(p[k][0])},${n2(p[k][1])})`).join("  "));
  }
  // longueurs d'os : elles doivent être rigoureusement constantes
  let pire = 0, nom = "";
  for (let i=0;i<=20;i++){
    const p = P(A, F.avancement(A, i/20));
    for (const o in F.OS){
      const s = F.OS[o], a = p[s.de], b = p[s.a];
      if (!a || !b) continue;
      const d = Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]);
      if (Math.abs(d - s.L) > pire){ pire = Math.abs(d - s.L); nom = o; }
    }
  }
  console.log(" écart de longueur max : " + pire.toFixed(4) + (nom ? " (" + nom + ")" : ""));
}
