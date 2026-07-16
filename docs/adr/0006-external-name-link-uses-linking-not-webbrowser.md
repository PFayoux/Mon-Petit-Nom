# Le lien externe sur la carte Swipe utilise `Linking.openURL`, pas `expo-web-browser`

`expo-web-browser` force une vue in-app (Chrome Custom Tabs / `SFSafariViewController`) et ne fait jamais le hand-off vers une app native installée. Or l'objectif de cette fonctionnalité est justement de laisser l'OS ouvrir une app dédiée si elle est installée (ex. l'app Wikipedia), sinon le navigateur par défaut — ce que seul `Linking.openURL` permet, en laissant l'OS résoudre l'URL comme n'importe quel lien externe.

## Status
accepted
