# Une seule liste de prénoms avec un champ genre, pas un fichier par genre

L'ADR-0002 prévoyait un fichier de données par genre (`boy-names.ts`, `girl-names.ts` à venir). En concevant le deck de Swipe unifié (chaque prénom unique swipé une seule fois, y compris les prénoms mixtes comme "Camille") et le sélecteur de genre par carte (qui a besoin d'un genre par défaut par prénom pour se pré-remplir), scinder par fichier obligeait à dédupliquer les prénoms mixtes à la volée entre deux tableaux — complexité qui disparaît si le genre est simplement un champ de chaque entrée.

Décision : une seule liste `NAMES: Name[]`, chaque entrée `{ name: string; gender: 'boy' | 'girl' | 'both' }` (champ extensible pour de futures métadonnées d'affichage). `gender` ici est le genre "communément associé" au prénom dans la donnée statique — pas le choix de l'utilisateur, qui est stocké séparément par review (voir `CONTEXT.md`, "Genre par défaut" vs "Genre choisi").

## Status
accepted

## Consequences
- Les prénoms mixtes (Camille, Dominique, Claude, Maxime, ...) sont marqués `gender: 'both'` dès la curation initiale, une seule entrée au lieu d'un doublon dans deux fichiers.
- Le filtre de genre (Swipe et Résultats) lit `name.gender` pour les prénoms non classés, mais `review.gender` pour les prénoms déjà notés — ce sont deux champs distincts qui peuvent diverger (ex: un prénom `gender: 'both'` dans la liste statique mais noté "j'adore pour une fille" par l'utilisateur).
