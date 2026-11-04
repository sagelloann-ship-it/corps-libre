/* Longueurs calées sur Drillis & Contini (1966) en fraction de la taille H :
   bras 0,186 · avant-bras 0,146 · main 0,108 · cuisse 0,245 · jambe 0,246 ·
   tronc hanche-épaule 0,288 · tête 0,130. Ici H = 81,5 unités, sol à y = 95.

   Chaque os porte deux angles ABSOLUS : l'angle sagittal (0 = droite,
   90 = bas, -90 = haut) et un angle latéral « <os>L » qui le fait sortir du
   plan sagittal. `az` oriente la caméra — 0 profil, 90 face — et `ro`
   couche le corps sur le flanc. Amplitudes vérifiées contre AAOS/APTA. */
const OS_ = {
 bassin:{de:"bassin0",a:"chest",L:10.5,r:[4.85,4.40],tr:1},
 tronc:{de:"chest",a:"nuque",L:13,r:[5.61,6.25],tr:1},
 cou:{de:"nuque",a:"head",L:9.5,r:[2.70,2.33]},
 bras:{de:"shoulder",a:"elbow",L:15,r:[3.90,2.92]},
 avbras:{de:"elbow",a:"poignet",L:11.9,r:[2.78,2.21]},
 main:{de:"poignet",a:"hand",L:8.6,r:[2.21,1.80]},
 cuisse:{de:"hip",a:"knee",L:20,r:[5.55,3.38]},
 jambe:{de:"knee",a:"ankle",L:20,r:[3.60,1.95]},
 pied:{de:"ankle",a:"toe",L:9,r:[2.17,1.50]},
 bras2:{de:"shoulder2",a:"elbow2",L:15,r:[3.90,2.92]},
 avbras2:{de:"elbow2",a:"poignet2",L:11.9,r:[2.78,2.21]},
 main2:{de:"poignet2",a:"hand2",L:8.6,r:[2.21,1.80]},
 cuisse2:{de:"hip2",a:"knee2",L:20,r:[5.55,3.38]},
 jambe2:{de:"knee2",a:"ankle2",L:20,r:[3.60,1.95]},
 pied2:{de:"ankle2",a:"toe2",L:9,r:[2.17,1.50]}};
const CHAINE_ = ["bassin","tronc","cou","bras","avbras","main","cuisse","jambe","pied",
                 "bras2","avbras2","main2","cuisse2","jambe2","pied2"];
const MIROIR_ = {bras2:"bras",avbras2:"avbras",main2:"main",
                 cuisse2:"cuisse",jambe2:"jambe",pied2:"pied"};
const SUITE_ = {avbras:"main", avbras2:"main2"};
const ORDRE_ = ["cuisse2","jambe2","pied2","bras2","avbras2","main2",
                "bassin","tronc","cou","tete",
                "cuisse","jambe","pied","bras","avbras","main"];
const TETE_ = {rx:4.4,ry:5.3};
const DEC_ = [-2.6,1.3];
const DECP_ = [-1.0,0.6];
const EP_EC_ = 10.0, HA_EC_ = 7.8, LARG_TR_ = 1.22;
const COUL_ = {o:"#5A4632",f:"#EBD6B4",d:"#C9AE87",ho:"#1C6B4D",hf:"#4BC892",hd:"#2E9A70"};
