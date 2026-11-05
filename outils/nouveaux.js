/* Les quatre exercices absents de la base source, construits de zéro.
   Repère : y vers le bas, 0° = droite, 90° = bas, 180° = gauche, -90° = haut.
   Sol à y = 95. La figure regarde vers la gauche quand sens = -1. */

const NOUVEAUX = {

/* Bird dog — quadrupédie, bras et jambe opposés tendus à l'horizontale.
   Genou porteur ancré ; les deux mains et le genou opposé sont posés en
   position de départ, puis bras proche et jambe opposée se tendent.
   Sources de forme : ACE (hanche étendue jusqu'au parallèle, sans rotation
   du bassin), Healthline (dos neutre, omoplates basses, regard au sol). */
Bird_Dog:{piedAuSol:true, avant:[0,1], nom:"Bird dog", duree:4200, sens:-1,
 muscles:["bassin","tronc","cuisse2","bras"],
 ancrage:"knee", ca:[56,92], cb:[56,92],
 iks:[{chaine:["bras2","avbras2","main2"], de:"shoulder2", cible:[31,91], signe:-1},
      {chaine:["bras","avbras","main"], de:"shoulder", signe:-1,
       cibleA:[31,91], cibleB:[6,65]}],
 a:{bassin:198, tronc:200, cou:196, main:177, main2:177,
    cuisse:88, jambe:4, pied:0, cuisse2:88, jambe2:4, pied2:0},
 b:{bassin:196, tronc:198, cou:188, main:180, main2:177,
    cuisse:88, jambe:4, pied:0, cuisse2:4, jambe2:1, pied2:12}},

/* Hollow hold — bas du dos plaqué au sol, omoplates et jambes décollées.
   Seuls le bas du dos et les fessiers touchent : l'ancrage est donc le
   bassin, et c'est tout le reste qui se décolle. Forme tenue.
   Sources : StrengthLog, Antranik (le bas du dos plat est l'exercice). */
Hollow_Hold:{avant:[0,-1], nom:"Hollow hold", duree:5600, sens:-1,
 muscles:["bassin","tronc"], forme:"tenue", respir:0.05,
 ancrage:"bassin0", ca:[54,89], cb:[54,89],
 a:{bassin:182, tronc:180, cou:178, bras:176, avbras:177, main:178,
    cuisse:2, jambe:2, pied:-58},
 b:{bassin:184, tronc:194, cou:203, bras:190, avbras:191, main:192,
    cuisse:-15, jambe:-13, pied:-45}},

/* Pompe piquée — V inversé, hanche à ~90°, tête vers le sol en avant des
   mains. Mains ancrées par cinématique inverse, orteils au sol.
   Sources : Liftosaur (hanches hautes au-dessus des mains, coudes à 45°),
   Antranik (la tête va bien plus en avant qu'on ne le croit). */
"Pike_Push-Up":{avant:[0,1], nom:"Pompe piquée", duree:3000, sens:-1,
 muscles:["bras","bras2","avbras","avbras2"],
 ancrage:"toe", ca:[70,94], cb:[70,94],
 iks:[{chaine:["bras","avbras"], de:"shoulder", cible:[27.3,92], signe:-1},
      {chaine:["bras2","avbras2"], de:"shoulder2", cible:[27.3,92], signe:-1}],
 a:{bassin:159, tronc:159, cou:119, cuisse:69, jambe:69, pied:44},
 b:{bassin:127, tronc:127, cou:100, cuisse:49, jambe:49, pied:26}},

/* Chaise contre un mur — dos plaqué, cuisses parallèles au sol, genoux à
   90° au-dessus des chevilles. Forme tenue, avec un mur dessiné : sans lui
   la figure semble assise dans le vide.
   Sources : Physitrack, Motra (90/90, genoux au-dessus des chevilles). */
Wall_Sit:{avant:[1,0], nom:"Chaise contre un mur", duree:5600, sens:1,
 muscles:["cuisse","cuisse2","bassin"], forme:"tenue", respir:0.04,
 mur:24,
 ancrage:"bassin0", ca:[30,68], cb:[30,72],
 iks:[{chaine:["cuisse","jambe"], de:"hip", cible:[50,92], signe:-1},
      {chaine:["cuisse2","jambe2"], de:"hip2", cible:[50,92], signe:-1}],
 a:{bassin:-90, tronc:-90, cou:-90, bras:86, avbras:90, main:90, pied:20},
 b:{bassin:-90, tronc:-90, cou:-90, bras:2, avbras:0, main:0, pied:20}}

};
if (typeof module !== "undefined") module.exports = {NOUVEAUX};
