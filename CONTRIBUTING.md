# Contribuer

Mon Petit Nom est un projet personnel : le code est public à titre de démonstration, mais ce n'est pas un projet open source qui cherche activement des contributions externes (voir la licence dans le [`README`](./README.md)). Ce document sert surtout de mémo pour garder le développement cohérent — mais si tu veux forker le projet, ouvrir une issue ou proposer une petite correction, voici comment le repo fonctionne.

## Avant de proposer une PR

Ouvre d'abord une issue pour en discuter. Plusieurs choix de design ont été volontairement écartés et documentés (voir les ADR ci-dessous) — une PR qui revient dessus sans discussion préalable a peu de chances d'être mergée telle quelle, et je ne garantis pas de délai de revue.

## Mise en place

```bash
npm install
npx expo start
```

Voir le [`README`](./README.md) pour les commandes de lancement Android/iOS/web.

## Avant de committer

```bash
npm test
npm run lint
npx tsc --noEmit
```

Les trois doivent passer sans erreur. Il n'y a pas de hook pre-commit configuré : c'est une vérification manuelle.

## Conventions du projet

- **Vocabulaire du domaine** — le code, les commits et les PR utilisent le vocabulaire défini dans [`CONTEXT.md`](./CONTEXT.md) (ex. "Genre choisi" vs "Genre par défaut"). À lire avant de toucher au code lié aux reviews, au genre ou au partage entre partenaires.
- **Décisions d'architecture** — les choix structurants sont documentés en ADR dans [`docs/adr/`](./docs/adr). Une PR qui revient sur une décision déjà actée doit mettre à jour ou remplacer l'ADR correspondant plutôt que de la contredire silencieusement.
- **Tests** — chaque écran a un fichier de test avec un seul `describe` racine ; les noms de test suivent le format Given/When/Then. Les fonctions pures de `src/lib/` ont leurs propres tests unitaires juste à côté (`*.test.ts`).
- **Branches et commits** — branches nommées `feat/…`, `fix/…` ou `chore/…` ; une PR par changement ciblé plutôt que des PR fourre-tout (voir l'historique des PR pour le style de message de commit).
- **Expo évolue vite** — voir [`AGENTS.md`](./AGENTS.md) : vérifie la doc Expo versionnée avant d'utiliser une API, certaines ont changé entre versions du SDK.

## Ce qui a peu de chances d'être accepté

- Un backend ou un système de compte utilisateur — l'app est volontairement 100% locale (voir [ADR-0002](./docs/adr/0002-name-dataset-storage.md)).
- Des dépendances lourdes pour un besoin mineur.

Si je ferme une PR sans la merger, ce n'est pas un jugement sur le travail fourni — c'est juste que ce repo reste avant tout un projet personnel.
