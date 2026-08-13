# Les fichiers de sauvegarde et de partage partenaire s'ouvrent directement depuis une autre app (Android uniquement)

Jusqu'ici, importer une sauvegarde ou une liste partenaire exigeait de passer par Réglages puis le sélecteur de fichier — même si l'utilisateur venait de recevoir le fichier `.json` par WhatsApp ou un autre canal de partage. L'attente naturelle sur Android est de pouvoir taper directement sur le fichier reçu et de voir "Mon Petit Nom" proposé dans le menu "Ouvrir avec".

Décision : un `intentFilter` Android (`app.json` → `android.intentFilters`, action `VIEW`, catégorie `DEFAULT`, `data.mimeType: application/json`) enregistre l'app comme gestionnaire potentiel des fichiers `.json`. Contrainte assumée : Android ne permet pas de restreindre ce filtre à nos propres fichiers — le type MIME `application/json` est générique et partagé par de nombreuses autres apps (éditeurs de texte, autres apps de configuration…). Changer l'extension de nos exports n'aurait pas résolu le problème (une extension custom tombe sur `application/octet-stream`, encore plus générique) et aurait cassé les fichiers déjà partagés avant ce changement. L'app apparaîtra donc dans "Ouvrir avec" pour n'importe quel fichier JSON du téléphone, pas seulement les siens.

Cette imprécision est compensée après-coup, une fois le fichier effectivement ouvert : son contenu est lu et identifié structurellement (`src/lib/shared-file.ts`) — `kind: 'backup'` pour une sauvegarde, `{ displayName, reviews }` non tagué pour un profil partenaire (voir CONTEXT.md's "Fichier partagé"), sinon **non reconnu**. Un fichier reconnu suit exactement le même chemin que le bouton Réglages correspondant (`parseBackup` + confirmation destructive de restauration, ou `parsePartnerProfile` + import direct), et l'app bascule sur l'onglet Réglages. Un fichier non reconnu affiche un message dédié ("Ce fichier n'est pas reconnu par Mon Petit Nom") plutôt que les messages d'erreur d'import/restauration existants, qui eux restent réservés au cas où le fichier a le bon format mais un contenu invalide.

Scope volontairement limité à Android pour cette première version : iOS n'a pas d'équivalent haut-niveau dans la config Expo pour les types de documents (`CFBundleDocumentTypes` s'écrirait à la main dans `ios.infoPlist`, sans le même niveau de support), et l'usage réel de l'app est aujourd'hui testé sur Android.

## Status
accepted

## Considered Options
- **Changer l'extension des fichiers exportés pour la rendre unique à l'app** (ex. `.mpn`) : écarté — casse la compatibilité avec les fichiers déjà partagés, et un type MIME générique (`application/octet-stream`) reste tout aussi peu sélectif qu'`application/json`, donc aucun bénéfice réel.
- **Filtrer aussi sur le nom de fichier via `pathPattern`/`pathSuffix`** : écarté — ces filtres s'appliquent au chemin de l'URI, peu fiable pour les URI `content://` opaques que renvoient WhatsApp ou d'autres apps de partage (pas de nom de fichier exploitable dans l'URI elle-même).
- **Étendre le scope à iOS dans la même PR** : écarté pour l'instant — configuration native distincte et moins bien supportée par Expo, à traiter séparément si le besoin se confirme.

## Consequences
- Nouveau hook `useSharedFileImport` (`src/hooks/use-shared-file-import.ts`), branché dans le layout racine, qui écoute l'URL entrante via `expo-linking`, la lit avec `expo-file-system`, et réutilise `parseBackup`/`parsePartnerProfile`/`restoreFromBackup`/`importPartnerProfile` — aucune nouvelle logique d'import, seulement un nouveau point d'entrée.
- Cette fonctionnalité nécessite un rebuild natif (l'AndroidManifest généré change) : un reload Metro/JS seul ne suffit pas à la tester.
- Mon Petit Nom apparaîtra dans le menu "Ouvrir avec" pour des fichiers JSON sans rapport avec l'app — accepté comme compromis, atténué par le message "fichier non reconnu" plutôt qu'un comportement silencieux ou une erreur déroutante.
