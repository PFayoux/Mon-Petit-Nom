# La sauvegarde personnelle est un flux et un format distincts du partage partenaire

Jusqu'ici, le seul moyen de faire sortir des données de l'app était l'export partenaire ([ADR-0008](./0008-partner-list-sharing-via-file-export.md)) : un fichier `{ displayName, reviews }` ne contenant que les reviews `love`/`maybe`, pensé pour être lu par une autre personne sur son propre téléphone. Ce n'est pas suffisant pour sauvegarder son propre usage de l'app (changement de téléphone, réinstallation) : les `dislike` sont explicitement exclus de cet export, et rien ne permet de restaurer en une fois l'ensemble de l'état local (prénom affiché, profils partenaires déjà importés, partenaire actif).

Décision : une sauvegarde personnelle est un fichier séparé, `{ kind: 'backup', version: 1, displayName, reviews, partnerProfiles, activePartnerName }`, distinct du format `PartnerProfile` :
- `reviews` contient **tous** les statuts, y compris `dislike` — contrairement à un export partenaire, une sauvegarde n'est jamais lue par quelqu'un d'autre, il n'y a donc aucune raison d'en retirer quoi que ce soit.
- Elle couvre l'intégralité de l'état local pertinent (`displayName`, `partnerProfiles`, `activePartnerName`), pas seulement les reviews — l'objectif est de retrouver son téléphone tel qu'il était, pas juste ses prénoms classés.
- Les noms non classés n'ont pas besoin d'être listés explicitement : l'absence d'un prénom dans `reviews` équivaut déjà à "non classé" au moment de la restauration, c'est une simple conséquence du format existant, pas un champ à ajouter.
- `kind: 'backup'` évite qu'un fichier de partage partenaire soit accidentellement importé comme sauvegarde (ou l'inverse) avec un message d'erreur trompeur ; `version` identifie le format du fichier lui-même (pas la version de l'app — voir Considered Options) pour permettre une évolution future du format sans casser silencieusement les sauvegardes existantes.
- Restaurer une sauvegarde **remplace entièrement** l'état local courant plutôt que de fusionner avec les données déjà présentes sur l'appareil, avec une confirmation destructive explicite avant d'appliquer le changement (même pattern que la réinitialisation des réponses). Fusionner demanderait de résoudre des conflits (même prénom classé différemment des deux côtés, quel `displayName` garder, etc.) pour un bénéfice qui ne correspond à aucun cas d'usage identifié — le scénario visé est "je change de téléphone", pas "je synchronise deux téléphones actifs en parallèle".

Techniquement, cette feature réutilise l'infrastructure déjà en place pour le partage partenaire (`expo-sharing` pour l'export, sélecteur de fichier `expo-file-system` pour l'import), donc les mêmes contraintes de plateforme s'appliquent (voir ADR-0008) : indisponible sur le build web.

## Status
accepted

## Considered Options
- **Étendre l'export/import partenaire existant avec une option "inclure les dislikes"** : évite un nouveau format, mais mélangerait deux features à la sémantique très différente (partage en lecture seule vs remplacement destructif) dans la même UI et le même fichier — risque de confusion sur ce qu'un import va réellement faire. Écarté au profit de deux flux clairement séparés.
- **Fusionner au lieu de remplacer lors d'une restauration** : écarté, voir ci-dessus — complexité de résolution de conflits sans cas d'usage qui la justifie.
- **Suivre la version de l'app (`app.json`) plutôt qu'une version de format dédiée** : écarté — la version de l'app change à chaque release, y compris pour des changements sans impact sur le format de sauvegarde ; bloquer une restauration sur ce critère bloquerait presque toutes les restaurations dès la release suivante, pour rien.
- **Lister explicitement les prénoms non classés dans le fichier** : écarté — inutile, l'absence d'un prénom dans `reviews` a déjà ce sens partout ailleurs dans l'app.

## Consequences
- Nouveau type `Backup` (`src/types/name.ts`), nouvelles fonctions `buildBackup`/`exportBackup` (`src/lib/backup-export.ts`) et `parseBackup` (`src/lib/backup-import.ts`), nouvelle action de store `restoreFromBackup` (`src/hooks/use-app-store.tsx`) qui remplace `reviews`, `displayName`, `partnerProfiles` et `activePartnerName` ensemble.
- Nouvelle section "Sauvegarde" dans Réglages, visuellement séparée de "Partager avec mon/ma partenaire".
- Si le format de sauvegarde doit évoluer un jour, `version` s'incrémente et l'app peut alors décider d'une migration ou d'un rejet explicite — aucun mécanisme de migration n'existe pour l'instant, ce n'est pas un besoin avant qu'un premier changement de format se présente.
