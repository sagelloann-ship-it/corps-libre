"""Détecte les sprites dont les deux photos ne partagent pas le même cadrage.

Si l'appareil n'a pas bougé entre la position de départ et celle d'arrivée,
le FOND doit être identique : seul le sujet change. On mesure donc l'écart
sur une bande périphérique, là où il n'y a normalement que du décor."""
from PIL import Image, ImageChops, ImageStat
import os, json

DOSSIER = "/home/claude/app/img"
res = []
for f in sorted(os.listdir(DOSSIER)):
    if not f.endswith(".webp"): continue
    im = Image.open(os.path.join(DOSSIER, f)).convert("L")
    w, h2 = im.size; h = h2 // 2
    a = im.crop((0, 0, w, h)); b = im.crop((0, h, w, h2))
    diff = ImageChops.difference(a, b)
    # bande périphérique : 12 % de chaque bord
    mx, my = int(w*0.12), int(h*0.12)
    masque = Image.new("L", (w, h), 255)
    masque.paste(0, (mx, my, w-mx, h-my))
    bord = ImageStat.Stat(diff, masque).mean[0]
    global_ = ImageStat.Stat(diff).mean[0]
    res.append((f[:-5], round(bord,1), round(global_,1)))

res.sort(key=lambda r: -r[1])
graves = [r for r in res if r[1] > 28]
moyens = [r for r in res if 16 < r[1] <= 28]
bons   = [r for r in res if r[1] <= 16]
print(f"total : {len(res)} exercices")
print(f"  cadrage identique (écart de fond <= 16) : {len(bons)}")
print(f"  cadrage douteux (16 à 28)               : {len(moyens)}")
print(f"  cadrage franchement différent (> 28)    : {len(graves)}")
print("\nles 12 pires :")
for n,b,g in res[:12]: print(f"   {n[:42]:44} fond {b:5}   global {g:5}")
json.dump({"fige":[r[0] for r in graves+moyens]}, open("/home/claude/photos_fige.json","w"))
print(f"\n{len(graves)+len(moyens)} exercices à figer, liste écrite.")
