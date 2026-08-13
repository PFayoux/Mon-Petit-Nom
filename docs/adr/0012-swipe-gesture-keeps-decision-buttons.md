# Le geste de swipe complète les `DecisionButtons`, il ne les remplace pas

Trois variantes ont été prototypées sur la carte Swipe : gesture-only façon Tinder (boutons supprimés), boutons seuls avec un feedback visuel léger au drag, et geste + boutons compacts posés sur les bords de la carte. Le choix final combine le geste "Tinder" (rotation, tampons diagonaux, envol de la carte à la validation) avec les `DecisionButtons` existants conservés tels quels sous la carte : glisser à gauche/haut/droite décide dislike/maybe/love, mais quelqu'un qui ne peut pas ou ne veut pas faire le geste garde un moyen de classer un prénom au tap. Nécessite `react-native-gesture-handler` (déjà en dépendance) monté sous un `GestureHandlerRootView` à la racine de l'app (`src/app/_layout.tsx`), requis pour que les gestes fonctionnent de façon fiable sur Android et dans les modales iOS.

## Status
accepted
