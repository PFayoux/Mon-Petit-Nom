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
