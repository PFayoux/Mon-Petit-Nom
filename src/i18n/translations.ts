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
    wiktionaryLinkButton: (name: string) => string;
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
    myViewTab: string;
    strongMatchLabel: string;
    partialMatchLabel: string;
    softMatchLabel: string;
  };
  settings: {
    title: string;
    displayNameLabel: string;
    resetButton: string;
    resetConfirmTitle: string;
    resetConfirmMessage: string;
    shareButton: string;
    shareErrorMessage: string;
    importButton: string;
    importErrorMessage: string;
    partnerProfilesTitle: string;
    selectPartnerButton: (name: string) => string;
    deselectPartnerButton: (name: string) => string;
    removePartnerButton: (name: string) => string;
    backupTitle: string;
    backupButton: string;
    backupErrorMessage: string;
    restoreButton: string;
    restoreErrorMessage: string;
    restoreConfirmTitle: string;
    restoreConfirmMessage: string;
    unrecognizedFileMessage: string;
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
    wiktionaryLinkButton: (name) => `Learn more about ${name} on Wiktionary`,
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
    myViewTab: 'Me',
    strongMatchLabel: 'Both loved',
    partialMatchLabel: 'One loved, one maybe',
    softMatchLabel: 'Both maybe',
  },
  settings: {
    title: 'Settings',
    displayNameLabel: 'Your name',
    resetButton: 'Reset all answers',
    resetConfirmTitle: 'Reset all answers?',
    resetConfirmMessage: 'This will clear every name you have reviewed. This cannot be undone.',
    shareButton: 'Share my list',
    shareErrorMessage: 'Could not share your list. Please try again.',
    importButton: 'Import a list',
    importErrorMessage: 'Could not import this file. Please check it is a list exported from this app.',
    partnerProfilesTitle: 'Partner lists',
    selectPartnerButton: (name) => `Compare with ${name}`,
    deselectPartnerButton: (name) => `Stop comparing with ${name}`,
    removePartnerButton: (name) => `Remove ${name}'s list`,
    backupTitle: 'Backup',
    backupButton: 'Back up my data',
    backupErrorMessage: 'Could not create a backup. Please try again.',
    restoreButton: 'Restore a backup',
    restoreErrorMessage: 'Could not restore this file. Please check it is a backup exported from this app.',
    restoreConfirmTitle: 'Restore this backup?',
    restoreConfirmMessage:
      'This will replace all your current data (reviewed names, partner lists) with the backup. This cannot be undone.',
    unrecognizedFileMessage: "This file isn't recognized by Mon Petit Nom.",
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
    wiktionaryLinkButton: (name) => `En savoir plus sur ${name} sur Wiktionnaire`,
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
    myViewTab: 'Moi',
    strongMatchLabel: 'Vous adorez tous les deux',
    partialMatchLabel: "L'un adore, l'autre pense peut-être",
    softMatchLabel: 'Vous hésitez tous les deux',
  },
  settings: {
    title: 'Réglages',
    displayNameLabel: 'Ton prénom',
    resetButton: 'Réinitialiser les réponses',
    resetConfirmTitle: 'Réinitialiser toutes les réponses ?',
    resetConfirmMessage: 'Tous les prénoms déjà classés seront remis à zéro. Action irréversible.',
    shareButton: 'Partager ma liste',
    shareErrorMessage: 'Impossible de partager ta liste. Réessaie.',
    importButton: 'Importer une liste',
    importErrorMessage: "Impossible d'importer ce fichier. Vérifie qu'il s'agit bien d'une liste exportée depuis l'app.",
    partnerProfilesTitle: 'Listes partenaires',
    selectPartnerButton: (name) => `Comparer avec ${name}`,
    deselectPartnerButton: (name) => `Arrêter de comparer avec ${name}`,
    removePartnerButton: (name) => `Supprimer la liste de ${name}`,
    backupTitle: 'Sauvegarde',
    backupButton: 'Sauvegarder mes données',
    backupErrorMessage: 'Impossible de créer la sauvegarde. Réessaie.',
    restoreButton: 'Restaurer une sauvegarde',
    restoreErrorMessage:
      "Impossible de restaurer ce fichier. Vérifie qu'il s'agit bien d'une sauvegarde exportée depuis l'app.",
    restoreConfirmTitle: 'Restaurer cette sauvegarde ?',
    restoreConfirmMessage:
      'Toutes tes données actuelles (prénoms classés, listes partenaires) seront remplacées par celles de la sauvegarde. Action irréversible.',
    unrecognizedFileMessage: "Ce fichier n'est pas reconnu par Mon Petit Nom.",
  },
};

export const translations = { en, fr } as const;
export type LanguageCode = keyof typeof translations;
