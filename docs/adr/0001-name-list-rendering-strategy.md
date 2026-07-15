# Rendu virtualisé des listes de prénoms plutôt que chargement asynchrone

La demande initiale envisageait un chargement asynchrone (générateur Node.js, chargement en arrière-plan ou au scroll) pour fluidifier l'affichage des listes de prénoms (aimé/peut-être/pas aimé/non classé). Or le projet n'a pas de backend : `BOY_NAMES` (et bientôt les prénoms filles) est un tableau statique déjà entièrement en mémoire côté client — il n'y a rien à streamer depuis un serveur.

Décision : le ralentissement vient du rendu (le `ScrollView` de `results.tsx` montait toutes les lignes de toutes les sections simultanément), pas du volume de données. On résout donc avec une **liste virtualisée** (`FlatList` natif React Native, sans nouvelle dépendance) qui ne monte que les lignes visibles.

Pour éviter le problème classique de listes virtualisées imbriquées dans un `ScrollView` (RN le déconseille explicitement, ça casse le windowing), l'écran Résultats passe d'un empilement de 4 sections repliables à un seul groupe affiché à la fois (onglets genre + onglets statut avec compteurs), donc une seule `FlatList` montée à l'écran à tout moment.

## Status
accepted

## Consequences
- `Collapsible` n'est plus utilisé dans `results.tsx` (peut rester dans `src/components/ui/` s'il sert ailleurs, sinon à retirer plus tard).
- Le choix de `FlatList` plutôt que `FlashList` (`@shopify/flash-list`) est volontairement différé : le dataset réel actuel est petit (~230 prénoms), `FlashList` sera reconsidéré si la perf se dégrade en approchant l'échelle cible (~10k, voir [ADR-0002](./0002-name-dataset-storage.md)) — swap localisé au composant de liste, pas au modèle de données.
