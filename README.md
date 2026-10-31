# Corps Libre

Application d'entraînement **sans aucun matériel**, à faire chez soi : callisthénie, gainage,
mobilité, étirements, assouplissements et renforcement articulaire.

131 exercices en français, 6 programmes progressifs, séances guidées au chronomètre,
suivi de progression. Fonctionne **entièrement hors ligne** une fois installée.

## Utilisation

Ouvrir l'adresse du site sur un téléphone, puis **« Ajouter à l'écran d'accueil »**
depuis le menu du navigateur. L'application s'installe avec son icône et se lance
en plein écran, sans barre d'adresse.

## Contenu

| Catégorie | Exercices |
|---|---|
| Étirements et assouplissements | 47 |
| Gainage | 30 |
| Callisthénie | 17 |
| Mobilité | 17 |
| Renforcement articulaire | 12 |
| Explosif | 8 |

16 zones du corps couvertes. Chaque exercice dispose d'une animation en deux images
(position de départ et position d'arrivée), d'étapes numérotées et d'un conseil d'exécution.

**Programmes :** Réveil du dos (4 semaines) · Gainage progressif (6) · Souplesse générale (8) ·
Callisthénie débutant (6) · Mobilité articulaire (4) · Posture anti-bureau (4).

## Fonctionnement technique

Application web statique, sans dépendance ni outil de compilation. Tout est servi
tel quel : ouvrir `index.html` suffit.

```
index.html     application complète (HTML, CSS, JS et données des exercices)
sw.js          service worker, met en cache les 136 fichiers pour l'usage hors ligne
manifest.json  déclaration d'installation sur l'écran d'accueil
img/           131 animations, deux images empilées par fichier WebP (~18 Ko pièce)
```

Les données de progression (historique, séances terminées, programmes en cours) sont
stockées dans le navigateur, sur l'appareil. Rien n'est envoyé nulle part, aucun compte
n'est nécessaire, aucune donnée ne sort du téléphone.

### Mise à jour du service worker

`sw.js` contient une constante `VERSION` calculée à partir du contenu des fichiers.
Après toute modification, il faut l'incrémenter, sinon les navigateurs continueront
de servir l'ancienne version depuis leur cache.

## Crédits et licence

Les photographies et la structure de données d'origine proviennent de
[Free Exercise DB](https://github.com/yuhonas/free-exercise-db), publié sous
[Unlicense](https://unlicense.org/) — domaine public.

Les exercices ont été sélectionnés pour un usage à domicile sans équipement, et les
textes français ont été entièrement réécrits.

## Avertissement

Ce programme ne remplace pas l'avis d'un professionnel de santé. En cas de douleur,
de blessure ou de pathologie connue, demandez conseil à un médecin ou à un
kinésithérapeute avant de commencer.
