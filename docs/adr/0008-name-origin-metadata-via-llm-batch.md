# Les métadonnées d'origine des prénoms (langue/religion/pays) sont extraites une fois via un batch LLM, pas au runtime

Le Wiktionnaire n'expose pas ces trois informations comme des champs structurés — elles sont noyées dans une phrase de prose libre d'étymologie ("Du latin *Johannes*... issu de l'hébreu ancien..."). Les extraire proprement demande un vrai travail de compréhension de texte, peu fiable à faire par règles/regex sur ~2000 formulations différentes, et trop coûteux/lent à faire à la demande sur chaque carte (latence, gestion d'erreur réseau, cohérence d'un swipe à l'autre) — voir aussi [ADR-0006](./0006-external-name-link-uses-linking-not-webbrowser.md) et [ADR-0007](./0007-wiktionary-over-wikipedia-for-name-etymology.md) sur le choix du Wiktionnaire pour cette même donnée.

Décision : un script versionné (`scripts/enrich-names-etymology.ts`) récupère l'étymologie de chaque prénom sur le Wiktionnaire, puis soumet chaque texte à Claude Haiku 4.5 via l'API Batches (sortie structurée forcée par JSON Schema) pour extraire `originLanguage`/`originReligion`/`originCountry`, et réécrit `src/data/names.ts` avec le résultat. Le script est conservé dans le repo (contrairement au script d'import INSEE, jamais commité) car il peut devoir être ré-exécuté : nouveaux prénoms ajoutés au dataset, prompt à affiner, corrections d'extraction.

Ces champs sont purement informatifs/affichage, jamais des critères de filtre — cohérent avec la conséquence anticipée dans [ADR-0002](./0002-name-dataset-storage.md). Ils sont nullables indépendamment les uns des autres : un prénom sans mention explicite d'un aspect (ex: pas de religion associée) garde `null` sur ce champ plutôt qu'une valeur inventée — le prompt d'extraction interdit explicitement d'inférer une valeur non présente dans le texte source.

## Status
proposed — le type `Name` et le squelette du script sont en place (champs à `null` partout), mais le script n'a pas été exécuté et l'affichage sur la carte n'est pas fait. Mis de côté volontairement, à reprendre plus tard.

## Considered Options
- **Wikidata** (vérifié en session) : chaque prénom a une fiche (ex. `Jean` = Q7521081), mais aucune propriété structurée ne correspond à langue/religion/pays d'origine étymologique — écarté, aucune API structurée équivalente n'existe.
- **Extraction par mots-clés sans LLM** (regex sur "Du latin...", "De l'hébreu...", etc.) : coût nul, instantané, mais couverture/fiabilité plus faible, surtout pour religion/pays. Resterait une option si le budget API n'est pas souhaité.
- **Extraction interactive via Claude Code** (dans cette session, sans passer par l'API facturée séparément — l'abonnement claude.ai ne couvre pas l'API Anthropic, qui est un compte/facturation à part) : viable en théorie via des sous-agents, mais peu réaliste pour ~2000 prénoms en une fois (trop d'allers-retours, gros consommateur du quota de session).
- **Batch API + Claude Haiku 4.5** (l'option retenue si on reprend ce chantier) : coût estimé sous les 2$ pour tout le dataset, mais nécessite un compte API Anthropic séparé (facturation distincte du forfait claude.ai).

## Consequences
- La qualité des données dépend de la qualité du texte d'étymologie du Wiktionnaire et de l'extraction LLM — pas de vérification humaine systématique prévue pour ~2000 entrées.
- Régénérer ou corriger ces champs demande de relancer le script (payant, via l'API Batches), pas juste une édition de code.
- Tant que ce chantier n'est pas repris, `originLanguage`/`originReligion`/`originCountry` valent `null` pour tous les prénoms et ne sont affichés nulle part dans l'app.
