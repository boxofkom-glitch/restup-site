import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    { text: 'Le constat', href: getPermalink('/#constat') },
    { text: 'La méthode', href: getPermalink('/#methode') },
    { text: "L'appli", href: getPermalink('/#appli') },
    { text: 'Questions', href: getPermalink('/#questions') },
  ],
  actions: [
    { text: 'Espace client', href: '/portail/login.html' },
    { variant: 'primary', text: 'Audit gratuit', href: getPermalink('/contact') },
  ],
};

export const footerData = {
  links: [
    {
      title: 'RESTUP',
      links: [
        { text: 'Le constat', href: getPermalink('/#constat') },
        { text: 'La méthode', href: getPermalink('/#methode') },
        { text: "L'appli", href: getPermalink('/#appli') },
        { text: 'Questions fréquentes', href: getPermalink('/#questions') },
      ],
    },
    {
      title: 'Démarrer',
      links: [
        { text: 'Demander mon audit gratuit', href: getPermalink('/contact') },
        { text: 'Espace client', href: '/portail/login.html' },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [],
  footNote: `© RESTUP 2026 · Le partenaire de pilotage du restaurateur`,
};
