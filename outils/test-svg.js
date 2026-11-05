/* Vérifie la sauvegarde et la restauration des progrès, bout en bout. */
const { chromium } = require("playwright");
const path = require("path"), fs = require("fs");

const URL = "file://" + path.resolve("/home/claude/app/index.html");
const OK = [], KO = [];
const v = (c, t) => (c ? OK : KO).push(t);

const SEANCES = [
  {date:"2026-10-20T09:00:00.000Z", titre:"Mobilité matinale", minutes:12, exos:5, cats:{mobilite:5}},
  {date:"2026-10-22T18:30:00.000Z", titre:"Gainage court",     minutes:9,  exos:4, cats:{gainage:4}},
  {date:"2026-10-25T08:15:00.000Z", titre:"Souplesse",         minutes:15, exos:6, cats:{etirement:6}}
];

(async () => {
  const nav = await chromium.launch();
  const ctx = await nav.newContext({ acceptDownloads:true, viewport:{width:390,height:844} });
  const pg = await ctx.newPage();
  const err = [];
  pg.on("pageerror", e => err.push(String(e)));
  pg.on("console", m => { if (m.type() === "error") err.push(m.text()); });

  await pg.goto(URL); await pg.waitForTimeout(600);

  /* --- semer un historique, puis recharger --- */
  await pg.evaluate(s => {
    const d = {seances:s, prog:{p1:{faites:["s1j1","s1j2"], maj:1761000000000}}, voix:true, calib:{Gainage_Planche:1.2}};
    localStorage.setItem("corpslibre.v1", JSON.stringify(d));
  }, SEANCES);
  await pg.reload(); await pg.waitForTimeout(500);
  
  // repli : activer la vue directement
  await pg.evaluate(() => { if (typeof allerA === "function") allerA("suivi"); });
  await pg.waitForTimeout(300);

  const etat = await pg.textContent("#su-etat");
  v(/3 séances enregistrées/.test(etat), "état : compte les séances → " + JSON.stringify(etat));
  v(/Jamais sauvegardé/.test(etat), "état : alerte quand aucune sauvegarde n'a été faite");

  /* --- export --- */
  const dl = pg.waitForEvent("download", {timeout:5000});
  await pg.click("#su-export");
  let fichier = null;
  try {
    const d = await dl;
    v(/^corps-libre-\d{4}-\d{2}-\d{2}\.json$/.test(d.suggestedFilename()),
      "export : nom de fichier daté → " + d.suggestedFilename());
    fichier = "/tmp/" + d.suggestedFilename();
    await d.saveAs(fichier);
  } catch(e) { v(false, "export : téléchargement déclenché (" + e.message.split("\n")[0] + ")"); }

  const msg = await pg.textContent("#su-msg");
  v(/enregistré/i.test(msg), "export : message de confirmation → " + JSON.stringify(msg));

  let paquet = null;
  if (fichier && fs.existsSync(fichier)) {
    paquet = JSON.parse(fs.readFileSync(fichier, "utf8"));
    v(paquet.app === "corps-libre" && paquet.format === 1, "fichier : en-tête d'identification");
    v(paquet.donnees.seances.length === 3, "fichier : contient les 3 séances");
    v(paquet.donnees.prog.p1.faites.length === 2, "fichier : contient l'avancement du programme");
    v(paquet.donnees.calib.Gainage_Planche === 1.2, "fichier : contient la calibration");
  }

  const etat2 = await pg.textContent("#su-etat");
  v(/Dernière sauvegarde le/.test(etat2) && !/Jamais/.test(etat2),
    "état : enregistre la date de sauvegarde → " + JSON.stringify(etat2));

  /* --- perte totale puis restauration --- */
  await pg.evaluate(() => localStorage.clear());
  await pg.reload(); await pg.waitForTimeout(500);
  await pg.evaluate(() => { if (typeof allerA === "function") allerA("suivi"); });
  await pg.waitForTimeout(200);
  v(/Aucune séance/.test(await pg.textContent("#su-etat")), "perte : historique bien vide avant restauration");

  if (paquet) {
    await pg.setInputFiles("#su-fichier", fichier);
    await pg.waitForTimeout(400);
    const m = await pg.textContent("#su-msg");
    v(/3 séances/.test(m) && /2 étapes/.test(m), "restauration : rapporte ce qui a été ajouté → " + JSON.stringify(m));
    const d = await pg.evaluate(() => JSON.parse(localStorage.getItem("corpslibre.v1")));
    v(d.seances.length === 3, "restauration : 3 séances en base");
    v(d.prog.p1.faites.length === 2, "restauration : avancement du programme");
    v(d.calib.Gainage_Planche === 1.2, "restauration : calibration");
    v(/3/.test(await pg.textContent("#su-stats")), "restauration : les écrans se rafraîchissent");

    /* --- rejouer le même fichier : aucun doublon --- */
    await pg.setInputFiles("#su-fichier", []);
    await pg.setInputFiles("#su-fichier", fichier);
    await pg.waitForTimeout(400);
    v(/déjà dans votre historique/.test(await pg.textContent("#su-msg")), "fusion : second import sans effet");
    v((await pg.evaluate(() => JSON.parse(localStorage.getItem("corpslibre.v1")).seances.length)) === 3,
      "fusion : toujours 3 séances, pas de doublon");

    /* --- fusion avec une séance faite depuis : rien n'est détruit --- */
    await pg.evaluate(() => {
      const d = JSON.parse(localStorage.getItem("corpslibre.v1"));
      d.seances = [d.seances[2], {date:"2026-10-30T07:00:00.000Z", titre:"Faite depuis", minutes:11, exos:5, cats:{}}];
      localStorage.setItem("corpslibre.v1", JSON.stringify(d));
    });
    await pg.reload(); await pg.waitForTimeout(500);
    await pg.evaluate(() => { if (typeof allerA === "function") allerA("suivi"); });
    await pg.setInputFiles("#su-fichier", fichier);
    await pg.waitForTimeout(400);
    const f = await pg.evaluate(() => JSON.parse(localStorage.getItem("corpslibre.v1")).seances);
    v(f.length === 4, "fusion : 2 anciennes + 2 retrouvées = 4 → " + f.length);
    v(f.some(s => s.titre === "Faite depuis"), "fusion : la séance faite depuis survit");
    v(f.every((s,i) => i === 0 || new Date(f[i-1].date) <= new Date(s.date)), "fusion : ordre chronologique conservé");
  }

  /* --- fichiers invalides --- */
  const mauvais = [
    ["/tmp/pas-json.json", "ceci n'est pas du json", /pas une sauvegarde lisible/],
    ["/tmp/autre-app.json", JSON.stringify({app:"autre", donnees:{}}), /ne vient pas de Corps Libre/],
    ["/tmp/futur.json", JSON.stringify({app:"corps-libre", format:9, donnees:{}}), /version plus récente/]
  ];
  for (const [f, c, attendu] of mauvais) {
    fs.writeFileSync(f, c);
    const avant = await pg.evaluate(() => JSON.parse(localStorage.getItem("corpslibre.v1") || "{}").seances?.length || 0);
    await pg.setInputFiles("#su-fichier", f);
    await pg.waitForTimeout(300);
    const m = await pg.textContent("#su-msg");
    const apres = await pg.evaluate(() => JSON.parse(localStorage.getItem("corpslibre.v1") || "{}").seances?.length || 0);
    v(attendu.test(m) && avant === apres,
      "invalide (" + path.basename(f) + ") : refusé sans rien casser → " + JSON.stringify(m));
  }

  /* --- repli par collage de texte --- */
  if (paquet) {
    await pg.evaluate(() => { localStorage.clear(); });
    await pg.reload(); await pg.waitForTimeout(500);
    await pg.evaluate(() => { if (typeof allerA === "function") allerA("suivi"); });
    await pg.click("#su-texte-ouvre");
    v(!(await pg.isHidden("#su-texte")), "collage : la zone de texte s'ouvre");
    await pg.fill("#su-texte", JSON.stringify(paquet));
    await pg.click("#su-coller");
    await pg.waitForTimeout(400);
    v((await pg.evaluate(() => JSON.parse(localStorage.getItem("corpslibre.v1")).seances.length)) === 3,
      "collage : restaure aussi bien que le fichier");
    v(await pg.isHidden("#su-texte"), "collage : la zone se referme après succès");
  }

  /* --- effacement total : le repère de sauvegarde part aussi --- */
  await pg.click("#su-reset"); await pg.click("#su-reset");
  await pg.waitForTimeout(300);
  const ef = await pg.textContent("#su-etat");
  v(/Aucune séance/.test(ef) && !/Dernière sauvegarde/.test(ef), "effacement : état remis à zéro → " + JSON.stringify(ef));

  v(err.length === 0, "aucune erreur JavaScript" + (err.length ? " → " + err.slice(0,3).join(" | ") : ""));

  console.log(OK.map(t => "  ok   " + t).join("\n"));
  if (KO.length) console.log("\n" + KO.map(t => "  ÉCHEC " + t).join("\n"));
  console.log(`\n${OK.length} vérifications passées, ${KO.length} en échec`);
  await nav.close();
  process.exit(KO.length ? 1 : 0);
})();
