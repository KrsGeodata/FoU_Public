/**
 * Survey Presentation Layer
 *
 * This file contains all the UI components for rendering the survey:
 * - Question input components (NumberInput, SingleSelect)
 * - Question renderer (factory pattern for different question types)
 * - Progress bar
 * - Navigation buttons
 * - Completion screen
 * - Main survey container and app wrapper
 *
 * The logic layer (QuestionLogic.tsx) handles state management and conditional logic,
 * while this file focuses purely on presentation.
 */

import type { Question, Answer, QuestionAnswers, SingleSelectQuestion as SingleSelectQuestionType, NumberQuestion } from './QuestionTypes';
import type { QAItem, SummaryState } from '../SummaryComponent/SummaryTypes';
import React from 'react';
import EndsSurveyModal from './EndsSurveyModal';
import { Link } from 'react-router-dom';
import { useQuestionConfig } from './QuestionConfig';
import { useSurvey } from './QuestionLogic';
import type { ProximityDetailPayload } from '../../lib/map/drawingHandlers';
import type { propertyDetailPayload } from '../../lib/map/getPlaces';

/**
 * Props interface for question components
 * Generic type T ensures type safety for specific question types
 */
interface QuestionProps<T extends Question> {
  question: T; // The question object with all its configuration
  value: Answer; // Current answer value
  onChange: (value: Answer) => void; // Callback when answer changes
}

// ==================== QUESTION COMPONENTS ====================

/**
 * Number Input Component
 * Renders a numeric input field with optional min/max validation
 */
const NumberInputQuestion: React.FC<QuestionProps<NumberQuestion>> = ({ question, value, onChange }) => {
  const inputValue = (value as number) || '';

  // Tailwind CSS classes for styling the input
  const baseStyles = `
    w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl
    text-slate-100 placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
    transition-all duration-200
  `;

  return (
    <input
      type="number"
      value={inputValue}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      placeholder={question.placeholder?.toString()}
      min={question.min}
      max={question.max}
      className={baseStyles}
    />
  );
};

/**
 * Single Select Component
 * Renders radio-button-style options with visual selection indicator
 * Supports different layouts: vertical, horizontal, or grid
 */
const SingleSelectQuestion: React.FC<QuestionProps<SingleSelectQuestionType>> = ({ question, value, onChange }) => {
  const selectedValue = (value as string) || '';

  return (
    <div className={`grid gap-3 ${question.layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {question.options.map((option) => (
        <React.Fragment key={option.value}>
          <button
            role="radio"
            aria-checked={selectedValue === option.value}
            onClick={() => onChange(option.value)}
            className={`
              w-full relative px-4 py-3 text-left transition-all duration-200
              border-2 group
              ${selectedValue === option.value
                ? 'border-primary text-primary'
                : 'border-slate-600 text-slate-500 hover:border-slate-500 hover:underline'
              }
            `}
          >

            <div className="flex flex-col gap-2">
              {/* IMAGE above label when present */}
              {option.image && (
                <div className="w-full bg-slate-100">
                  {option.image}
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className={`
                  w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all
                  ${selectedValue === option.value
                    ? 'border-primary bg-primary'
                    : 'border-slate-500 group-hover:border-slate-300'
                  }
                `}>
                  {selectedValue === option.value && (
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                  )}
                </div>
                <span className="font-medium w-49/50">{option.label}</span>
              </div>
            </div>
          </button>

          {/* Warning displayed only when selected */}
          {option.warning && selectedValue === option.value && (
            <div className={`flex items-start gap-2 px-4 py-3 border-l-4
              animate-[fadeSlideIn_0.3s_ease-out] ${option.warning.type === 'danger'
                ? 'bg-danger border-danger-border'
                : 'bg-info border-info-border'
              }`}>
              {option.warning.type === 'danger' ? (
                <svg className="w-5 h-5 text-danger-border shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-info-border shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              <span className={`text-sm text-left font-medium ${option.warning.type === 'danger' ? 'text-amber-800' : 'text-primary'
                }`}>{option.warning.message}</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ==================== QUESTION RENDERER ====================

/**
 * Question Renderer - Factory component for rendering different question types
 * Uses TypeScript discriminated unions to determine which component to render
 */
const QuestionRenderer: React.FC<{
  question: Question;
  value: Answer;
  onChange: (value: Answer) => void;
}> = ({ question, value, onChange }) => {
  // Use discriminated union to render the appropriate component
  switch (question.type) {
    case 'number':
      return <NumberInputQuestion question={question} value={value} onChange={onChange} />;
    case 'single-select':
      return <SingleSelectQuestion question={question} value={value} onChange={onChange} />;
    // Future question types can be added here (multi-select, text, date, etc.)
  }
};

// ==================== UI COMPONENTS ====================

/**
 * Progress Bar Component
 * Displays survey completion progress with percentage and visual bar
 */
const ProgressBar: React.FC<{ progress: { percentage: number; answered: number; total: number } }> = ({ progress }) => {
  return (
    <div className="space-y-0">
      {/* Progress text */}
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Fremgang</span>
        <span className="text-slate-400 font-medium">{progress.percentage}%</span>
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress.percentage}%` }} // Dynamic width based on progress
        />
      </div>
    </div>
  );
};

/**
 * Navigation Buttons Component
 * Renders Back and Next/Complete buttons with appropriate enabled/disabled states
 */
const NavigationButtons: React.FC<{
  canGoBack: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}> = ({ canGoBack, canGoNext, onBack, onNext, isLastQuestion }) => {
  return (
    <div className="flex justify-between gap-4">
      {/* Back button */}
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className={`
          px-6 py-3 font-medium transition-all duration-200
          flex items-center gap-2
          ${canGoBack
            ? 'bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50'
            : 'bg-slate-200 text-slate-600 cursor-not-allowed' // Disabled state
          }
        `}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Tilbake
      </button>

      {/* Next/Complete button */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`
          px-8 py-3 font-medium transition-all duration-200
          flex items-center gap-2
          ${canGoNext
            ? 'bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50'
            : 'bg-slate-200 text-slate-500 cursor-not-allowed' // Disabled state
          }
        `}
      >
        {isLastQuestion ? 'Ferdig' : 'Neste'} {/* Dynamic button text */}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Completion Screen Component
 * Displayed when the user completes all questions
 * Shows success message and option to view submitted answers
 */
const CompletionScreen: React.FC<{
  message: string;
  answers: QuestionAnswers;
  questions: Question[];
  earlyReasons: Record<string, { questionTitle: string; questionDescription: string; reason: string }>;
  onReset: () => void;
  mapScreenshot?: string | null;
  proximityDetail?: ProximityDetailPayload | null;
  propertyRawData?: propertyDetailPayload | null;
}> = ({ message, answers, questions, earlyReasons, onReset, mapScreenshot, proximityDetail, propertyRawData }) => {

  const endedEarly = Object.keys(earlyReasons).length > 0;

  const qaList: QAItem[] = questions
    .map((q) => {
      const raw = answers[q.id];
      if (raw === null || raw === undefined || raw === '') return null;

      // For single-select, map store value => human label
      const answerText =
        q.type === 'single-select'
          ? q.options.find((opt) => opt.value === raw)?.label ?? String(raw)
          : String(raw);

      return {
        questionId: q.id,
        questionTitle: q.title,
        answer: answerText,
      };
    })
    .filter((item): item is QAItem => item !== null);

  const rejectionInfoList = Object.values(earlyReasons);

  // Data to pass to the summary page
  const summaryState: SummaryState = {
    endedEarly,
    rejectionInfo: rejectionInfoList,
    qaList,
    proximityDetail,
    propertyRawData,
    mapScreenshot,
  };

  return (
    <div className="text-center py-12 space-y-8 animate-fade-in">
      <div className='w-24 h-24 mx-auto rounded-full flex items-center justify-center'>
        {endedEarly ? (
          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img">
            <title>Cross icon</title>
            <circle cx="60" cy="60" r="60" fill="#D53C0A" />
            <line x1="36" y1="36" x2="84" y2="84" stroke="white" stroke-width="6" stroke-linecap="round" />
            <line x1="84" y1="36" x2="36" y2="84" stroke="white" stroke-width="6" stroke-linecap="round" />
          </svg>
        ) : (
          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img">
            <title>Checkmark icon</title>
            <circle cx="60" cy="60" r="60" fill="#002854" />
            <polyline points="36,62 52,78 84,44" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>


        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-primary">
          {endedEarly ? 'Du må søke' : message}
        </h2>
        {endedEarly ? (
          <p className="text-slate-500 max-w-md mx-auto">{rejectionInfoList[0]?.reason}</p>
        ) : (
          <p className="text-slate-500 max-w-md mx-auto">
            TiltaksAID kan gjøre feil. Undersøk alltid selv om du kan bygge.
          </p>
        )}
      </div>

      <div className="pt-4 w-full flex gap-4 justify-between">
        <button
          onClick={onReset}
          className="bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
        >
          Start på nytt
        </button>
        <Link
          to="/sammendrag"
          state={summaryState}
          className="bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
        >
          Se sammendrag
        </Link>
      </div>
    </div>
  );
};

// Question Card Component
const QuestionCard: React.FC<{
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  value: Answer;
  onChange: (value: Answer) => void;
}> = ({ question, questionNumber, totalQuestions, value, onChange }) => {
  return (
    <div className="w-full space-y-3">
      <div className="w-full">
        <div className='w-full bg-info text-start px-4 pt-4 pb-6 space-y-4'>
          <h2 className="text-2xl font-bold text-start text-primary leading-tight">
            {question.title}
          </h2>
          {question.descriptionContent ? (
            <div className="text-slate-700 text-start text-sm">{question.descriptionContent}</div>
          ) : question.description ? (
            <p className="text-slate-600 text-start text-sm">{question.description}</p>
          ) : null}
          {question.descriptionImage && (
            <div className="w-full flex justify-center">
              {question.descriptionImage}
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        <QuestionRenderer question={question} value={value} onChange={onChange} />
      </div>
      <span className="text-sm font-medium text-slate-500 leading-none">
        Spørsmål {questionNumber} av {totalQuestions}
      </span>
    </div>
  );
};

// ==================== SECTION TRANSITION SCREEN ====================

const SectionTransitionScreen: React.FC<{
  onContinue: () => void;
  onGoToMap?: () => void;
}> = ({ onContinue, onGoToMap }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="bg-info text-start p-4 space-y-4">
          <h2 className="text-2xl font-bold text-start text-primary leading-tight">Hvordan vil du fortsette?</h2>
          <p className="text-slate-600 text-start text-sm">Du har fullført første del av sjekklisten. Du kan nå enten fortsette i kartet for å markere plassering og mål, eller gå videre med flere spørsmål om tiltaket.</p>
        </div>
      </div>
      <div className='pt-4 w-[100%] flex gap-4 justify-between'>
        <button onClick={onGoToMap} className='bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50'>Fortsett i kart</button>

        <button
          onClick={onContinue}
          className="bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
        >
          Fortsett med spørsmål
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN SURVEY COMPONENTS ====================

/**
 * SurveyApp - Main exported component
 * Wraps the Survey component with styling and configuration
 * This is what gets imported and used in other parts of the application
 */
export default function SurveyApp({ onSectionComplete, onGoToMap, onReset: onResetExternal, surveyState, mapScreenshot, arealplanerUrl, proximityDetailSurveyApp, propertyDetailSurveyApp }: {
  onSectionComplete?: (done: boolean) => void;
  onGoToMap?: () => void;
  onReset?: () => void;
  surveyState: ReturnType<typeof useSurvey>;
  mapScreenshot?: string | null;
  arealplanerUrl?: string | null;
  proximityDetailSurveyApp?: ProximityDetailPayload | null;
  propertyDetailSurveyApp?: propertyDetailPayload | null;
}) {
  const config = useQuestionConfig();
  const {
    state,
    currentQuestion,
    currentSection,
    visibleQuestions,
    progress,
    canGoNext,
    canGoBack,
    sectionTransition,
    setAnswer,
    goNext,
    goBack,
    continueToNextSection,
    reset,
  } = surveyState;

  const [showEndsSurveyModal, setShowEndsSurveyModal] = React.useState(false);

  const handleNext = React.useCallback(() => {
    const endsSurvey = currentQuestion?.type === 'single-select'
      && currentQuestion.options.some(opt => opt.value === state.answers[currentQuestion.id] && opt.endsSurvey);
    if (endsSurvey) {
      setShowEndsSurveyModal(true);
    } else {
      goNext();
    }
  }, [currentQuestion, state.answers, goNext]);

  // Notify parent when section transition is reached (first section done)
  const firstSectionDone = sectionTransition !== null;
  React.useEffect(() => {
    onSectionComplete?.(firstSectionDone);
  }, [firstSectionDone, onSectionComplete]);

  return (
    <div className="w-full max-w-[40vw] h-[100%] flex flex-col mx-auto overflow-y-auto">
      <div className="pt-5 px-5 w-[100%] h-[100%] flex flex-col mx-auto overflow-y-auto no-scrollbar">
        <div className="w-full flex-1 flex flex-col">
          {/* Show section transition, completion, or question */}
          {sectionTransition ? (
            <SectionTransitionScreen
              onContinue={continueToNextSection}
              onGoToMap={onGoToMap}
            />
          ) : state.isComplete ? (
            <div className="w-full max-w-lg mx-auto flex-1 flex flex-col">
              <CompletionScreen
                message={config?.completionMessage || ''}
                answers={state.answers}
                questions={config?.questionSection.flatMap(s => s.questions) ?? []}
                earlyReasons={state.earlyReasons}
                onReset={() => { reset(); onResetExternal?.(); }}
                mapScreenshot={mapScreenshot}
                proximityDetail={proximityDetailSurveyApp}
                propertyRawData={propertyDetailSurveyApp}
              />
            </div>
          ) : currentQuestion ? (
            <div className="w-[100%] mx-auto flex-1 flex flex-col">
              <div className="mb-2">
                <h1 className="text-3xl lg:text-4xl tracking-tight text-primary text-start font-bold mb-2">{config?.title}</h1>
              </div>
              {/* Bordered container with question and progress */}
              <div className="border px-4 pt-4 text-white space-y-4">
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={state.currentIndex + 1}
                  totalQuestions={visibleQuestions.length}
                  value={state.answers[currentQuestion.id]}
                  onChange={(value) => setAnswer(currentQuestion.id, value)}
                />
                <ProgressBar progress={progress} />
                {(currentSection?.id === 'distance-questions' || currentSection?.id === 'del-2') && arealplanerUrl && (
                  <a
                    href={arealplanerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex text-slate-600 items-center gap-2 bg-info px-4 py-3 text-sm font-medium hover:underline"
                  >
                    Se gjeldende planer for eiendommen
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>



              {/* Spacer to push buttons to bottom */}
              <div className="flex-1"></div>

              {/* Navigation buttons fixed to the bottom of the sidebar */}
              <div className="sticky bottom-0 z-10 bg-secondary pt-3 pb-4 mt-4 border-t border-slate-200">
                <NavigationButtons
                  canGoBack={canGoBack}
                  canGoNext={canGoNext}
                  onBack={goBack}
                  onNext={handleNext}
                  isLastQuestion={state.currentIndex >= visibleQuestions.length - 1}
                />
              </div>
              {showEndsSurveyModal && (
                <EndsSurveyModal
                  onContinue={() => { setShowEndsSurveyModal(false); goNext(); }}
                  onReset={() => { setShowEndsSurveyModal(false); reset(); onResetExternal?.(); }}
                />
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400">No questions available</div>
          )}
        </div>
      </div>
    </div>
  );
}