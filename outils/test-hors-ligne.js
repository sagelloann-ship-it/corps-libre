const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const TYPES = {'.html':'text/html','.json':'application/json','.webp':'image/webp','.png':'image/png','.js':'text/javascript'};
const srv = http.createServer((q,r)=>{
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join('/home/claude/app', p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(r);
});
(async () => {
  await new Promise(res => srv.listen(8099, res));
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:390,height:844}, locale:'fr-FR'});
  const pg = await ctx.newPage();
  const err = [];
  pg.on('pageerror', e => err.push(e.message));

  await pg.goto('http://localhost:8099/', {waitUntil:'networkidle'});
  // attendre l'activation complète du service worker
  await pg.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, {timeout:30000});
  await pg.waitForTimeout(4000);                       // laisser le cache se remplir
  const nbCache = await pg.evaluate(async () => {
    const k = (await caches.keys())[0];
    return (await (await caches.open(k)).keys()).length;
  });
  const badge = (await pg.textContent('#acc-hl')).trim();

  // ---- COUPURE RÉSEAU TOTALE ----
  await ctx.setOffline(true);
  srv.close();
  await pg.reload({waitUntil:'load'});
  await pg.waitForTimeout(2500);

  const titre = await pg.textContent('.hd h1').catch(()=>'(rien)');
  const nbExos = await pg.evaluate(() => typeof EXOS !== 'undefined' ? EXOS.length : 0);
  const imgOk = await pg.evaluate(async () => {
    const el = document.querySelector('.ligne .vis') || document.querySelector('.vis');
    if (!el) { // aller sur la bibliothèque
      document.querySelector('.nav button[data-vue="biblio"]').click();
      await new Promise(r => setTimeout(r, 500));
    }
    const e2 = document.querySelector('.vis');
    if (!e2) return {erreur:'aucun visuel'};
    const url = getComputedStyle(e2).backgroundImage.match(/url\("?([^")]+)"?\)/)[1];
    try { const r = await fetch(url); const bl = await r.blob();
      return {fichier:url.split('/').pop(), octets:bl.size}; }
    catch(e){ return {erreur:e.message}; }
  });
  await pg.screenshot({path:'/home/claude/shots/10-hors-ligne.png'});

  console.log('--- TEST HORS LIGNE ---');
  console.log('fichiers mis en cache :', nbCache, '/ 136');
  console.log('indicateur affiché   :', badge);
  console.log('RÉSEAU COUPÉ → page rechargée');
  console.log('  titre lu          :', titre);
  console.log('  exercices chargés :', nbExos);
  console.log('  image servie      :', JSON.stringify(imgOk));
  console.log('  erreurs JS        :', err.length ? err : 'aucune');
  await b.close();
})();
