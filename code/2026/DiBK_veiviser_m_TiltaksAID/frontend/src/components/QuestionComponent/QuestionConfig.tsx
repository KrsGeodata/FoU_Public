import type { Question, QuestionConfig } from './QuestionTypes';
import { questionImages } from '../../assets/questionImages/questionaImages';
import { PergolaDescription } from './PergolaDescription';
import { RoadDistanceDescription } from './RoadDistanceDescription';
import { useState, useEffect } from 'react';
/* 
import { RoadDistanceDescription } from './RoadDistanceDescription';
import { PergolaDescription } from './PergolaDescription';
import { questionImages } from '../../assets/questionImages/questionaImages';  
*/

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Maps question_name → JSX fields that can't come from the database.
// Covers: descriptionImage, descriptionContent, and option images.
const jsxEnrichments: Record<string, Partial<Question>> = {
  'building-usage': {
    descriptionImage: (
      <img src={questionImages.bo_sove} alt="Skal noen bo eller sove i bygningen?" className="mh-auto mb-2" />
    ),
  },
  'pergola': {
    descriptionContent: <PergolaDescription />,
  },
  'building-floors': {
    descriptionImage: (
      <img src={questionImages.loft_kjeller} alt="Skal bygningen ha kjeller, loft eller takterrasse?" className="mh-auto mb-2" />
    ),
  },
  'height': {
    descriptionImage: (
      <img src={questionImages.mone_gesims} alt="Er mønehøyde maksimalt 4,0 meter, og gesimshøyde maksimalt 3,0 meter?" className="mh-auto mb-2" />
    ),
  },
  'off-ramp': {
    descriptionImage: (
      <img src={questionImages.inkjorsel} alt="Trenger du ny eller endret avkjørsel mot vei?" className="mh-auto mb-2" />
    ),
  },
  'is-built': {
    descriptionImage: (
      <img src={questionImages.bebygd} alt="Er eiendommen bebygd?" className="mh-auto mb-2" />
    ),
  },
  'lnf-area': {
    descriptionImage: (
      <img src={questionImages.lnf} alt="Skal du bygge i et LNF-område?" className="mh-auto mb-2" />
    ),
  },
  'agricultural-building': {
    descriptionImage: (
      <img src={questionImages.landbruksbygg} alt="Skal du sette opp en landbruksbygning?" className="mh-auto mb-2" />
    ),
  },
  'placement-buildings': {
    descriptionImage: (
      <img src={questionImages.byggEgenEiendom} alt="Skal bygningen plasseres minst 1,0 meter fra andre bygninger på eiendommen din?" className="mh-auto mb-2" />
    ),
  },
  'placement-neighbours': {
    descriptionImage: (
      <img src={questionImages.nabogrense} alt="Skal det du bygger plasseres minst 1,0 meter fra nabogrensa?" className="mh-auto mb-2" />
    ),
  },
  'placement-pipes': {
    descriptionImage: (
      <img src={questionImages.vannror} alt="Skal du bygge over vann- og avløpsledninger?" className="mh-auto mb-2" />
    ),
  },
  'distance-to-road': {
    descriptionImage: (
      <img src={questionImages.veidistanse} alt="Skal du bygge i nærheten av offentlig vei?" className="mh-auto mb-2" />
    ),
  },
  'distance-to-road-possible': {
    descriptionContent: <RoadDistanceDescription />,
  },
  'flood-landslide': {
    descriptionImage: (
      <img src={questionImages.flomskred} alt="Skal du bygge i et flom- eller skredutsatt område?" className="mh-auto mb-2" />
    ),
  },
  'distance-to-sea': {
    descriptionImage: (
      <img src={questionImages.sjo} alt="Skal du bygge nærmere enn 100 meter fra sjøen?" className="mh-auto mb-2" />
    ),
  },
  'train-tracks': {
    descriptionImage: (
      <img src={questionImages.jernbaneA} alt="Skal du bygge nærmere enn 30 meter til et jernbanespor?" className="mh-auto mb-2" />
    ),
  },
};

// Option images are keyed by question_name → option value → image element.
const optionImageEnrichments: Record<string, Record<string, React.ReactNode>> = {
  'building-type': {
    'Garasje eller carport': <img src={questionImages.garasje} alt="Garasje eller carport" className="w-90" />,
    'Hagestue, bod eller drivhus': <img src={questionImages.anneks} alt="Hagestue, bod eller drivhus" className="w-90" />,
    'Verksted, atelier eller kontor': <img src={questionImages.anneks_flerbruk} alt="Verksted, atelier eller kontor" className="w-90" />,
    'Frittliggende pergola': <img src={questionImages.lysthus} alt="Frittliggende pergola" className="w-90" />,
    'Hytte, fritidsbolig eller anneks': <img src={questionImages.anneks} alt="Hytte, fritidsbolig eller anneks" className="w-90" />,
  },
};

export const useQuestionConfig = () => {
  const [config, setConfig] = useState<QuestionConfig | null>(null);
  useEffect(() => {
    fetch(`${API_BASE_URL}/survey-config`)
      .then(r => r.json())
      .then(data => setConfig(applyJsxEnrichments(data)));
  }, []);
  return config;
};

// Merges JSX enrichments back into the config returned from the API.
export const applyJsxEnrichments = (config: QuestionConfig): QuestionConfig => ({
  ...config,
  questionSection: config.questionSection.map(section => ({
    ...section,
    questions: section.questions.map(question => {
      const questionEnrichment = jsxEnrichments[question.id] ?? {};
      const optionImages = optionImageEnrichments[question.id];

      const enrichedOptions = optionImages && 'options' in question
        ? question.options.map(opt => ({
          ...opt,
          image: optionImages[opt.value] ?? opt.image,
        }))
        : 'options' in question ? question.options : [];

      return {
        ...question,
        ...questionEnrichment,
        ...('options' in question ? { options: enrichedOptions } : {}),
      } as Question;  // 
    }),
  })),
});

/**
 * Question Configuration
 *
 * This file defines the questions and flow for the building permit survey.
 *
 * Key features:
 * - Conditional questions using 'showWhen' property
 * - Support for multiple question types: 'single-select', 'number'
 * - Validation with 'required' field
 * - Custom layouts: 'vertical', 'horizontal', 'grid'
 * - Early survey termination with 'endsSurvey' on options
 * - Warning messages on options with 'danger' or 'info' type
 *
 * How to add conditional logic:
 * Use 'showWhen' array with condition types:
 * - 'equals': answer === value
 * - 'greater-than': answer > value (numeric)
 * - 'less-than': answer < value (numeric)
 * - 'answered': question has been answered
 * - 'not-answered': question has not been answered
 *
 * Use 'matchType' to control how multiple showWhen conditions are combined:
 * - 'all' (default): all conditions must be met (AND logic)
 * - 'any': at least one condition must be met (OR logic)
 *
 * Example (AND logic - default):
 * showWhen: [
 *   { questionId: 'building-type', condition: { type: 'equals', value: 'Garasje eller carport' } },
 *   { questionId: 'building-usage', condition: { type: 'equals', value: 'no' } }
 * ]
 *
 * Example (OR logic):
 * matchType: 'any',
 * showWhen: [
 *   { questionId: 'building-type', condition: { type: 'equals', value: 'Garasje eller carport' } },
 *   { questionId: 'building-type', condition: { type: 'equals', value: 'Hagestue, bod eller drivhus' } }
 * ]
 */

/* export const questionConfig: QuestionConfig = {
  id: 'tiltaksAID',
  title: 'Kommunens tiltaksAID',
  description: 'Kan jeg bygge uten å søke?',
  completionMessage: 'Du er ferdig melding',
  questionSection: [
    {
      id: 'general-questions',
      title: 'Del 1',
      questions: [
    // Question 1: Building type selection
    {
      id: 'building-type', // Unique ID - used to reference this question in showWhen conditions
      type: 'single-select', // Question type: single-select or number
      title: 'Hvilken type bygning skal du bygge?',
      description: 'Velg den bygningstypen som du ønsker å sette opp.', // Optional additional description text
      required: true, // If true, user must answer before proceeding
      options: [
        { value: 'Garasje eller carport', 
          label: 'Garasje eller carport', 
          image: 
            (<img src={questionImages.garasje} alt="Garasje eller carport" className=" w-90"/>)
          },
        { value: 'Hagestue, bod eller drivhus', 
          label: 'Hagestue, bod eller drivhus', 
          image: 
            (<img src={questionImages.anneks} alt="Hagestue, bod eller drivhus" className=" w-90"/>)
          },
        { value: 'Verksted, atelier eller kontor', 
          label: 'Verksted, atelier eller kontor', 
          image: 
            (<img src={questionImages.anneks_flerbruk} alt="Verksted, atelier eller kontor" className="w-90"/>)
          },
        { value: 'Frittliggende pergola', 
          label: 'Frittliggende pergola', 
          image: 
            (<img src={questionImages.lysthus} alt="Frittliggende pergola" className="w-90"/>)
          },
        { value: 'Hytte, fritidsbolig eller anneks', 
          label: 'Hytte, fritidsbolig eller anneks', 
          image: 
            (<img src={questionImages.anneks} alt="Hytte, fritidsbolig eller anneks" className=" w-90"/>),
          endsSurvey: true 
        },
      ],
      layout: 'grid', // Layout options: 'vertical', 'horizontal', 'grid'
    },

    {
      id: 'building-usage',
      type: 'single-select',
      title: 'Skal noen bo eller sove i bygningen?',
      description: 'Du må søke hvis du skal ha kjøkken, stue, bad, våtrom eller soverom i bygningen. Du kan ikke bo eller sove i bygningen. Skal noen bo eller sove i bygningen?',
      descriptionImage: 
        (<img src={questionImages.bo_sove} alt="Skal noen bo eller sove i bygningen?" className=" mh-auto mb-2"/>),
      required: true,
      matchType: 'any',
      // This question only appears when building-type equals 'Garasje eller carport'
      showWhen: [
        { questionId: 'building-type', condition: { type: 'equals', value: 'Garasje eller carport' } },
        { questionId: 'building-type', condition: { type: 'equals', value: 'Hagestue, bod eller drivhus' } }
      ],
      options: [
        { value: 'yes', label: 'Ja, noen skal bo eller sove der',    
            warning: { 
              message: 'Du må sende byggesøknad til kommunen. Du kan ikke bygge før søknaden er godkjent.', 
              type: 'danger' 
            }, 
          endsSurvey: true },
        { value: 'no', label: 'Nei, ingen skal bo eller sove der' },
      ],
    },

    {
      id: 'pergola',
      type: 'single-select',
      title: 'Skal pergolaen ha tak og vegger, for eksempel skyvbare lameller eller i glass?',
      descriptionContent: PergolaDescription(),
      required: true,
      showWhen: [
        { questionId: 'building-type', condition: { type: 'equals', value: 'Frittliggende pergola' } }
      ],
      options: [
        { value: 'yes', label: 'Ja, pergolaen skal ha tak og/eller vegger',
            warning: {
              message: 'En pergola med tak og vegger som er inntil 50 kvm, kan være unntatt søknadsplikt. For å finne ut om du må søke, start veiviseren på nytt og velg stien «Hagestue, bod eller drivhus».',
              type: 'info'
            },
          endsSurvey: true },
        { value: 'no', label: 'Nei, det er en klassisk pergola uten tak',
            warning: {
              message: 'En klassisk pergola med bjelker, men uten tak, regnes aldri med i bebygd areal (BYA) og er unntatt søknadsplikt.',
              type: 'info'
            },
         },
      ],
    },

    {
      id: 'building-usage-workshop',
      type: 'single-select',
      title: 'Skal noen bo eller sove i bygningen?',
      description: 'Du må søke hvis du skal ha kjøkken, stue, bad, våtrom eller soverom i bygningen. Du kan ikke bo eller sove i bygningen. Skal noen bo eller sove i bygningen?',
      required: true,
      // This question only appears when building-type equals 'Verksted, atelier eller kontor'
      showWhen: [
        { questionId: 'building-type', condition: { type: 'equals', value: 'Verksted, atelier eller kontor' } }
      ],
      options: [
        { value: 'yes', label: 'Ja, noen skal bo eller sove der',    
            warning: { 
              message: 'Du må sende byggesøknad til kommunen. Du kan ikke bygge før søknaden er godkjent.', 
              type: 'danger' 
            }, 
          endsSurvey: true },
        { value: 'no', label: 'Nei, ingen skal bo eller sove der' },
      ],
    },

    {
      id: 'building-rooms',
      type: 'single-select',
      title: 'Skal det bli en bygning med flere rom?',
      required: true,
      // This question only appears when building-usage equals 'no'
      showWhen: [{ questionId: 'building-usage', condition: { type: 'equals', value: 'no' } }],
      options: [
        { value: 'yes', label: 'Ja' },
        { value: 'no', label: 'Nei' },
      ],
    },

    {
      id: 'room-usage',
      type: 'single-select',
      title: 'Skal noen av rommene være enten kontor, atelier, hobby, arbeidsrom eller treningsrom?',
      required: true,
      showWhen: [{ questionId: 'building-rooms', condition: { type: 'equals', value: 'yes' } }],
      options: [
        { value: 'yes', label: 'Ja',
            warning: { 
              message: 'Opplysning: Du må lage en gasstett skillevegg mellom garasjen og dette rommet, for å beskytte de som skal bruke rommet mot gass og eksos.', 
              type: 'info' 
            }, 
         },
        { value: 'no', label: 'Nei' },
      ],
    },

    {
      id: 'building-floors',
      type: 'single-select',
      title: 'Skal bygningen ha kjeller, loft eller takterrasse?',
      description: 'Du har kun lov å bygge én etasje uten å søke. Du må søke hvis du vil ha kjeller, loft eller takterrasse. Du kan likevel ha et lite kryploft uten at du trenger å søke. Bygningen kan ikke ligge under terreng.', 
      descriptionImage: 
        (<img src={questionImages.loft_kjeller} alt="Skal noen bo eller sove i bygningen?" className=" mh-auto mb-2"/>),
      required: true,
      showWhen: [{ questionId: 'building-type', condition: { type: 'not-equals', value: 'Frittliggende pergola' } }],
      options: [
        { value: 'yes', label: 'Ja', 
            warning: { 
              message: 'Du må sende byggesøknad til kommunen om du vil ha kjeller, loft, takterrasse eller hvis bygningen skal ligge under terreng. Du kan ikke bygge før søknaden er godkjent.', 
              type: 'danger' 
           },
          endsSurvey: true },
        { value: 'no', label: 'Nei' }
      ],
    },


    {
      id: 'height',
      type: 'single-select',
      title: 'Er mønehøyde maksimalt 4,0 meter, og gesimshøyde maksimalt 3,0 meter?',
      descriptionImage: 
        (<img src={questionImages.mone_gesims} alt="Skal noen bo eller sove i bygningen?" className=" mh-auto mb-2"/>),
      required: true,
      showWhen: [{ questionId: 'building-type', condition: { type: 'not-equals', value: 'Frittliggende pergola' } }],
      options: [
        { value: 'yes', label: 'Ja, mønehøyden er maksimalt 4,0 meter og gesimshøyden er maksimalt 3,0 meter' },
        { value: 'no', label: 'Nei, bygningen blir høyere enn dette',
            warning: { 
              message: 'Du må ha lavere mønehøyde og gesimshøyde, eller sende byggesøknad til kommunen. Du kan ikke bygge før søknaden er godkjent.', 
              type: 'danger' 
            }, 
          endsSurvey: true }
      ],
    },

    {
      id: 'off-ramp',
      type: 'single-select',
      title: 'Trenger du ny eller endret avkjørsel mot vei?',
      description: 'Du kan ha behov for ny eller endret avkjørsel mot vei hvis bygningen vil føre til dårligere siktforhold eller gi økt trafikk til eiendommen. Bygger du i nærheten av fylkesvei eller en riksvei, kan du søke digitalt til Statens Vegvesen. Gjelder det en kommunal vei, sender du inn søknad til kommunen din.',
      descriptionImage: 
        (<img src={questionImages.inkjorsel} alt="Skal noen bo eller sove i bygningen?" className=" mh-auto mb-2"/>),
      required: true,
      options: [
        { value: 'yes', label: 'Ja, jeg trenger ny eller endret avkjørsel mot vei', 
            warning: { 
              message: 'Du kan ikke bygge før du har skaffet en godkjent avkjørsel mot vei. Bygger du i nærheten av fylkesvei eller en riksvei, kan du søke digitalt til Statens vegvesen. Gjelder det en kommunal vei, sender du inn søknad til kommunen din.', 
              type: 'danger' 
            }, 
          endsSurvey: true },
        { value: 'no', label: 'Nei, jeg trenger ikke ny eller endret avkjørsel mot vei' }
      ],
    },

      ]
    },

// ===== part 2: Placement and distance questions =====
    {
      id: 'distance-questions',
      title: 'Del 2',
      questions: [
            {
      id: 'distance-from-neighbour',
      type: 'single-select',
      title: 'Er det mindre enn 8,0 meter til nærmeste bygning på naboeiendommen?',
      description: 'Da kan det være du må brannsikre de delene som er nærmere naboen enn 8,0 meter. Dette gjelder hvis f.eks. nabobygningen brukes som for eksempel hus, hytte, verksted, atelier eller kontor. Be om hjelp fra fagperson om du er usikker på om du trenger brannsikring.',
      matchType: 'any',
      required: true,
      showWhen: [
        { questionId: 'room-usage', condition: { type: 'equals', value: 'yes' } },
        { questionId: 'building-usage-workshop', condition: { type: 'equals', value: 'no' } }
      ],
      options: [
        { value: 'yes', label: 'Ja, det er mindre enn 8,0 meter til slike bygninger på naboeiendommen',
            warning: { 
              message: 'Det gjelder strengere brannkrav om det blir under 8,0 meter til for eksempel et bolighus eller et verksted på naboeiendom. I så fall må du brannsikre de delene av de du bygger som blir nærmere enn 8,0 meter fra naboen bygning. Brannmotstanden må være på minst El 30 (motstandsdyktig mot brann i 30 minutter).', 
              type: 'info' 
            }, 
         },
        { value: 'no', label: 'Nei, det er minst 8,0 meter til slike bygninger på naboeiendommen' },
      ],
    },
    
    {
      id: 'distance-from-neighbour2',
      type: 'single-select',
      title: 'Er det mindre enn 2,0 meter til bygning på naboeiendom?',
      description: 'Det er strengere brannkrav, hvis det på noe som helst punkt er mindre enn 2,0 meter fra det du bygger, til nærmeste bygning på naboeiendom. Da må du brannsikre de delene av bygningen som er nærmere naboen enn 2,0 meter. Dette kan gjelde både tak og vegger.',
      required: true,
      matchType: 'any',
      showWhen: [
        { questionId: 'room-usage', condition: { type: 'equals', value: 'no' } },
        { questionId: 'building-rooms', condition: { type: 'equals', value: 'no' } }
      ],
      options: [
        { value: 'yes', label: 'Ja, det er mindre enn 2,0 meter til bygning på naboeiendom',
            warning: { 
              message: 'Du må plassere bygningen minst 2,0 meter fra andre bygninger på naboeiendommen, eller brannsikre de delene av bygningen som er nærmere naboen enn 2,0 meter. Brannmotstanden må være minst EI 30 (motstandsdyktig mot brann i 30 minutter).', 
              type: 'info' 
            }, 
         },
        { value: 'no', label: 'Nei, det er minst 2,0 meter til bygning på naboeiendom' },
      ],
    },

    {
      id: 'is-built',
      type: 'single-select',
      title: 'Er eiendommen bebygd?',
      description: 'For å slippe å søke må eiendommen din være bebygd. Eiendommen din er bebygd hvis det for eksempel er et bolighus eller hytte på eiendommen fra før.',
      descriptionImage: 
        (<img src={questionImages.bebygd} alt="Skal noen bo eller sove i bygningen?" className=" mh-auto mb-2"/>),
      required: true,
      options: [
        { value: 'yes', label: 'Ja, eiendommen er bebygd' },
        { value: 'no', label: 'Nei, eiendommen er ikke bebygd',
            warning: { 
              message: 'Du må sende byggesøknad til kommunen. Du kan ikke bygge før søknaden er godkjent.', 
              type: 'danger' 
            },
        endsSurvey: true }
      ],
    },
    
    {
      id: 'regulations',
      type: 'single-select',
      title: 'Er eiendommen regulert?',
      description: 'Sjekk med kommunen om eiendommen din er regulert i enten kommuneplan, kommunedelplan eller reguleringsplan. Du kan som regel finne ut dette på kommunens nettsted.',
      required: true,
      options: [
        { value: 'yes', label: 'Ja, det finnes en reguleringsplan' },
        { value: 'no', label: 'Nei, det finnes ikke en reguleringsplan', 
            warning: { 
              message: 'Du trenger som regel en dispensasjon for å bygge noe på en eiendom hvor det ikke finnes en reguleringsplan. Hør med kommunen om hva det er lov å gjøre på eiendommen.', 
              type: 'danger' 
           },
        endsSurvey: true }
      ],
    },

    {
      id: 'lnf-area',
      type: 'single-select',
      title: 'Skal du bygge i et område regulert til landbruks-, natur- og friluftsformål eller reindrift? (LNF-område)',
      description: 'Det er begrensninger på hva du kan bygge i områder som er regulerte til landbruk, natur og friluftsformål samt reindrift. Dette kalles LNF-områder eller LNFR-områder. Du finner som regel informasjon om dette i kommuneplanens arealdel.', 
      descriptionImage: 
        (<img src={questionImages.lnf} alt="Skal du bygge i et LNF-område?" className=" mh-auto mb-2"/>),
      required: true,
      options: [
        { value: 'yes', label: 'Ja, jeg skal bygge i et LNF-område' },
        { value: 'no', label: 'Nei, jeg skal ikke bygge i et LNF-område' }
      ],
    },

    {
      id: 'agricultural-building',
      type: 'single-select',
      title: 'Skal du sette opp en landbruksbygning?',
      description: 'I LNF-områder er det bare tillatt å sette opp bygninger som har direkte tilknytning til landbruk eller stedbunden næring (tradisjonell landbruksvirksomhet).',
      descriptionImage: 
        (<img src={questionImages.landbruksbygg} alt="Skal du sette opp en landbruksbygning?" className=" mh-auto mb-2"/>),
      required: true,
      showWhen: [
        { questionId: 'lnf-area', condition: { type: 'equals', value: 'yes' } },
      ],
      options: [
        { value: 'yes', label: 'Ja, jeg skal sette opp landbruksbygning' },
        { value: 'no', label: 'Nei, jeg skal ikke sette opp en landbruksbygning', 
            warning: { 
              message: 'Du trenger dispensasjon. Dispensasjonen må være innvilget før du kan bygge det du ønsker i et LNF-område. Ta kontakt med kommunen for å høre om mulighetene for å få dispensasjon.', 
              type: 'danger' 
           },
          endsSurvey: true },
      ],
    },

    {
      id: 'building-size',
      type: 'single-select',
      title: 'Hvor stort blir det nye du skal bygge?',
      description: 'Du må søke hvis det du bygger får et samlet bruksareal (BRA) eller bebygd areal (BYA) som er større enn 50 kvadratmeter.', 
      required: true,
      options: [
        { value: 'yes', label: 'Større enn 50m²', endsSurvey: true },
        { value: 'no', label: 'Mindre enn 50m²' },
      ],
    },

    {
      id: 'placement-buildings',
      type: 'single-select',
      title: 'Skal bygningen plasseres minst 1,0 meter fra andre bygninger på eiendommen din?',
      description: 'Det du bygger må plasseres minst 1,0 meter fra andre bygninger på eiendommen din.', 
      descriptionImage: 
        (<img src={questionImages.byggEgenEiendom} alt="Skal bygningen plasseres minst 1,0 meter fra andre bygninger på eiendommen din?" className=" mh-auto mb-2"/>),
      required: true,
      options: [
        { value: 'yes', label: 'Ja, det blir minst 1,0 meter til andre bygninger på eiendommen min' }, 
        { value: 'no', label: 'Nei, det blir mindre enn 1,0 meter til andre bygninger', 
            warning: { 
              message: 'Du må plassere det du bygger minst 1,0 meter fra andre bygninger på eiendommen din.', 
              type: 'danger' 
           }, 
          endsSurvey: true }
      ],
    },

    {
      id: 'placement-neighbours',
      type: 'single-select',
      title: 'Skal det du bygger plasseres minst 1,0 meter fra nabogrensa?',
      description: 'Du må søke hvis det du bygger på noe som helst punkt er nærmere enn 1,0 meter fra nabogrensa.', 
      descriptionImage: 
        (<img src={questionImages.nabogrense} alt="Skal det du bygger plasseres minst 1,0 meter fra nabogrensa?" className=" mh-auto mb-2"/>),
      required: true,
      options: [
        { value: 'yes', label: 'Ja, det jeg bygger skal plasseres minst 1,0 meter fra nabogrensa' }, 
        { value: 'no', label: 'Nei, det jeg bygger skal plasseres nærmere enn 1,0 meter fra nabogrensa', 
            warning: { 
              message: 'Du må plassere det du bygger minst 1,0 fra nabogrensa eller sende byggesøknad til kommunen. Du kan ikke bygge før søknaden er godkjent.', 
              type: 'danger' 
           }, 
          endsSurvey: true }
      ],
    },

    {
      id: 'placement-pipes',
      type: 'single-select',
      title: 'Skal du bygge over vann- og avløpsledninger?',
      description: 'Du kan ikke plassere det du bygger over vann- og avløpsledninger. Kommunen må ha tilgang til disse ledningene for vedlikehold og reparasjon.', 
      descriptionImage: 
        (<img src={questionImages.vannror} alt="Skal du bygge over vann- og avløpsledninger?" className=" mh-auto mb-2"/>),
      required: true,
      options: [
        { value: 'yes', label: 'Ja, jeg skal bygge over vann- og avløpsledninger',
            warning: { 
              message: 'Du kan ikke bygge over vann- og avløpsledninger. Du må plassere det du bygger et annet sted eller kontakte kommunen for hjelp til å finne alternativ plassering.', 
              type: 'danger' 
           },   
        endsSurvey: true },
        { value: 'no', label: 'Nei, jeg skal ikke bygge over vann- og avløpsledninger' } 
      ],
    },


    {
      id: 'distance-to-road',
      type: 'single-select',
      title: 'Skal du bygge i nærheten av offentlig vei?',
      description: 'Du bygger i nærheten av offentlig vei hvis det er mindre enn 15 meter til gang- og sykkelvei, 15 meter til kommunal vei, 50 meter til fylkesvei 100 meter til riksvei (50 meter hvis området er uregulert). Avstanden måles fra midtlinjen i kjørebanen', 
      descriptionImage: 
        (<img src={questionImages.veidistanse} alt="Skal du bygge i nærheten av offentlig vei?" className=" mh-auto mb-2"/>),
      required: true,
      options: [
        { value: 'yes', label: 'Ja', 
            warning: { 
              message: 'Ønsker du å bygge nærmere offentlig vei i uregulert område enn avstandene som er nevnt, må du søke om dispensasjon.', 
              type: 'info' 
            }, 
        },
        { value: 'no', label: 'Nei' } 
      ],
    },

    {
      id: 'distance-to-road-possible',
      type: 'single-select',
      title: 'Kan du likevel velge plasseringen du ønsker deg?',
      descriptionContent: RoadDistanceDescription(),
      required: true,
      showWhen: [
        { questionId: 'distance-to-road', condition: { type: 'equals', value: 'yes' } },
      ],
      options: [
        { value: 'yes', label: 'Ja, jeg bygger langt nok unna vei' },
        { value: 'no', label: 'Nei, jeg bygger ikke langt nok unna vei', 
            warning: { 
              message: 'Du må søke om dispensasjon fra byggegrense mot offentlig vei. Gjelder det en fylkesvei eller en riksvei, kan du søke digitalt til Statens Vegvesen. Gjelder det en kommunal vei, sender du inn søknad til kommunen din.', 
              type: 'info' 
            }, 
          endsSurvey: true }
      ],
    },

    {
      id: 'flood-landslide',
      type: 'single-select',
      title: 'Skal du bygge i et flom- eller skredutsatt område?',
      description: 'Det kan være begrensninger på hva du kan bygge i områder hvor det er fare for, for eksempel ras, flom, stormflo og skred. For eksempel kan et kvikkleireskred bli utløst av veldig små terrenginngrep. Usikker på om du bor i et slikt område? Sjekk reguleringsplan, kommuneplan og hør med kommunen.',
      descriptionImage: 
        (<img src={questionImages.flomskred} alt="Skal du bygge i et flom- eller skredutsatt område?" className=" mh-auto mb-2"/>),
      required: true,
      options: [
        { value: 'yes', label: 'Ja' },
        { value: 'no', label: 'Nei' }
      ],
    },

    {
      id: 'flood-landslide-possible',
      type: 'single-select',
      title: 'Kan du likevel velge plasseringen du ønsker deg?',
      description: 'Sjekk reguleringsplanen eller kommuneplanens arealdel for informasjon om du likevel kan bygge der du ønsker. Finner du ikke informasjonen der, må du høre med kommunen.',
      required: true,
      showWhen: [
        { questionId: 'flood-landslide', condition: { type: 'equals', value: 'yes' } },
      ],
      options: [
        { value: 'yes', label: 'Ja, jeg har avklart med kommunen at jeg likevel kan bygge der jeg ønsker' },
        { value: 'no', label: 'Nei, det er fare for flom- eller skred i området',
            warning: { 
              message: 'Det kan være begrensninger på hva du har lov til å bygge i et slikt område. Ta kontakt med kommunen for informasjon om hva du har lov å bygge på eiendommen.', 
              type: 'danger' 
            }, 
         endsSurvey: true }
      ],
    },

    {
      id: 'distance-to-sea',
      type: 'single-select',
      title: 'Skal du bygge nærmere enn 100 meter fra sjøen?',
      description: 'Det er i utgangspunktet forbudt å bygge nærmere enn 100 meter fra sjøen. Dette området kalles 100-metersbeltet. Avstanden måles fra alminnelig høyvannsstand. Det kan også være begrensninger på hva du kan bygge nærmere enn 100 meter fra elver og innsjøer (vassdrag). Svaret finner du i reguleringsplan eller i kommuneplanens arealdel.',
      descriptionImage:
        (<img src={questionImages.sjo} alt="Skal du bygge nærmere enn 100 meter fra sjøen?" className=" mh-auto mb-2"/>),
      required: true,
      options: [
        { value: 'yes', label: 'Ja, jeg skal bygge nærmere sjøen', 
            warning: { 
              message: '', 
              type: 'danger' 
            }, 
         },
        { value: 'no', label: 'Nei, jeg skal bygge minst 100 meter fra sjøen' }
      ],
    },

    {
      id: 'distance-to-sea-possible',
      type: 'single-select',
      title: 'Kan du likevel velge plasseringen du ønsker deg?',
      description: 'Kommunen kan ha fastsatt en annen byggegrense i 100-metersbeltet. Denne finner du i reguleringsplanen eller i kommuneplanens arealdel. Hvis plasseringen til bygningen ikke er i strid med denne byggegrensa, kan du bygge. Ta kontakt med kommunen om du er usikker på hva og hvor du kan bygge.',
      required: true,
      showWhen: [
        { questionId: 'distance-to-sea', condition: { type: 'equals', value: 'yes' } },
      ],
      options: [
        { value: 'yes', label: 'Ja, det finnes en annen byggegrense for 100-metersbeltet som jeg holder meg innenfor' },
        { value: 'no', label: 'Nei, jeg kan ikke plassere bygningen der jeg ønsker',
            warning: { 
              message: 'Du må søke om dispensasjon. Dispensasjonen må være innvilget før du kan bygge i 100-metersbeltet. Ta kontakt med kommunen for å høre om mulighetene for å få innvilget en slik dispensasjon.', 
              type: 'danger' 
            }, 
         endsSurvey: true }
      ],
    },

    {
      id: 'train-tracks',
      type: 'single-select',
      title: 'Skal du bygge nærmere enn 30 meter til et jernbanespor?',
      description: 'Det må være minst 30 meter til nærmeste jernbanespor. Dette gjelder både togspor, t-banespor og trikkespor. Avstanden måles fra nærmeste spors midtlinje.',
      descriptionImage:
        (<img src={questionImages.jernbaneA} alt="Skal du bygge nærmere enn 30 meter til et jernbanespor?" className=" mh-auto mb-2"/>),
      required: true,
      options: [
        { value: 'yes', label: 'Ja, jeg skal bygge nærmere enn 30 meter til et jernbanespor', 
            warning: { 
              message: '', 
              type: 'danger' 
            }, 
         },
        { value: 'no', label: 'Nei, jeg skal ikke bygge nærmere enn 30 meter til et jernbanespor' }
      ],
    },

    {
      id: 'train-tracks-possible',
      type: 'single-select',
      title: 'Har du fått tillatelse til å bygge nærmere enn 30 meter?',
      description: 'For å bygge nærmere enn 30 meter fra nærmeste spors midtlinje, må du søke Bane NOR om tillatelse. Dette må du gjøre selv om det finnes en nærmere byggegrense mot jernbane i reguleringsplan. Les mer om byggegrense mot jernbane hos Bane NOR.',
      required: true,
      showWhen: [
        { questionId: 'train-tracks', condition: { type: 'equals', value: 'yes' } },
      ],
      options: [
        { value: 'yes', label: 'Ja, jeg har fått tillatelse til å bygge nærmere enn 30 meter' },
        { value: 'no', label: 'Nei, jeg må søke om tillatelse for å bygge nærmere',
            warning: { 
              message: 'Du må kontakte Bane NOR og søke om tillatelse til å bygge nærmere enn 30 meter fra nærmeste spors midtlinje.', 
              type: 'info' 
            }, 
        
        }
      ],
    },

    {
      id: 'utilization-type',
      type: 'single-select',
      title: 'Hvilken utnyttelsesgrad gjelder for eiendommen?',
      description: 'Finn utnyttelsesgraden i reguleringsplanen, og velg typen som er oppgitt der.',
      required: true,
      options: [
        { value: 'BYA', label: 'BYA' },
        { value: 'BRA', label: 'BRA'},
        { value: 'BTA', label: 'BTA'},

      ],
    },

    {
      id: 'bya-type',
      type: 'single-select',
      title: 'Er tiltaket innenfor tillatt utnyttelsesgrad?',
      description: 'Bebygd areal viser hvor stor del av tomten som er dekket av bygninger, parkering og terrasse. Garasje, carport og biloppstillingsplass skal også tas med. Terrasser lavere enn 0,5 meter over terrenget regnes ikke med i BYA. Bruk kartverktøyet til å legge til areal som mangler, og beregn samlet BYA.',
      required: true,
      showWhen: [
        { questionId: 'utilization-type', condition: { type: 'equals', value: 'BYA' } },
      ],
      options: [
        { value: 'yes', label: 'Ja, innenfor tillatt utnyttelsesgrad' },
        { value: 'no', label: 'Nei, ikke innenfor tillatt utnyttelsesgrad' },
      ],
    },

     {
      id: 'bra-type',
      type: 'single-select',
      title: 'Er tiltaket innenfor tillatt utnyttelsesgrad?',
      description: 'Boligareal måles i m². Arealet tas med der takhøyden er minst 1,90 meter og rommet har en bredde på minst 0,60 meter. Ved skråtak kan arealet måles inntil 0,60 meter utenfor punktet der takhøyden er 1,90 meter.',
      showWhen: [
        { questionId: 'utilization-type', condition: { type: 'equals', value: 'BRA' } },
      ],
      options: [
        { value: 'yes', label: 'Ja, innenfor tillatt utnyttelsesgrad' },
        { value: 'no', label: 'Nei, ikke innenfor tillatt utnyttelsesgrad' },
      ],
    },

    {
      id: 'bta-type',
      type: 'single-select',
      title: 'Er tiltaket innenfor tillatt utnyttelsesgrad?',
      description: 'Bruttoareal er hele arealet av bygningen, målt til utsiden av ytterveggene. I flermannsboliger skal halvparten av veggen du deler med naboen tas med. Begrepet brukes fortsatt i byggesaker og prosjektering.', 
      required: true,
      showWhen: [
        { questionId: 'utilization-type', condition: { type: 'equals', value: 'BTA' } },
      ],
      options: [
        { value: 'yes', label: 'Ja, innenfor tillatt utnyttelsesgrad' },
        { value: 'no', label: 'Nei, ikke innenfor tillatt utnyttelsesgrad' },
      ],
    },

    {
      id: 'verification',
      type: 'single-select',
      title: 'Du er selv ansvarlig for at tiltak er i tråd med regelverket',
      description: 'Ved å bekrefte godtar du at du selv må kontrollere om tiltaket er søknadspliktig. Veiledningsverktøyet er kun et hjelpemiddel og gir ikke en formell godkjenning.',
      required: true,
      options: [
        { value: 'yes', label: 'Jeg bekrefter at jeg har lest dette og er selv ansvarlig for at tiltaket er i tråd med regelverket' },
      ],
    },
    
      ]
    }
  ]
}; */

