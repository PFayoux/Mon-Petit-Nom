# Le partage de liste entre partenaires passe par l'échange d'un fichier via la feuille de partage native, pas par du Bluetooth/Wi-Fi Direct/Quick Share

L'app est utilisée en couple, mais chaque personne l'installe sur son propre téléphone et classe les prénoms de son côté (voir CONTEXT.md) — rien ne permet aujourd'hui de savoir quels prénoms les deux personnes ont en commun. Comme l'app reste volontairement sans backend ([ADR-0002](./0002-name-dataset-storage.md)), le partage doit se faire directement de téléphone à téléphone, sans compte ni serveur intermédiaire.

Décision : la personne A exporte ses reviews `love`/`maybe` (jamais `dislike` — voir Conséquences) dans un fichier JSON `{ displayName, reviews }`, transmis via la feuille de partage native (`expo-sharing`) — n'importe quel canal déjà installé sur le téléphone (WhatsApp, AirDrop, et sur Android, Quick Share/Nearby Share apparaît automatiquement comme une des cibles de cette feuille, sans code spécifique). La personne B importe ce fichier depuis un bouton dans Réglages (sélecteur de fichier `expo-file-system`), qui vient remplacer tout import précédent portant le même `displayName`. Plusieurs profils importés peuvent coexister ; un seul est actif à la fois, choisi via un sélecteur dans Réglages.

## Status
proposed — implémentation en cours, découpée en plusieurs PR (voir la conversation de conception, non versionnée ici).

## Considered Options
- **Bluetooth / Wi-Fi Direct** : nécessite des modules natifs sans équivalent Expo managé de premier niveau, une UX d'appairage réelle, et un comportement asymétrique iOS/Android pour ce qui est fondamentalement un échange ponctuel de données — écarté.
- **Quick Share (Android)** : aucune API tierce publique n'existe pour le déclencher directement depuis une app — seule la feuille de partage native peut l'exposer comme cible parmi d'autres, ce qu'on obtient déjà gratuitement avec l'option retenue.
- **Lien profond avec charge utile encodée** (option envisagée initialement) : évite un fichier explicite, mais complique l'implémentation (encodage compact, gestion du deep link côté réception) sans bénéfice net une fois que l'utilisateur préfère explicitement un fichier + un bouton "Importer" dédié dans Réglages.
- **Backend/relais cloud** : rejeté d'emblée, incompatible avec le choix déjà fait de rester sans backend ([ADR-0002](./0002-name-dataset-storage.md)).

## Consequences
- Le fichier exporté ne contient que `love`/`maybe` : les `dislike` ne quittent jamais le téléphone, et n'ont de toute façon aucun usage dans la comparaison ou la découverte de prénoms manqués.
- La comparaison n'est jamais synchronisée : re-partager après une mise à jour de sa liste est une action manuelle, pas un flux continu.
- Rien n'empêche qu'un fichier soit réimporté sous un autre `displayName`, ou que deux personnes différentes choisissent le même `displayName` par coïncidence — accepté comme risque mineur, l'app n'ayant pas de vocation multi-utilisateurs adversariale.
- Fonctionnalité indisponible sur le build web (`expo-sharing` n'y supporte pas le partage de fichiers locaux) — n'est pas un problème pour l'usage ciblé (deux téléphones).
