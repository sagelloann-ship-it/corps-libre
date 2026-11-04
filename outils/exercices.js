const ANIMS = {

Bodyweight_Squat:{avant:[1,0],nom:"Squat",duree:2800,sens:1,muscles:["cuisse","cuisse2","bassin"],
 ancrage:"ankle",ca:[50,92],cb:[50,92],
 a:{bassin:-90,tronc:-90,cou:-90,bras:86,avbras:92,cuisse:90,jambe:90,pied:20},
 b:{bassin:-50,tronc:-58,cou:-84,bras:20,avbras:0,cuisse:2,jambe:115,pied:20}},

Pushups:{avant:[0,1],nom:"Pompe",duree:2600,sens:-1,muscles:["bras","bras2","avbras","avbras2","tronc"],
 ancrage:"toe",ca:[93,95],cb:[93,95],
 iks:[{chaine:["bras","avbras"],de:"shoulder",cible:[26,92],signe:-1},
      {chaine:["bras2","avbras2"],de:"shoulder",cible:[26,92],signe:-1}],
 a:{bassin:204,tronc:204,cou:200,bras:72,avbras:108,cuisse:24,jambe:24,pied:72},
 b:{bassin:186,tronc:186,cou:183,bras:25,avbras:160,cuisse:6,jambe:6,pied:72}},

Plank:{avant:[0,1],nom:"Planche ventrale",duree:5200,sens:-1,muscles:["tronc","bassin"],
 ancrage:"elbow",ca:[30,92],cb:[30,92],forme:"tenue",respir:0.05,
 appui:{pt:"toe",y:95,leviers:["bassin","tronc","cou","cuisse","jambe","pied","cuisse2","jambe2","pied2"]},
 a:{bassin:196,tronc:196,cou:192,bras:95,avbras:180,cuisse:16,jambe:16,pied:62},
 b:{bassin:189,tronc:189,cou:185,bras:95,avbras:180,cuisse:9,jambe:9,pied:62}},

Butt_Lift_Bridge:{avant:[0,-1],nom:"Pont fessier",duree:3000,sens:-1,muscles:["cuisse","cuisse2","bassin"],
 ancrage:"shoulder",ca:[38,90],cb:[38,90],
 iks:[{chaine:["cuisse","jambe"],de:"hip",cible:[80,92],signe:-1},
      {chaine:["cuisse2","jambe2"],de:"hip",cible:[80,92],signe:-1}],
 a:{bassin:180,tronc:176,cou:182,bras:12,avbras:6,cuisse:-48,jambe:74,pied:15},
 b:{bassin:148,tronc:138,cou:182,bras:12,avbras:6,cuisse:0,jambe:84,pied:15}},

Cat_Stretch:{piedAuSol:true,avant:[0,1],nom:"Chat-vache",duree:3600,sens:-1,muscles:["tronc","bassin"],
 ancrage:"knee",ca:[46,92],cb:[46,92],
 iks:[{chaine:["bras","avbras"],de:"shoulder",cible:[22,92],signe:-1},
      {chaine:["bras2","avbras2"],de:"shoulder",cible:[22,92],signe:-1}],
 a:{bassin:198,tronc:226,cou:205,bras:86,avbras:94,cuisse:88,jambe:4,pied:0},
 b:{bassin:226,tronc:198,cou:135,bras:86,avbras:94,cuisse:88,jambe:4,pied:0}},

/* ---- nouveaux : postures tenues ---- */

Childs_Pose:{piedAuSol:true,avant:[0,1],nom:"Posture de l'enfant",duree:5400,sens:-1,muscles:["bassin","tronc"],
 ancrage:"knee",ca:[58,92],cb:[58,92],forme:"tenue",
 a:{bassin:-90,tronc:-90,cou:-90,bras:90,avbras:102,cuisse:90,jambe:3,pied:10},
 b:{bassin:188,tronc:163,cou:150,bras:172,avbras:184,cuisse:135,jambe:3,pied:10}},

Superman:{piedAuSol:true,avant:[0,1],nom:"Superman",duree:4600,sens:-1,muscles:["bassin","cuisse","cuisse2"],
 ancrage:"hip",ca:[52,90],cb:[52,90],forme:"tenue",
 a:{bassin:180,tronc:180,cou:180,bras:180,avbras:180,cuisse:0,jambe:0,pied:5},
 b:{bassin:190,tronc:205,cou:200,bras:195,avbras:200,cuisse:-8,jambe:-10,pied:-14}},

Kneeling_Hip_Flexor:{piedAuSol:true,avant:[1,0],nom:"Fléchisseurs de hanche à genoux",duree:5000,sens:1,
 muscles:["cuisse2","bassin"],
 ancrage:"ankle",ca:[72,92],cb:[72,92],forme:"tenue",
 a:{bassin:-92,tronc:-88,cou:-90,bras:95,avbras:95,cuisse:0,jambe:92,pied:20,
    cuisse2:100,jambe2:178,pied2:175,bras2:95,avbras2:95},
 b:{bassin:-85,tronc:-95,cou:-86,bras:98,avbras:98,cuisse:0,jambe:118,pied:20,
    cuisse2:118,jambe2:178,pied2:175,bras2:98,avbras2:98}},

/* ---- nouveau : mouvement asymétrique répété ---- */

Dead_Bug:{avant:[0,-1],nom:"Dead bug",duree:3400,sens:-1,muscles:["bassin","tronc"],
 ancrage:"hip",ca:[52,88],cb:[52,88],
 a:{bassin:180,tronc:180,cou:180,bras:-90,avbras:-90,cuisse:-80,jambe:10,pied:-65,
    bras2:-90,avbras2:-90,cuisse2:-80,jambe2:10,pied2:-65},
 b:{bassin:180,tronc:180,cou:180,bras:-155,avbras:-155,cuisse:-4,jambe:-4,pied:-79,
    bras2:-90,avbras2:-90,cuisse2:-80,jambe2:10,pied2:-65}},


/* ===== LOT 1 : 12 exercices, par ordre d'usage réel ================= */

Chin_To_Chest_Stretch:{avant:[1,0],nom:"Menton vers la poitrine",duree:5000,sens:1,muscles:["cou"],
 ancrage:"ankle",ca:[50,92],cb:[50,92],forme:"tenue",
 a:{bassin:-90,tronc:-90,cou:-90,bras:86,avbras:80,cuisse:90,jambe:90,pied:20},
 b:{bassin:-90,tronc:-87,cou:-44,bras:86,avbras:80,cuisse:90,jambe:90,pied:20}},

Seated_Front_Deltoid:{avant:[1,0],nom:"Deltoïde antérieur assis",duree:5200,sens:1,muscles:["tronc","bras","bras2"],
 ancrage:"hip",ca:[40,88],cb:[40,88],forme:"tenue",
 a:{bassin:-85,tronc:-88,cou:-90,bras:85,avbras:90,cuisse:5,jambe:2,pied:-73},
 b:{bassin:-100,tronc:-105,cou:-95,bras:120,avbras:95,cuisse:5,jambe:2,pied:-73}},

Elbows_Back:{avant:[1,0],nom:"Coudes en arrière",duree:3000,sens:1,muscles:["tronc"],
 ancrage:"ankle",ca:[50,92],cb:[50,92],
 a:{bassin:-88,tronc:-78,cou:-72,bras:-50,avbras:-165,cuisse:90,jambe:90,pied:20},
 b:{bassin:-93,tronc:-99,cou:-98,bras:-50,avbras:-165,cuisse:90,jambe:90,pied:20}},

Standing_Hip_Flexors:{avant:[1,0],nom:"Fléchisseurs de hanche debout",duree:5000,sens:1,
 muscles:["cuisse2","bassin"],ancrage:"ankle",ca:[55,92],cb:[55,92],forme:"tenue",
 iks:[{chaine:["cuisse2","jambe2"],de:"hip",cible:[16,93],signe:1}],
 a:{bassin:-88,tronc:-92,cou:-90,bras:100,avbras:55,cuisse:30,jambe:95,pied:20,pied2:40},
 b:{bassin:-82,tronc:-96,cou:-86,bras:100,avbras:55,cuisse:40,jambe:108,pied:20,pied2:40}},

Standing_Pelvic_Tilt:{avant:[1,0],nom:"Bascule de bassin debout",duree:3400,sens:1,muscles:["bassin"],
 ancrage:"ankle",ca:[50,92],cb:[50,92],
 a:{bassin:-76,tronc:-100,cou:-92,bras:86,avbras:92,cuisse:90,jambe:90,pied:20},
 b:{bassin:-102,tronc:-80,cou:-88,bras:86,avbras:92,cuisse:90,jambe:90,pied:20}},

Middle_Back_Stretch:{avant:[1,0],nom:"Étirement du milieu du dos",duree:5000,sens:1,muscles:["tronc"],
 ancrage:"ankle",ca:[50,92],cb:[50,92],forme:"tenue",
 a:{bassin:-90,tronc:-90,cou:-90,bras:0,avbras:0,cuisse:90,jambe:90,pied:20},
 b:{bassin:-86,tronc:-70,cou:-52,bras:4,avbras:-2,cuisse:90,jambe:90,pied:20}},

Upper_Back_Stretch:{avant:[1,0],nom:"Étirement du haut du dos",duree:5000,sens:1,muscles:["tronc"],
 ancrage:"ankle",ca:[50,92],cb:[50,92],forme:"tenue",
 a:{bassin:-90,tronc:-90,cou:-90,bras:25,avbras:155,cuisse:90,jambe:90,pied:20},
 b:{bassin:-84,tronc:-64,cou:-38,bras:22,avbras:150,cuisse:90,jambe:90,pied:20}},

"Upper_Back-Leg_Grab":{avant:[1,0],nom:"Buste vers les jambes assis",duree:5400,sens:1,
 muscles:["cuisse","cuisse2","bassin"],ancrage:"hip",ca:[35,88],cb:[35,88],forme:"tenue",
 a:{bassin:-85,tronc:-88,cou:-90,bras:10,avbras:5,cuisse:3,jambe:2,pied:-73},
 b:{bassin:-52,tronc:-35,cou:-18,bras:30,avbras:20,cuisse:3,jambe:2,pied:-73}},

Hug_Knees_To_Chest:{avant:[0,-1],nom:"Genoux serrés contre la poitrine",duree:5200,sens:-1,
 muscles:["bassin"],ancrage:"hip",ca:[52,88],cb:[52,88],forme:"tenue",
 a:{bassin:180,tronc:180,cou:180,bras:170,avbras:165,cuisse:8,jambe:12,pied:-63},
 b:{bassin:180,tronc:180,cou:172,bras:150,avbras:140,cuisse:-105,jambe:20,pied:-55}},

One_Knee_To_Chest:{avant:[0,-1],nom:"Un genou contre la poitrine",duree:5200,sens:-1,
 muscles:["bassin","cuisse"],ancrage:"hip",ca:[52,88],cb:[52,88],forme:"tenue",
 a:{bassin:180,tronc:180,cou:180,bras:170,avbras:165,cuisse:8,jambe:12,pied:-63,
    cuisse2:8,jambe2:12,pied2:-63,bras2:170,avbras2:165},
 b:{bassin:180,tronc:180,cou:174,bras:155,avbras:145,cuisse:-105,jambe:20,pied:-55,
    cuisse2:6,jambe2:10,pied2:-65,bras2:170,avbras2:165}},

Seated_Floor_Hamstring_Stretch:{avant:[1,0],nom:"Ischio-jambiers assis au sol",duree:5400,sens:1,
 muscles:["cuisse","cuisse2"],ancrage:"hip",ca:[35,88],cb:[35,88],forme:"tenue",
 a:{bassin:-85,tronc:-90,cou:-92,bras:70,avbras:80,cuisse:3,jambe:2,pied:-73},
 b:{bassin:-57,tronc:-38,cou:-20,bras:22,avbras:12,cuisse:3,jambe:2,pied:-73}}

};