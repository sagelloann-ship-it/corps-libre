const { chromium } = require("playwright");
(async () => {
  const nav = await chromium.launch();
  const pg = await (await nav.newContext({viewport:{width:390,height:844}, deviceScaleFactor:2})).newPage();
  const err = [];
  pg.on("pageerror", e => err.push(String(e)));
  pg.on("console", m => { if (m.type()==="error") err.push(m.text()); });
  await pg.goto("file:///home/claude/app/index.html");
  await pg.waitForTimeout(800);

  const info = await pg.evaluate(() => ({
    exos: EXOS.length, anims: Object.keys(ANIMS).length,
    sansPhoto: EXOS.filter(e=>!e.sprite).map(e=>e.id),
    tousAnimes: EXOS.filter(e=>!e.sprite).every(e=>!!ANIMS[e.id]),
    version: VERSION_APP
  }));
  console.log(JSON.stringify(info));

  // la fiche de chaque nouvel exercice
  for (const id of info.sansPhoto){
    await pg.evaluate(i => ouvrirExo(i), id);
    await pg.waitForTimeout(900);
    const n = await pg.evaluate(() => ({
      anim: !!document.querySelector("#det-body .vis-anim[data-pret]"),
      photo: !!document.querySelector("#det-body .vis"),
      os: document.querySelectorAll("#det-body .vis-anim path").length,
      titre: document.querySelector("#det-body h1")?.textContent
    }));
    console.log(id, JSON.stringify(n));
    await pg.screenshot({path:`/home/claude/fiche-${id}.png`});
    await pg.evaluate(() => { const b=document.querySelector("#v-detail .retour,#det-retour"); if(b) b.click(); });
    await pg.waitForTimeout(200);
  }

  // la bibliothèque : les vignettes sans photo doivent être animées
  await pg.evaluate(() => allerA("biblio"));
  await pg.waitForTimeout(1200);
  const biblio = await pg.evaluate(() => ({
    lignes: document.querySelectorAll("#biblio-liste .ligne").length,
    animees: document.querySelectorAll("#biblio-liste .vis-anim[data-pret]").length,
    vides: [...document.querySelectorAll("#biblio-liste .vis")].filter(v=>!v.dataset.img && !v.style.backgroundImage).length
  }));
  console.log("bibliothèque", JSON.stringify(biblio));

  console.log("erreurs :", err.length ? err.slice(0,4) : "aucune");
  await nav.close();
})();
