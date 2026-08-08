<p align="center">
  <img src="assets/images/logo.png" width="120" alt="Logo Mon Petit Nom" />
</p>

<h1 align="center">Mon Petit Nom</h1>

<p align="center">
  Une app pour choisir un prénom en couple — chacun swipe de son côté, puis vous comparez.
</p>

## Le principe

Mon Petit Nom aide un couple à choisir un prénom de naissance sans avoir à se mettre d'accord tout de suite. Chaque personne installe l'app sur son propre téléphone, passe en revue les prénoms un par un (swipe) et les classe en ❤️ J'adore, 🤔 Peut-être ou ✕ Pas aimé. Une fois les deux listes constituées, chacun peut exporter la sienne et importer celle de l'autre pour voir directement, dans Résultats, les prénoms qu'ils ont en commun — et ceux que l'autre a aimés sans qu'on les ait encore vus.

Pas de compte, pas de serveur : tout le classement reste stocké localement sur l'appareil, et l'échange entre partenaires passe par un simple fichier envoyé via la feuille de partage native du téléphone (WhatsApp, AirDrop, Nearby Share, ce que vous voulez).

## Fonctionnalités

- **Swipe** à travers environ 2000 prénoms français (dataset [INSEE](https://www.data.gouv.fr/)), avec pour chacun sa popularité en France depuis 1900 et un lien vers son étymologie sur le Wiktionnaire.
- **Résultats** groupés par avis (Adoré / Peut-être / Pas aimé / Non classé) et filtrables par genre (Garçon / Fille / Les deux / Tous), avec possibilité de corriger le genre choisi après coup.
- **Comparaison entre partenaires** : exporte ta liste (❤️/🤔 uniquement — tes ✕ restent privés), importe celle de ton/ta partenaire depuis Réglages, et retrouve un onglet dédié dans Résultats avec vos prénoms en commun (un cœur indique la force de la correspondance : 💗 vous adorez tous les deux, 💚 l'un adore et l'autre hésite, 🩶 vous hésitez tous les deux) ainsi que les découvertes — les prénoms que l'autre a aimés et que tu n'as pas encore classés.

## Stack technique

- [Expo](https://expo.dev) (SDK 57) + [Expo Router](https://docs.expo.dev/router/introduction/) sur React Native 0.86 / React 19, en TypeScript.
- Stockage 100% local (`@react-native-async-storage/async-storage`) — pas de backend.
- Jest + [Testing Library](https://callstack.github.io/react-native-testing-library/) pour les tests unitaires et d'écran, [Playwright](https://playwright.dev/) pour les tests de mise en page (build web).
- Cibles : Android et iOS (build natif), ainsi que le web (export statique).

## Démarrer

Prérequis : Node.js et npm.

```bash
npm install
npx expo start
```

Depuis là, tu peux lancer l'app sur Android (`npm run android`), iOS (`npm run ios`) ou le web (`npm run web`) — voir la [doc Expo](https://docs.expo.dev/) pour la mise en place de l'environnement natif si besoin.

> Ce projet suit d'assez près les évolutions d'Expo — voir [`AGENTS.md`](./AGENTS.md) si tu modifies du code touchant au SDK.

## Tests

```bash
npm test          # tests unitaires et d'écran (Jest)
npm run test:e2e  # tests de mise en page (Playwright, build web)
npm run lint       # ESLint
npx tsc --noEmit   # vérification des types
```

## Documentation du projet

- [`CONTEXT.md`](./CONTEXT.md) — glossaire du domaine : le vocabulaire produit à utiliser dans le code, les commits et les PR.
- [`docs/adr/`](./docs/adr) — décisions d'architecture (ADR) : le contexte, la décision retenue et les alternatives écartées pour chaque choix structurant.
- [`AGENTS.md`](./AGENTS.md) — note à l'attention des agents IA travaillant sur ce repo.

## Contribuer

Voir [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Licence

Tous droits réservés — voir [`LICENSE`](./LICENSE). Le code est public à titre de démonstration ; aucune permission n'est accordée de le réutiliser, copier ou redistribuer.
