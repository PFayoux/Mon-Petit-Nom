# Mon Petit Nom

App de sélection de prénom en couple : on passe en revue des prénoms (swipe), on les classe, et on consulte les résultats groupés par avis.

## Language

**Prénom**:
Une entrée de la liste de données de base : `{ name, gender }` (et d'éventuelles métadonnées d'affichage plus tard). Une seule liste unifiée, pas de fichier séparé par genre (voir [ADR-0003](./docs/adr/0003-unified-name-list.md)). Vit dans un fichier JS/JSON statique embarqué dans l'app (pas de backend).
_Avoid_: Nom, entrée

**Review**:
La décision de l'utilisateur sur un prénom : `{ status, gender }`, où `status` est `love`, `maybe` ou `dislike`, et `gender` est `boy`, `girl` ou `both`. Pour un `dislike`, `gender` vaut toujours `both` automatiquement (on n'aime pas un prénom, indépendamment du sexe). L'absence de review sur un prénom = "non classé" (`unmarked`).
_Avoid_: Note, vote, statut (seul, hors contexte — un statut ne dit rien du genre)

**Genre par défaut** (`name.gender`):
Le genre "communément associé" à un prénom dans la liste statique — une donnée de curation, pas un choix utilisateur. Sert de valeur par défaut pour le sélecteur de genre (au swipe) et de critère de filtre pour les prénoms **non classés** sur Résultats/Swipe.
_Avoid_: Genre (seul, ambigu avec "genre choisi")

**Genre choisi** (`review.gender`):
Le genre que l'utilisateur associe à un prénom au moment de sa review — indépendant du genre par défaut du prénom (ex: "Camille" peut être `both` par défaut mais noté "j'adore pour une fille" spécifiquement). Une fois une review posée, c'est le genre choisi qui fait foi pour le filtrage, pas le genre par défaut. Modifiable après coup depuis Résultats (menu "⋮", uniquement sur les prénoms `love`/`maybe`).
_Avoid_: Sexe (préférer "genre" pour rester cohérent avec le vocabulaire déjà utilisé côté produit)

**Onglet de genre** :
Le widget Garçons/Filles/Les deux existe sur Swipe et sur Résultats, mais avec un sens différent (voir [ADR-0005](./docs/adr/0005-gender-tab-semantics-differ-by-screen.md)). Sur Swipe, il filtre les prénoms **non classés** par leur genre par défaut — "Les deux" y est un filtre inclusif : il montre tous les prénoms candidats, y compris ceux genrés garçon ou fille. Sur Résultats, un 4ᵉ onglet **"Tous"** s'ajoute (et devient l'onglet par défaut à l'ouverture) : lui seul montre tout, quel que soit le genre. "Garçons"/"Filles"/"Les deux" y filtrent les reviews par leur **genre choisi** à correspondance exacte (+ un review genré `both` convient aussi à "Garçons" et "Filles") — "Les deux" n'y montre que les reviews explicitement genrées `both`, ce n'est plus un filtre "tout montrer" comme sur Swipe.
_Avoid_: Filtre de genre (seul, sans préciser l'écran — le sens change selon Swipe ou Résultats)

**Profil partenaire** :
Un fichier `{ displayName, reviews }` importé depuis Réglages, exporté par une autre personne utilisant l'app sur son propre téléphone (voir [ADR-0008](./docs/adr/0008-partner-list-sharing-via-file-export.md)). Ne contient que ses reviews `love`/`maybe` — jamais `dislike`. Plusieurs profils partenaires peuvent être importés et conservés, mais un seul est **actif** à la fois ; réimporter un fichier portant le même `displayName` remplace le profil existant. Données en lecture seule : rien dans l'app n'écrit jamais dans un profil partenaire, seulement dans les reviews de l'utilisateur.
_Avoid_: Partenaire (seul — ambigu entre la personne réelle et le profil importé sur l'appareil)

**Correspondance** :
Le rapprochement entre une review de l'utilisateur et celle du profil partenaire actif sur un même prénom, uniquement parmi `love`/`maybe` (jamais `dislike`, exclu de l'export) — et seulement si leurs genres choisis respectifs sont compatibles (identiques, ou `both` en joker d'un côté ou de l'autre ; voir [ADR-0009](./docs/adr/0009-partner-match-requires-gender-compatibility.md)). Trois niveaux : `love`+`love` (forte), `love`+`maybe` dans un sens ou l'autre (partielle), `maybe`+`maybe` (faible) — affichés respectivement par un cœur rose, vert, gris. Un prénom aimé/peut-être par le partenaire mais non classé par l'utilisateur, ou classé par l'utilisateur pour un genre incompatible avec le choix du partenaire, n'est pas une correspondance : c'est une **découverte**, classable directement sur place. Dans l'onglet Partenaire, l'onglet Garçon/Fille sous lequel un prénom apparaît suit toujours le genre choisi par le partenaire, jamais celui de l'utilisateur — les choix du partenaire restent ainsi visibles même en l'absence de correspondance.
_Avoid_: Match (préférer le terme français, cohérent avec le reste du glossaire)

**Sauvegarde** :
Un fichier `{ kind: 'backup', version, displayName, reviews, partnerProfiles, activePartnerName }`, à ne pas confondre avec un **profil partenaire** : elle contient tout l'état local de l'utilisateur, y compris ses `dislike`, et sert à restaurer son propre téléphone (changement d'appareil, réinstallation) — pas à être lue par quelqu'un d'autre (voir [ADR-0010](./docs/adr/0010-personal-data-backup-and-restore.md)). Restaurer une sauvegarde remplace entièrement l'état local courant, ce n'est jamais une fusion.
_Avoid_: Export, sauvegarde (seul, sans précision — toujours distinguer d'un "profil partenaire", qui est un export partiel destiné à être partagé)

**Fichier partagé** :
Un fichier `.json` ouvert dans l'app via "Ouvrir avec Mon Petit Nom" depuis une autre app (WhatsApp, un gestionnaire de fichiers…), sur Android uniquement (voir [ADR-0011](./docs/adr/0011-open-with-shared-json-files.md)). Son contenu est identifié après coup (`kind: 'backup'` vs `displayName`+`reviews` non taggé) car Android ne permet pas de filtrer plus finement que le type MIME `application/json`, partagé par bien d'autres apps. Une fois identifié, il suit exactement le même chemin qu'un import/restauration déclenché depuis Réglages ; un fichier non reconnu affiche un message dédié plutôt que d'être traité comme une erreur d'import classique.
_Avoid_: Deep link (ce n'est pas un lien vers une route de l'app, mais un fichier reçu via un intent `VIEW`/MIME type)
