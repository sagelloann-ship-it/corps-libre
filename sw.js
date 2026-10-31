/* Corps Libre — service worker
   Stratégie : les fichiers indispensables sont mis en cache en premier et de
   façon bloquante (si l'un d'eux échoue, l'installation échoue et sera
   retentée) ; les images suivent par petits lots, et un échec isolé sur une
   image n'empêche pas l'application de fonctionner hors ligne. */

const VERSION   = "corpslibre-v2-1b605932";
const CRITIQUES = ["./", "index.html", "manifest.json", "icone-192.png", "icone-512.png", "icone-512-maskable.png"];
const IMAGES    = ["img/3_4_Sit-Up.webp","img/90_90_Hamstring.webp","img/Adductor_Groin.webp","img/Air_Bike.webp","img/All_Fours_Quad_Stretch.webp","img/Alternate_Heel_Touchers.webp","img/Ankle_On_The_Knee.webp","img/Arm_Circles.webp","img/Bent-Knee_Hip_Raise.webp","img/Body-Up.webp","img/Bodyweight_Squat.webp","img/Bottoms_Up.webp","img/Butt-Ups.webp","img/Butt_Lift_Bridge.webp","img/Calf_Stretch_Elbows_Against_Wall.webp","img/Calf_Stretch_Hands_Against_Wall.webp","img/Cat_Stretch.webp","img/Chair_Lower_Back_Stretch.webp","img/Childs_Pose.webp","img/Chin_To_Chest_Stretch.webp","img/Clock_Push-Up.webp","img/Cocoons.webp","img/Cross-Body_Crunch.webp","img/Crossover_Reverse_Lunge.webp","img/Crunch_-_Hands_Overhead.webp","img/Dancers_Stretch.webp","img/Dead_Bug.webp","img/Dips_-_Triceps_Version.webp","img/Double_Leg_Butt_Kick.webp","img/Dynamic_Back_Stretch.webp","img/Dynamic_Chest_Stretch.webp","img/Elbow_Circles.webp","img/Elbow_to_Knee.webp","img/Elbows_Back.webp","img/Floor_Glute-Ham_Raise.webp","img/Freehand_Jump_Squat.webp","img/Frog_Hops.webp","img/Frog_Sit-Ups.webp","img/Front_Leg_Raises.webp","img/Glute_Kickback.webp","img/Groin_and_Back_Stretch.webp","img/Groiners.webp","img/Handstand_Push-Ups.webp","img/Hip_Circles_prone.webp","img/Hug_Knees_To_Chest.webp","img/Inchworm.webp","img/Iron_Crosses_stretch.webp","img/Isometric_Chest_Squeezes.webp","img/Isometric_Neck_Exercise_-_Front_And_Back.webp","img/Isometric_Neck_Exercise_-_Sides.webp","img/Isometric_Wipers.webp","img/Jackknife_Sit-Up.webp","img/Janda_Sit-Up.webp","img/Knee_Across_The_Body.webp","img/Knee_Circles.webp","img/Knee_Tuck_Jump.webp","img/Kneeling_Forearm_Stretch.webp","img/Kneeling_Hip_Flexor.webp","img/Lateral_Bound.webp","img/Leg-Up_Hamstring_Stretch.webp","img/Leg_Pull-In.webp","img/Looking_At_Ceiling.webp","img/Lower_Back_Curl.webp","img/Lying_Crossover.webp","img/Lying_Glute.webp","img/Lying_Prone_Quadriceps.webp","img/Middle_Back_Stretch.webp","img/Mountain_Climbers.webp","img/Oblique_Crunches_-_On_The_Floor.webp","img/On_Your_Side_Quad_Stretch.webp","img/One_Arm_Against_Wall.webp","img/One_Half_Locust.webp","img/One_Knee_To_Chest.webp","img/Overhead_Stretch.webp","img/Overhead_Triceps.webp","img/Pelvic_Tilt_Into_Bridge.webp","img/Plank.webp","img/Plyo_Push-up.webp","img/Prone_Manual_Hamstring.webp","img/Push_Up_to_Side_Plank.webp","img/Pushups.webp","img/Rear_Leg_Raises.webp","img/Reverse_Crunch.webp","img/Rocket_Jump.webp","img/Runners_Stretch.webp","img/Russian_Twist.webp","img/Scissor_Kick.webp","img/Seated_Biceps.webp","img/Seated_Floor_Hamstring_Stretch.webp","img/Seated_Front_Deltoid.webp","img/Seated_Glute.webp","img/Seated_Hamstring.webp","img/Seated_Overhead_Stretch.webp","img/Shoulder_Circles.webp","img/Shoulder_Raise.webp","img/Shoulder_Stretch.webp","img/Side-Lying_Floor_Stretch.webp","img/Side_Bridge.webp","img/Side_Jackknife.webp","img/Side_Leg_Raises.webp","img/Side_Lying_Groin_Stretch.webp","img/Side_Neck_Stretch.webp","img/Side_Wrist_Pull.webp","img/Single-Arm_Push-Up.webp","img/Single_Leg_Glute_Bridge.webp","img/Sit-Up.webp","img/Sit_Squats.webp","img/Spider_Crawl.webp","img/Spinal_Stretch.webp","img/Split_Jump.webp","img/Split_Squats.webp","img/Standing_Hip_Circles.webp","img/Standing_Hip_Flexors.webp","img/Standing_Lateral_Stretch.webp","img/Standing_Pelvic_Tilt.webp","img/Standing_Soleus_And_Achilles_Stretch.webp","img/Standing_Toe_Touches.webp","img/Star_Jump.webp","img/Stomach_Vacuum.webp","img/Superman.webp","img/The_Straddle.webp","img/Toe_Touchers.webp","img/Tricep_Side_Stretch.webp","img/Triceps_Stretch.webp","img/Tuck_Crunch.webp","img/Upper_Back-Leg_Grab.webp","img/Upper_Back_Stretch.webp","img/Upward_Stretch.webp","img/Windmills.webp","img/Worlds_Greatest_Stretch.webp","img/Wrist_Circles.webp"];
const TOTAL     = CRITIQUES.length + IMAGES.length;

/* met en cache une liste par lots, en réessayant une fois chaque échec */
async function mettreEnCache(cache, liste, taille, strict){
  for (let i = 0; i < liste.length; i += taille){
    const lot = liste.slice(i, i + taille);
    const resultats = await Promise.all(lot.map(async f => {
      for (let essai = 0; essai < 2; essai++){
        try {
          const rep = await fetch(f, {cache: "reload"});
          if (rep && rep.ok){ await cache.put(f, rep); return true; }
        } catch (e) {}
      }
      return false;
    }));
    if (strict && resultats.some(ok => !ok))
      throw new Error("fichier indispensable non mis en cache");
  }
}

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await mettreEnCache(cache, CRITIQUES, 3, true);   // bloquant
    await mettreEnCache(cache, IMAGES, 6, false);     // tolérant
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const cles = await caches.keys();
    await Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  /* Navigation : on sert toujours la page depuis le cache.
     C'est le point qui faisait défaut — l'application installée démarre sur
     l'adresse du dossier ("/corps-libre/"), qui n'est pas la même entrée de
     cache que "index.html". On traite les deux. */
  if (req.mode === "navigate"){
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const page = await cache.match("index.html") || await cache.match("./");
      if (page) return page;
      try { return await fetch(req); }
      catch (err) { return new Response("Application indisponible hors ligne.",
        {status: 503, headers: {"Content-Type": "text/plain; charset=utf-8"}}); }
    })());
    return;
  }

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, {ignoreSearch: true});
    if (hit) return hit;
    try {
      const rep = await fetch(req);
      if (rep && rep.ok && rep.type === "basic") cache.put(req, rep.clone());
      return rep;
    } catch (err) {
      return new Response("", {status: 504});
    }
  })());
});

/* la page peut demander l'état du cache pour l'afficher à l'utilisateur */
self.addEventListener("message", async e => {
  if (e.data === "etat-cache"){
    const cache = await caches.open(VERSION);
    const n = (await cache.keys()).length;
    e.source.postMessage({type: "etat-cache", enCache: n, total: TOTAL});
  }
});
