/* Convertit les définitions du banc d'essai au format compact de l'application
   et remplace en bloc le moteur et la table d'animations dans index.html. */
const fs = require("fs");
const A = new Function(fs.readFileSync(__dirname + "/exercices.js", "utf8") + ";return ANIMS;")();
const CHEMIN = "/home/claude/app/index.html";
let app = fs.readFileSync(CHEMIN, "utf8");

/* ---- table d'animations ---- */
const ids = [...app.matchAll(/"id":"([^"]+)"/g)].map(m => m[1]);
const manquants = Object.keys(A).filter(k => !ids.includes(k));
if (manquants.length) console.log("!! ids absents de la bibliotheque :", manquants);

const lignes = Object.keys(A).map(k => {
  const o = A[k], r = {duree:o.duree, sens:o.sens, m:o.muscles, ancrage:o.ancrage};
  if (o.ancres) r.ancres = o.ancres;
  else { r.ci = o.ca; if (o.cb && (o.cb[0]!==o.ca[0] || o.cb[1]!==o.ca[1])) r.cf = o.cb; }
  if (o.azimut) r.az = o.azimut;
  if (o.roulis) r.ro = o.roulis;
  if (o.forme) r.forme = o.forme;
  if (o.respir !== undefined) r.respir = o.respir;
  if (o.appui) r.appui = {pt:o.appui.pt, y:o.appui.y, lev:o.appui.leviers};
  if (o.iks) r.iks = o.iks.map(i => {
    const j = {ch:i.chaine, de:i.de, signe:i.signe};
    if (i.cibles) j.cibles = i.cibles;
    else if (i.cibleA) { j.ciA = i.cibleA; j.ciB = i.cibleB; }
    else j.cible = i.cible;
    if (i.normale) j.nrm = i.normale;
    return j;
  });
  if (o.poses) r.poses = o.poses; else { r.a = o.a; r.b = o.b; }
  return JSON.stringify(k) + ":" + JSON.stringify(r);
});

/* ---- remplacement en bloc ---- */
const motA = fs.readFileSync("/home/claude/app/moteur3d.js", "utf8");
const motB = fs.readFileSync("/home/claude/app/moteur3d-b.js", "utf8");

const d1 = app.indexOf("const OS_ = {");
const d2 = app.indexOf("const ANIMS = {");
const f2 = app.indexOf("\n};", d2) + 3;
const f3 = app.indexOf("})(performance.now());") + "})(performance.now());".length;
if (d1 < 0 || d2 < 0 || f3 < 0) { console.log("!! reperes introuvables"); process.exit(1); }

app = app.slice(0, d1) + motA.trimEnd() + "\n\n"
    + "const ANIMS = {\n" + lignes.join(",\n") + "\n};\n\n"
    + motB.trimEnd() + app.slice(f3);

/* ---- empreinte de version ---- */
const crypto = require("crypto");
const ancien = /VERSION_APP\s*=\s*"([^"]+)"/.exec(app)[1];
const num = (parseInt(ancien.replace(/^v/, "")) || 12) + 1;
const neuf = "v" + num + "-" + crypto.createHash("sha1").update(app).digest("hex").slice(0,6);
app = app.replace('"' + ancien + '"', '"' + neuf + '"');

fs.writeFileSync(CHEMIN, app);
console.log("animations portees :", lignes.length, "|", ancien, "->", neuf);
