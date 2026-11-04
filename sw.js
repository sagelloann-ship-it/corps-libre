/* Corps Libre — service worker

   Deux caches séparés, volontairement :
   - CACHE_APP change à chaque mise à jour du code (quelques dizaines de Ko) ;
   - CACHE_IMG ne change que si les visuels eux-mêmes changent (2,4 Mo).
   Une mise à jour de l'application ne fait donc pas retélécharger les images.

   Les fichiers indispensables sont mis en cache de façon bloquante : si l'un
   d'eux échoue, l'installation échoue et sera retentée, plutôt que de laisser
   un cache incomplet qui donnerait une application figée au démarrage. */

const CACHE_APP = "corpslibre-app-v8-503c65ff";
const CACHE_IMG = "corpslibre-img-v1-4caa2ca4";
const CRITIQUES = ["./", "index.html", "manifest.json", "icone-192.png", "icone-512.png", "icone-512-maskable.png"];
const IMAGES    = ["img/3_4_Sit-Up.webp","img/90_90_Hamstring.webp","img/Adductor_Groin.webp","img/Air_Bike.webp","img/All_Fours_Quad_Stretch.webp","img/Alternate_Heel_Touchers.webp","img/Ankle_On_The_Knee.webp","img/Arm_Circles.webp","img/Bent-Knee_Hip_Raise.webp","img/Body-Up.webp","img/Bodyweight_Squat.webp","img/Bottoms_Up.webp","img/Butt-Ups.webp","img/Butt_Lift_Bridge.webp","img/Calf_Stretch_Elbows_Against_Wall.webp","img/Calf_Stretch_Hands_Against_Wall.webp","img/Cat_Stretch.webp","img/Chair_Lower_Back_Stretch.webp","img/Childs_Pose.webp","img/Chin_To_Chest_Stretch.webp","img/Clock_Push-Up.webp","img/Cocoons.webp","img/Cross-Body_Crunch.webp","img/Crossover_Reverse_Lunge.webp","img/Crunch_-_Hands_Overhead.webp","img/Dancers_Stretch.webp","img/Dead_Bug.webp","img/Dips_-_Triceps_Version.webp","img/Double_Leg_Butt_Kick.webp","img/Dynamic_Back_Stretch.webp","img/Dynamic_Chest_Stretch.webp","img/Elbow_Circles.webp","img/Elbow_to_Knee.webp","img/Elbows_Back.webp","img/Floor_Glute-Ham_Raise.webp","img/Freehand_Jump_Squat.webp","img/Frog_Hops.webp","img/Frog_Sit-Ups.webp","img/Front_Leg_Raises.webp","img/Glute_Kickback.webp","img/Groin_and_Back_Stretch.webp","img/Groiners.webp","img/Handstand_Push-Ups.webp","img/Hip_Circles_prone.webp","img/Hug_Knees_To_Chest.webp","img/Inchworm.webp","img/Iron_Crosses_stretch.webp","img/Isometric_Chest_Squeezes.webp","img/Isometric_Neck_Exercise_-_Front_And_Back.webp","img/Isometric_Neck_Exercise_-_Sides.webp","img/Isometric_Wipers.webp","img/Jackknife_Sit-Up.webp","img/Janda_Sit-Up.webp","img/Knee_Across_The_Body.webp","img/Knee_Circles.webp","img/Knee_Tuck_Jump.webp","img/Kneeling_Forearm_Stretch.webp","img/Kneeling_Hip_Flexor.webp","img/Lateral_Bound.webp","img/Leg-Up_Hamstring_Stretch.webp","img/Leg_Pull-In.webp","img/Looking_At_Ceiling.webp","img/Lower_Back_Curl.webp","img/Lying_Crossover.webp","img/Lying_Glute.webp","img/Lying_Prone_Quadriceps.webp","img/Middle_Back_Stretch.webp","img/Mountain_Climbers.webp","img/Oblique_Crunches_-_On_The_Floor.webp","img/On_Your_Side_Quad_Stretch.webp","img/One_Arm_Against_Wall.webp","img/One_Half_Locust.webp","img/One_Knee_To_Chest.webp","img/Overhead_Stretch.webp","img/Overhead_Triceps.webp","img/Pelvic_Tilt_Into_Bridge.webp","img/Plank.webp","img/Plyo_Push-up.webp","img/Prone_Manual_Hamstring.webp","img/Push_Up_to_Side_Plank.webp","img/Pushups.webp","img/Rear_Leg_Raises.webp","img/Reverse_Crunch.webp","img/Rocket_Jump.webp","img/Runners_Stretch.webp","img/Russian_Twist.webp","img/Scissor_Kick.webp","img/Seated_Biceps.webp","img/Seated_Floor_Hamstring_Stretch.webp","img/Seated_Front_Deltoid.webp","img/Seated_Glute.webp","img/Seated_Hamstring.webp","img/Seated_Overhead_Stretch.webp","img/Shoulder_Circles.webp","img/Shoulder_Raise.webp","img/Shoulder_Stretch.webp","img/Side-Lying_Floor_Stretch.webp","img/Side_Bridge.webp","img/Side_Jackknife.webp","img/Side_Leg_Raises.webp","img/Side_Lying_Groin_Stretch.webp","img/Side_Neck_Stretch.webp","img/Side_Wrist_Pull.webp","img/Single-Arm_Push-Up.webp","img/Single_Leg_Glute_Bridge.webp","img/Sit-Up.webp","img/Sit_Squats.webp","img/Spider_Crawl.webp","img/Spinal_Stretch.webp","img/Split_Jump.webp","img/Split_Squats.webp","img/Standing_Hip_Circles.webp","img/Standing_Hip_Flexors.webp","img/Standing_Lateral_Stretch.webp","img/Standing_Pelvic_Tilt.webp","img/Standing_Soleus_And_Achilles_Stretch.webp","img/Standing_Toe_Touches.webp","img/Star_Jump.webp","img/Stomach_Vacuum.webp","img/Superman.webp","img/The_Straddle.webp","img/Toe_Touchers.webp","img/Tricep_Side_Stretch.webp","img/Triceps_Stretch.webp","img/Tuck_Crunch.webp","img/Upper_Back-Leg_Grab.webp","img/Upper_Back_Stretch.webp","img/Upward_Stretch.webp","img/Windmills.webp","img/Worlds_Greatest_Stretch.webp","img/Wrist_Circles.webp"];
const TOTAL     = CRITIQUES.length + IMAGES.length;

async function telecharger(cache, liste, taille, strict, sauterExistants){
  for (let i = 0; i < liste.length; i += taille){
    const lot = liste.slice(i, i + taille);
    const res = await Promise.all(lot.map(async f => {
      if (sauterExistants && await cache.match(f)) return true;
      for (let essai = 0; essai < 2; essai++){
        try {
          const rep = await fetch(f, {cache: "reload"});
          if (rep && rep.ok){ await cache.put(f, rep); return true; }
        } catch (e) {}
      }
      return false;
    }));
    if (strict && res.some(ok => !ok))
      throw new Error("fichier indispensable non mis en cache");
  }
}

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const app = await caches.open(CACHE_APP);
    await telecharger(app, CRITIQUES, 3, true, false);
    const img = await caches.open(CACHE_IMG);
    await telecharger(img, IMAGES, 6, false, true);   // déjà présentes : non retéléchargées
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const cles = await caches.keys();
    await Promise.all(cles
      .filter(k => k.startsWith("corpslibre-") && k !== CACHE_APP && k !== CACHE_IMG)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function trouver(req, options){
  for (const nom of [CACHE_APP, CACHE_IMG]){
    const c = await caches.open(nom);
    const hit = await c.match(req, options);
    if (hit) return hit;
  }
  return null;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  /* L'application installée démarre sur l'adresse du dossier, qui n'est pas
     la même entrée de cache que "index.html" : on traite les deux. */
  if (req.mode === "navigate"){
    e.respondWith((async () => {
      const page = await trouver("index.html") || await trouver("./");
      if (page) return page;
      try { return await fetch(req); }
      catch (err) {
        return new Response("Application indisponible hors ligne.",
          {status: 503, headers: {"Content-Type": "text/plain; charset=utf-8"}});
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const hit = await trouver(req, {ignoreSearch: true});
    if (hit) return hit;
    try {
      const rep = await fetch(req);
      if (rep && rep.ok && rep.type === "basic"){
        const nom = new URL(req.url).pathname.includes("/img/") ? CACHE_IMG : CACHE_APP;
        (await caches.open(nom)).put(req, rep.clone());
      }
      return rep;
    } catch (err) { return new Response("", {status: 504}); }
  })());
});

self.addEventListener("message", async e => {
  if (e.data === "etat-cache"){
    let n = 0;
    for (const nom of [CACHE_APP, CACHE_IMG])
      n += (await (await caches.open(nom)).keys()).length;
    e.source.postMessage({type: "etat-cache", enCache: n, total: TOTAL});
  }
});
