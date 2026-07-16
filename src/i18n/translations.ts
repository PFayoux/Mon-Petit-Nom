export type Translations = {
  common: {
    cancel: string;
    save: string;
  };
  decisions: {
    loveButton: string;
    maybeButton: string;
    dislikeButton: string;
  };
  onboarding: {
    title: string;
    subtitle: string;
    namePlaceholder: string;
    continueButton: string;
    nameRequiredError: string;
  };
  tabs: {
    swipe: string;
    results: string;
    settings: string;
  };
  gender: {
    boy: string;
    girl: string;
    both: string;
  };
  swipe: {
    backButton: string;
    remainingCount: (count: number) => string;
    emptyTitle: string;
    emptySubtitle: string;
    popularityLabel: (boyCount: number, girlCount: number) => string;
  };
  results: {
    allGenderTab: string;
    lovedSection: string;
    maybeSection: string;
    dislikedSection: string;
    unmarkedSection: string;
    emptySection: string;
    editGenderButton: (name: string) => string;
    editGenderModalTitle: string;
  };
  settings: {
    title: string;
    displayNameLabel: string;
    resetButton: string;
    resetConfirmTitle: string;
    resetConfirmMessage: string;
  };
};

const en: Translations = {
  common: {
    cancel: 'Cancel',
    save: 'Save',
  },
  decisions: {
    loveButton: 'Love',
    maybeButton: 'Maybe',
    dislikeButton: 'Dislike',
  },
  onboarding: {
    title: 'Welcome to Mon Petit Nom',
    subtitle: "What's your name?",
    namePlaceholder: 'Your name',
    continueButton: 'Continue',
    nameRequiredError: 'Please enter a name to continue',
  },
  tabs: {
    swipe: 'Swipe',
    results: 'Results',
    settings: 'Settings',
  },
  gender: {
    boy: 'Boy',
    girl: 'Girl',
    both: 'Both',
  },
  swipe: {
    backButton: 'Back',
    remainingCount: (count) => `${count} name${count === 1 ? '' : 's'} left`,
    emptyTitle: "You've reviewed every name!",
    emptySubtitle: 'Check the Results tab to see how you did.',
    popularityLabel: (boyCount, girlCount) =>
      `${boyCount} boy${boyCount === 1 ? '' : 's'}, ${girlCount} girl${girlCount === 1 ? '' : 's'}`,
  },
  results: {
    allGenderTab: 'All',
    lovedSection: 'Loved',
    maybeSection: 'Maybe',
    dislikedSection: 'Disliked',
    unmarkedSection: 'Unmarked',
    emptySection: 'No names here yet',
    editGenderButton: (name) => `Edit gender for ${name}`,
    editGenderModalTitle: 'Choose a gender for this name',
  },
  settings: {
    title: 'Settings',
    displayNameLabel: 'Your name',
    resetButton: 'Reset all answers',
    resetConfirmTitle: 'Reset all answers?',
    resetConfirmMessage: 'This will clear every name you have reviewed. This cannot be undone.',
  },
};

const fr: Translations = {
  common: {
    cancel: 'Annuler',
    save: 'Enregistrer',
  },
  decisions: {
    loveButton: "J'adore",
    maybeButton: 'Peut-être',
    dislikeButton: "J'aime pas",
  },
  onboarding: {
    title: 'Bienvenue sur Mon Petit Nom',
    subtitle: 'Quel est ton prénom ?',
    namePlaceholder: 'Ton prénom',
    continueButton: 'Continuer',
    nameRequiredError: 'Merci de saisir un prénom pour continuer',
  },
  tabs: {
    swipe: 'Swipe',
    results: 'Résultats',
    settings: 'Réglages',
  },
  gender: {
    boy: 'Garçon',
    girl: 'Fille',
    both: 'Les deux',
  },
  swipe: {
    backButton: 'Retour',
    remainingCount: (count) => `${count} prénom${count === 1 ? '' : 's'} restant${count === 1 ? '' : 's'}`,
    emptyTitle: 'Tu as passé en revue tous les prénoms !',
    emptySubtitle: "Rends-toi dans l'onglet Résultats pour voir le bilan.",
    popularityLabel: (boyCount, girlCount) =>
      `${boyCount} garçon${boyCount === 1 ? '' : 's'}, ${girlCount} fille${girlCount === 1 ? '' : 's'}`,
  },
  results: {
    allGenderTab: 'Tous',
    lovedSection: 'Adorés',
    maybeSection: 'Peut-être',
    dislikedSection: 'Pas aimés',
    unmarkedSection: 'Non classés',
    emptySection: 'Aucun prénom ici pour le moment',
    editGenderButton: (name) => `Modifier le genre de ${name}`,
    editGenderModalTitle: 'Choisis un genre pour ce prénom',
  },
  settings: {
    title: 'Réglages',
    displayNameLabel: 'Ton prénom',
    resetButton: 'Réinitialiser les réponses',
    resetConfirmTitle: 'Réinitialiser toutes les réponses ?',
    resetConfirmMessage: 'Tous les prénoms déjà classés seront remis à zéro. Action irréversible.',
  },
};

export const translations = { en, fr } as const;
export type LanguageCode = keyof typeof translations;
