const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
 const p=await b.newPage({viewport:{width:900,height:2400},deviceScaleFactor:2});
 const er=[];p.on('pageerror',e=>er.push(e.message));
 await p.goto('file:///home/claude/anim/test.html');await p.waitForTimeout(700);
 console.log('longueurs :',await p.evaluate(()=>window.VERIF));
 console.log('erreurs :',er.length?er:'aucune');
 await p.screenshot({path:'/home/claude/anim/grille.png',fullPage:true});await b.close();})();
