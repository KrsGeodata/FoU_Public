// Sidebar wrapper that hosts the building permit survey questionnaire.
// Renders the SurveyApp component inside a scrollable container.
import SurveyApp from '../QuestionComponent/QuestionPresentation';
import { useSurvey } from '../QuestionComponent/QuestionLogic';
import type { ProximityDetailPayload } from '../../lib/map/drawingHandlers';
import type { propertyDetailPayload } from '../../lib/map/getPlaces';
import { useQuestionConfig } from '../QuestionComponent/QuestionConfig';
import type { QuestionConfig } from '../QuestionComponent/QuestionTypes';



const EMPTY_CONFIG: QuestionConfig = {
  id: '',
  title: '',
  questionSection: [],
};

export function Aside({ onSectionComplete, onGoToMap, onReset, surveyState: externalSurveyState, mapScreenshot, arealplanerUrl, proximityDetailValue, propertyDetailValue }: {
  onSectionComplete?: (done: boolean) => void;
  onGoToMap?: () => void;
  onReset?: () => void;
  surveyState?: ReturnType<typeof useSurvey>;
  mapScreenshot?: string | null;
  arealplanerUrl?: string | null;
  proximityDetailValue?: ProximityDetailPayload | null;
  propertyDetailValue?: propertyDetailPayload | null;
}){
  // Create survey state here as fallback for standalone use (no Navigator parent)
  const config = useQuestionConfig();
  const internalSurveyState = useSurvey(config ?? EMPTY_CONFIG);
  const surveyState = externalSurveyState ?? internalSurveyState;


  return (
    <div className="h-full w-full overflow-x-hidden no-scrollbar">
      <SurveyApp
       onSectionComplete={onSectionComplete}
       onGoToMap={onGoToMap}
       onReset={onReset}
       surveyState={surveyState}
       mapScreenshot={mapScreenshot}
       arealplanerUrl={arealplanerUrl}
       proximityDetailSurveyApp={proximityDetailValue}
       propertyDetailSurveyApp={propertyDetailValue}
       />
    </div>
  )
}
