/* Rotation au doigt dans la fiche : la fenêtre ne doit jamais changer de
   taille, les appuis au sol ne doivent pas glisser, et la vue d'origine
   doit être restituée à l'identique. */
const { chromium } = require("playwright");
const OK=[], KO=[]; const v=(c,t)=>(c?OK:KO).push(t);

(async () => {
  const nav = await chromium.launch();
  const ctx = await nav.newContext({viewport:{width:390,height:844}, hasTouch:true, isMobile:true});
  const pg = await ctx.newPage(); const err=[];
  pg.on("pageerror", e=>err.push(String(e)));
  pg.on("console", m=>{ if(m.type()==="error") err.push(m.text()); });
  await pg.goto("file:///home/claude/app/index.html"); await pg.waitForTimeout(700);

  for (const id of ["Bodyweight_Squat","Plank","Bird_Dog","Wall_Sit"]){
    const r = await pg.evaluate(i => {
      ouvrirExo(i);
      const svg = document.querySelector("#det-body .vis-anim");
      const f = figureDe(svg);
      if (!f) return {err:"pas de figure"};
      const vb0 = svg.getAttribute("viewBox");
      f.tour = mesurerTour_(f.A);            // comme au premier glissement
      const tailles = new Set(), centres = [];
      let glisse = 0;
      for (let a=0; a<360; a+=15){
        const bbA = [];
        // (a) à angle fixe, les appuis au sol ne doivent pas glisser pendant le cycle
        const traces = {};
        for (let i=0;i<=11;i++){
          f.az = a; f.t0 = -i*(f.A.duree/11); dessinerFig(f, 0);
          const bb = svg.getAttribute("viewBox").split(" ").map(Number);
          tailles.add(bb[2].toFixed(2)+"x"+bb[3].toFixed(2));
          bbA.push(bb);
          const P = etatP_(f.A, avancement_(f.A, i/11), a);
          for (const k of ["toe","toe2","hand","hand2","knee","knee2","ankle","ankle2"])
            if (P[k] && Math.abs(P[k][1]-95) < 3.5) (traces[k] = traces[k] || []).push(P[k][0]-bb[0]);
        }
        for (const k in traces) if (traces[k].length > 6)
          glisse = Math.max(glisse, Math.max(...traces[k]) - Math.min(...traces[k]));
        // (b) en tournant, la figure doit rester centrée dans la fenêtre
        const bb = bbA[0], P = etatP_(f.A, avancement_(f.A, 0), a);
        let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
        for (const k in P){ x0=Math.min(x0,P[k][0]); x1=Math.max(x1,P[k][0]);
                            y0=Math.min(y0,P[k][1]); y1=Math.max(y1,P[k][1]); }
        centres.push([((x0+x1)/2-bb[0])/bb[2], ((y0+y1)/2-bb[1])/bb[3]]);
      }
      const ex = k => Math.max(...centres.map(p=>p[k])) - Math.min(...centres.map(p=>p[k]));
      // retour à la vue d'origine
      const raz = document.querySelector("#det-tour-raz");
      f.az = 0; raz.onclick();
      return {vb0, vbFin:svg.getAttribute("viewBox"), tailles:[...tailles],
              deriveX:+ex(0).toFixed(3), deriveY:+ex(1).toFixed(3),
              glisse:+glisse.toFixed(2), az:f.az, tour:!!f.tour};
    }, id);
    if (r.err){ v(false, id+" : "+r.err); continue; }
    v(r.tailles.length === 1, `${id} : fenêtre de taille constante sur 360° (${r.tailles.length} taille(s))`);
    v(r.glisse < 1.0, `${id} : appuis fixes pendant le cycle (glissement max ${r.glisse} unité)`);
    v(r.deriveX < 0.10 && r.deriveY < 0.10,
      `${id} : figure centrée sur 360° (écart ${(r.deriveX*100).toFixed(1)}% / ${(r.deriveY*100).toFixed(1)}% de la fenêtre)`);
    v(r.vbFin === r.vb0, `${id} : vue d'origine restituée à l'identique`);
    v(r.tour === false, `${id} : le bouton rend bien le cadrage initial`);
  }

  /* le geste lui-même */
  await pg.evaluate(() => ouvrirExo("Bodyweight_Squat"));
  await pg.waitForTimeout(500);
  const b = await pg.evaluate(() => {
    const r = document.querySelector("#det-body .vis-anim").getBoundingClientRect();
    return {x:r.x+r.width/2, y:r.y+r.height/2};
  });
  const avant = await pg.evaluate(() => figureDe(document.querySelector("#det-body .vis-anim")).az);
  await pg.mouse.move(b.x, b.y); await pg.mouse.down();
  for (let i=1;i<=10;i++){ await pg.mouse.move(b.x + i*12, b.y); await pg.waitForTimeout(16); }
  await pg.mouse.up(); await pg.waitForTimeout(200);
  const apres = await pg.evaluate(() => {
    const f = figureDe(document.querySelector("#det-body .vis-anim"));
    return {az:f.az, tour:!!f.tour, ind:document.querySelector("#det-tour-ind").textContent,
            razVisible:!document.querySelector("#det-tour-raz").hidden};
  });
  v(apres.az !== avant && apres.tour, `glissement : fait tourner la figure (az ${apres.az.toFixed(0)}°)`);
  v(/rotation/.test(apres.ind) && apres.razVisible, `glissement : rotation annoncée et retour proposé → "${apres.ind}"`);

  /* le défilement vertical ne doit pas être capté */
  const azAv = await pg.evaluate(() => figureDe(document.querySelector("#det-body .vis-anim")).az);
  await pg.mouse.move(b.x, b.y); await pg.mouse.down();
  for (let i=1;i<=6;i++){ await pg.mouse.move(b.x, b.y - i*14); await pg.waitForTimeout(16); }
  await pg.mouse.up(); await pg.waitForTimeout(150);
  const azAp = await pg.evaluate(() => figureDe(document.querySelector("#det-body .vis-anim")).az);
  v(Math.abs(azAp - azAv) < 0.001, "glissement vertical : laissé au défilement, pas de rotation");

  v(err.length === 0, "aucune erreur JavaScript" + (err.length ? " → "+err.slice(0,2).join(" | ") : ""));
  console.log(OK.map(t=>"  ok   "+t).join("\n"));
  if (KO.length) console.log("\n"+KO.map(t=>"  ÉCHEC "+t).join("\n"));
  console.log(`\n${OK.length} vérifications passées, ${KO.length} en échec`);
  await nav.close(); process.exit(KO.length?1:0);
})();
