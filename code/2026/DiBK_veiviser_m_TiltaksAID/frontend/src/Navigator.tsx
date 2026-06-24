// Main index page layout: a split-screen with an interactive Leaflet map (65%)
// on the left and the survey/question sidebar (35%) on the right.
// A loading overlay is shown during async map operations.
// Survey state is lifted here so the map can auto-answer questions after drawing.
import Map from './components/MapComponent/Map';
import { Aside } from './components/AsideComponent/Aside';
import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TutorialOverlay from './components/TutorialComponent/TutorialOverlay';

import './App.css';
import LoadingAnimation from './components/LoadingAnimation/Loadingcomponent';
import { useSurvey } from './components/QuestionComponent/QuestionLogic';
import type { ProximityDetailCallback, ProximityDetailPayload } from './lib/map/drawingHandlers';
import type { propertyDetailCallback, propertyDetailPayload } from './lib/map/getPlaces';
import { useQuestionConfig } from './components/QuestionComponent/QuestionConfig';
import type { QuestionConfig } from './components/QuestionComponent/QuestionTypes';

const EMPTY_CONFIG: QuestionConfig = {
  id: '',
  title: '',
  questionSection: [],
};

function Navigator() {
  const [searchParams] = useSearchParams();
  const initialAddress = searchParams.get('adresse') ?? undefined;
  const [isLoading, setIsLoading] = useState(false);
  const [firstSectionDone, setFirstSectionDone] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [drawingDone, setDrawingDone] = useState(false);
  const [mapScreenshot, setMapScreenshot] = useState<string | null>(null);
  const [arealplanerUrl, setArealplanerUrl] = useState<string | null>(null);
  const [proximityDetailState, setProximityStatement] = useState<ProximityDetailPayload | null>(null);
  const [propertyRawData, setPropertyData] = useState<propertyDetailPayload | null>(null);
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialKey, setTutorialKey] = useState(0);


  const config = useQuestionConfig();
  const surveyState = useSurvey(config ?? EMPTY_CONFIG);

  const handleProximityDetail = useCallback<ProximityDetailCallback>((payload) => {
    setProximityStatement(payload);
  }, []);

  const handlePropertyDetail = useCallback<propertyDetailCallback>((payload) => {
    setPropertyData(payload);
  }, []);

  if (!config) return <LoadingAnimation visible={isLoading} />;


  const openTutorial = () => {
    setTutorialKey((k) => k + 1);
    setTutorialVisible(true);
  };


  return (
    <main className='h-screen w-screen flex flex-row relative'>
      <div className={`relative h-full transition-all duration-500 ${drawingDone ? 'w-[65%]' : mapVisible ? 'w-full' : 'w-0'}`}>
        {firstSectionDone && (
          <>
            <LoadingAnimation visible={isLoading} />
            <Map
              onLoadingChange={setIsLoading}
              setAnswer={surveyState.setAnswer}
              goToQuestion={surveyState.goToQuestion}
              section2StartIndex={surveyState.section2StartIndex}
              onDrawingDone={() => { setDrawingDone(true); surveyState.continueToNextSection() }}
              currentQuestionId={surveyState.currentQuestion?.id}
              onMapScreenshot={setMapScreenshot}
              initialAddress={initialAddress}
              mapVisible={mapVisible}
              onArealplanerUrl={setArealplanerUrl}
              onOpenTutorial={openTutorial}
              proximityInformation={handleProximityDetail}
              rawDataInformation={handlePropertyDetail}
            />
          </>
        )}
      </div>

      <div className={`h-full flex justify-center bg-secondary z-999 border transition-all duration-500 ${drawingDone ? 'w-[35%]' : mapVisible ? 'w-[0%]' : 'w-full'}`}>
        <Aside
          onSectionComplete={(done) => { if (done) setFirstSectionDone(true); }}
          onGoToMap={() => {
            setFirstSectionDone(true);
            setMapVisible(true);
            setMapScreenshot(null);
            setTutorialKey((k) => k + 1);
            setTutorialVisible(true);
          }}
          onReset={() => { setFirstSectionDone(false); setMapVisible(false); setDrawingDone(false); setMapScreenshot(null); setArealplanerUrl(null); }}
          surveyState={surveyState}
          mapScreenshot={mapScreenshot}
          arealplanerUrl={arealplanerUrl}
          proximityDetailValue={proximityDetailState}
          propertyDetailValue={propertyRawData}

        />
      </div>


      <TutorialOverlay key={tutorialKey} visible={tutorialVisible} onComplete={() => setTutorialVisible(false)} />
    </main>
  )
}
export default Navigator
