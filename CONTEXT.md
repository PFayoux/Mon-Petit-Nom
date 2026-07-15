# Mon Petit Nom

App de sélection de prénom en couple : on passe en revue des prénoms (swipe), on les classe, et on consulte les résultats groupés par avis.

## Language

**Prénom**:
Une entrée du jeu de données de base, aujourd'hui un simple nom (chaîne), source pour le swipe et les listes de résultats. Vit dans un fichier JS/JSON statique embarqué dans l'app (pas de backend).
_Avoid_: Nom, entrée

**Review**:
La décision de l'utilisateur sur un prénom : `love`, `maybe` ou `dislike`. L'absence de review sur un prénom = "non classé" (`unmarked`).
_Avoid_: Note, vote, statut (seul, hors contexte)

**Genre d'un prénom** _(concept futur, pas encore construit)_:
Aujourd'hui le genre d'un prénom est implicite : il vient du fichier dont il est issu (garçons vs filles, ajouté séparément). À terme, l'utilisateur pourra réaffecter le genre d'un prénom au moment de sa review (ex: choisir "Camille" pour un garçon), indépendamment du fichier d'origine, ou le marquer comme convenant aux deux genres ("mixte"). Toute évolution du modèle de review doit laisser la place à cette réaffectation sans obliger à tout redéfinir.
_Avoid_: Sexe (préférer "genre" pour rester cohérent avec le vocabulaire déjà utilisé côté produit)
