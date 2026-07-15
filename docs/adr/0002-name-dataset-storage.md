# Stockage du dataset de prénoms : JSON/JS scindé par genre, pas SQLite

Le dataset va grossir significativement (ajout des prénoms filles, métadonnées d'affichage type origine/signification, cible ~10k prénoms à terme). Deux options ont été évaluées : rester sur des fichiers JS/JSON statiques filtrés en mémoire, ou passer à une base locale structurée (`expo-sqlite`).

Décision : on reste sur des fichiers JS/JSON, scindés par genre (un fichier garçons, un fichier filles à venir) pour ne charger que ce qui est utile. À 10k entrées le filtrage en mémoire (`Array.filter`/`useMemo`) reste largement sous la milliseconde. SQLite n'est pas retenu car le seul filtre prévu à terme est le genre — aucune recherche plein texte ni filtre croisé sur les métadonnées n'est envisagé, donc la complexité d'une vraie base (schéma, migrations, requêtes) ne serait pas rentabilisée.

## Status
superseded by [ADR-0003](./0003-unified-name-list.md) — la partie "pas de SQLite" tient toujours, mais "scindé par genre" a été abandonné au profit d'une liste unique.

## Consequences
- Les métadonnées additionnelles (origine, signification) seront purement informatives/affichage, pas des critères de filtre — si ça change, cette décision doit être révisée.
- Si le volume ou les besoins de filtre dépassent ce qui est prévu ici, migrer vers SQLite impliquera une réécriture de la couche de données (pas juste un swap de composant, contrairement à [ADR-0001](./0001-name-list-rendering-strategy.md)).
