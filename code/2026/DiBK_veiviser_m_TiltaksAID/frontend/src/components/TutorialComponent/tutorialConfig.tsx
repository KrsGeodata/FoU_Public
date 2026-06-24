import type { TutorialConfig } from './TutorialTypes';

export const tutorialSteps: TutorialConfig[] = [
  {
    title: 'Velkommen til kartet',
    description: 'Nede til venstre finner du verktøylinjen. Bruk blyanten til å tegne i kartet, linjalen til å måle avstander og vinkelmåleren til å kontrollere vinkler i tegningen din.',
    gif: '/tutorialGIFs/toolbar.gif',
  },
  {
    title: 'Kalkulert Område',
    description: 'På eiendommen vises et grønt område. Dette markerer området som er beregnet som mulig byggeareal.',
    gif: '/tutorialGIFs/Greenarea.gif',
  },
  {
    title: 'Tegn bygningen din',
    description: 'Klikk på kartet for å plassere hjørnepunkter. Avslutt tegningen ved å klikke på startpunktet igjen.',
    gif: '/tutorialGIFs/draw.gif',
  },
  {
    title: 'Rediger og slett',
    description: 'Du kan alltid slette og redigere tegningen din.',
    gif: '/tutorialGIFs/edit.gif',
  },
  {
    title: 'Automatisk analyse',
    description: 'Når du er ferdig med å tegne, beregner vi automatisk avstander til vei, nabogrense og eksisterende bygninger, og fyller ut svarene for deg. Se over og dobbeltsjekk at alt stemmer.',
    gif: '/tutorialGIFs/Answers.gif',
  },
];
