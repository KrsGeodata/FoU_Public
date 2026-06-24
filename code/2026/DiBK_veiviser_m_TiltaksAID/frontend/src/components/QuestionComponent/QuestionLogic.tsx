import type { QuestionConfig, QuestionSection, BranchingCondition, BranchingRule, Answer, Question, QuestionAnswers, QuestionState } from './QuestionTypes';
import { useState, useCallback, useMemo } from 'react';

/**
 * Survey Logic and State Management
 *
 * This file contains the core logic for the survey system:
 * - Conditional question evaluation
 * - Question visibility filtering
 * - Answer validation
 * - Progress tracking
 * - Survey state management hook
 *
 * This logic layer is separate from the presentation layer (QuestionPresentation.tsx)
 * to maintain a clean separation of concerns.
 */

// ==================== CONDITIONAL LOGIC ====================

/**
 * Evaluates a branching condition against an answer
 *
 * @param condition - The condition to evaluate (equals, contains, greater-than, etc.)
 * @param answer - The user's answer to check
 * @returns true if the condition is met, false otherwise
 *
 * Supported condition types:
 * - equals: answer === value
 * - greater-than: answer > value (numeric)
 * - less-than: answer < value (numeric)
 * - answered: question has a valid answer
 * - not-answered: question is empty/unanswered
 */
const evaluateCondition = (condition: BranchingCondition, answer: Answer): boolean => {
  // Handle null/undefined answers
  if (answer === null || answer === undefined) {
    return condition.type === 'not-answered';
  }

  switch (condition.type) {
    case 'equals':
      // Check if answer equals the expected value (converted to string for comparison)
      return String(answer) === condition.value;

    case 'not-equals':
      return String(answer) !== condition.value;

    case 'greater-than':
      // Numeric comparison: answer > value
      return typeof answer === 'number' && answer > condition.value;

    case 'less-than':
      // Numeric comparison: answer < value
      return typeof answer === 'number' && answer < condition.value;

    case 'answered':
      // Check if question has been answered (not empty)
      return answer !== null && answer !== undefined && answer !== '' &&
             (!Array.isArray(answer) || answer.length > 0);

    case 'not-answered':
      // Check if question is empty/unanswered
      return answer === null || answer === undefined || answer === '' ||
             (Array.isArray(answer) && answer.length === 0);

    default:
      // Default to true for unknown condition types
      return true;
  }
};

/**
 * Determines if a question should be visible based on its showWhen conditions
 *
 * @param question - The question to check
 * @param answers - All current answers in the survey
 * @returns true if the question should be shown, false otherwise
 *
 * If no showWhen conditions exist, the question is always visible.
 * If multiple conditions exist:
 * - matchType 'all' (default): ALL conditions must be met (AND logic)
 * - matchType 'any': AT LEAST ONE condition must be met (OR logic)
 */
const shouldShowQuestion = (question: Question, answers: QuestionAnswers): boolean => {
  // If no conditions specified, always show the question
  if (!question.showWhen || question.showWhen.length === 0) {
    return true;
  }

  const checkRule = (rule: BranchingRule) => {
    const answer = answers[rule.questionId];
    return evaluateCondition(rule.condition, answer);
  };

  // Use .some() for OR logic when matchType is 'any', otherwise .every() for AND logic
  if (question.matchType === 'any') {
    return question.showWhen.some(checkRule);
  }
  return question.showWhen.every(checkRule);
};

/**
 * Filters questions to only those that should be visible based on current answers
 *
 * @param questions - All questions in the survey
 * @param answers - Current answers
 * @returns Array of questions that should be visible
 */
const getVisibleQuestions = (questions: Question[], answers: QuestionAnswers): Question[] => {
  return questions.filter((q) => shouldShowQuestion(q, answers));
};

// ==================== VALIDATION ====================

/**
 * Validates if an answer meets the question's requirements
 *
 * @param question - The question to validate against
 * @param answer - The user's answer
 * @returns true if the answer is valid, false otherwise
 *
 * Validation rules:
 * - If question is not required, empty answers are valid
 * - If question is required, must have a non-empty answer
 * - Arrays must have at least one element if required
 */
const isAnswerValid = (question: Question, answer: Answer): boolean => {
  // If question is not required, empty answers are valid
  if (!question.required && (answer === null || answer === undefined || answer === '')) {
    return true;
  }

  // If question is required, validate the answer
  if (question.required) {
    // Null, undefined, or empty string is invalid
    if (answer === null || answer === undefined || answer === '') return false;
    // Empty arrays are invalid
    if (Array.isArray(answer) && answer.length === 0) return false;
  }

  return true;
};

// ==================== PROGRESS TRACKING ====================

/**
 * Calculates the current progress through the survey
 *
 * @param currentIndex - The index of the current question
 * @param visibleQuestions - All currently visible questions
 * @param answers - All current answers
 * @returns Object with percentage, answered count, and total count
 */
const calculateProgress = (
  currentIndex: number,
  visibleQuestions: Question[],
  answers: QuestionAnswers
): { percentage: number; answered: number; total: number } => {
  const total = visibleQuestions.length;

  // Count how many questions have been answered
  const answered = visibleQuestions.filter((q) => {
    const answer = answers[q.id];
    return answer !== null && answer !== undefined && answer !== '' &&
           (!Array.isArray(answer) || answer.length > 0);
  }).length;

  return {
    percentage: total > 0 ? Math.round((currentIndex / total) * 100) : 0, // Percentage based on current position
    answered, // Number of answered questions
    total, // Total number of visible questions
  };
};

// ==================== STATE MANAGEMENT HOOK ====================

/**
 * Custom React hook for managing survey state and logic
 *
 * @param config - The survey configuration (questions, title, etc.)
 * @returns Object with state, current question, and navigation functions
 *
 * Features:
 * - Manages survey state (answers, current index, completion status)
 * - Calculates visible questions based on conditional logic
 * - Tracks progress through the survey
 * - Provides navigation functions (goNext, goBack)
 * - Validates answers before allowing navigation
 * - Handles survey completion
 *
 * Usage:
 * const { currentQuestion, setAnswer, goNext, goBack, canGoNext, ... } = useSurvey(questionConfig);
 */
export const useSurvey = (config: QuestionConfig) => {
  // Initialize survey state
  const [state, setState] = useState<QuestionState>({
    answers: {},
    currentIndex: 0,
    isComplete: false,
    sectionStartIndex: 0,
    earlyReasons: {},
  });

  // Track section transition screen
  const [sectionTransition, setSectionTransition] = useState<QuestionSection | null>(null);

  // Flatten all sections into a single questions array (stable reference)
  const allQuestions = useMemo(
    () => config.questionSection.flatMap(s => s.questions),
    [config.questionSection]
  );

  // Build a map from questionId → section for quick lookup
  const questionSectionMap = useMemo(() => {
    const map = new Map<string, QuestionSection>();
    for (const section of config.questionSection) {
      for (const q of section.questions) {
        map.set(q.id, section);
      }
    }
    return map;
  }, [config.questionSection]);

  // Calculate which questions should be visible based on current answers
  const visibleQuestions = useMemo(
    () => getVisibleQuestions(allQuestions, state.answers),
    [allQuestions, state.answers]
  );

  // Index of section 2's first question within visibleQuestions (accounts for conditional questions in section 1)
  const section2StartIndex = useMemo(() => {
    if (config.questionSection.length < 2) return 0;
    const section2Id = config.questionSection[1].id;
    const idx = visibleQuestions.findIndex(q => questionSectionMap.get(q.id)?.id === section2Id);
    return idx >= 0 ? idx : visibleQuestions.length;
  }, [config.questionSection, visibleQuestions, questionSectionMap]);

  // Get the current question (or null if out of bounds)
  const currentQuestion = visibleQuestions[state.currentIndex] || null;

  // Get the section the current question belongs to
  const currentSection = currentQuestion ? questionSectionMap.get(currentQuestion.id) ?? null : null;

  // Calculate progress through the survey
  const progress = useMemo(
    () => calculateProgress(state.currentIndex, visibleQuestions, state.answers),
    [state.currentIndex, visibleQuestions, state.answers]
  );

  /**
   * Sets an answer for a specific question
   * @param questionId - The ID of the question being answered
   * @param answer - The user's answer
   */
  const setAnswer = useCallback((questionId: string, answer: Answer) => {
    setState((prev) => {
      const question = allQuestions.find(q => q.id === questionId);
      if (question?.showWhen?.length && !shouldShowQuestion(question, prev.answers)) {
        return prev;
      }
      return { ...prev, answers: { ...prev.answers, [questionId]: answer } };
    });
  }, [allQuestions]);

  /**
   * Determines if the user can proceed to the next question
   * Requires the current question to be answered if it's required
   */
  const canGoNext = useMemo(() => {
    if (!currentQuestion) return false;
    return isAnswerValid(currentQuestion, state.answers[currentQuestion.id]);
  }, [currentQuestion, state.answers]);

  /**
   * Determines if the user can go back to the previous question
   */
  const canGoBack = state.currentIndex > state.sectionStartIndex;


  /**
   * Navigate to the next question
   * If at the last question, marks the survey as complete
   */
  const goNext = useCallback(() => {
    if (!canGoNext) return;

    setState((prev) => {
      // Update earlyReasons based on current answer
      const updatedReasons = { ...prev.earlyReasons };
      if (currentQuestion && currentQuestion.type === 'single-select') {
        const currentAnswer = prev.answers[currentQuestion.id];
        const selectedOption = currentQuestion.options.find(opt => opt.value === currentAnswer);
        if (selectedOption?.endsSurvey) {
          updatedReasons[currentQuestion.id] = {
            questionTitle: currentQuestion.title,
            questionDescription: currentQuestion.description || '',
            reason: selectedOption.warning?.message || 'Du må sende byggesøknad til kommunen.',
          };
        } else {
          delete updatedReasons[currentQuestion.id];
        }
      }

      // Recalculate visible questions in case answers changed visibility
      const newVisibleQuestions = getVisibleQuestions(allQuestions, prev.answers);
      const isLast = prev.currentIndex >= newVisibleQuestions.length - 1;

      if (isLast) {
        return { ...prev, earlyReasons: updatedReasons, isComplete: true };
      }

      // Check if next question is in a different section
      const currentQ = newVisibleQuestions[prev.currentIndex];
      const nextQ = newVisibleQuestions[prev.currentIndex + 1];
      if (currentQ && nextQ) {
        const currentSec = questionSectionMap.get(currentQ.id);
        const nextSec = questionSectionMap.get(nextQ.id);
        if (currentSec && nextSec && currentSec.id !== nextSec.id) {
          setSectionTransition(nextSec);
          return { ...prev, earlyReasons: updatedReasons };
        }
      }

      return { ...prev, earlyReasons: updatedReasons, currentIndex: prev.currentIndex + 1 };
    });
  }, [canGoNext, allQuestions, questionSectionMap, currentQuestion]);

  /**
   * Navigate to the previous question
   */
  const goBack = useCallback(() => {
    if (!canGoBack) return;
    setState((prev) => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
  }, [canGoBack]);

  /**
   * Continue past the section transition screen to the next section
   */
  const continueToNextSection = useCallback(() => {
    setSectionTransition(null);
    setState((prev) => ({
      ...prev,
      currentIndex: section2StartIndex,
      sectionStartIndex: section2StartIndex,
    }));
  }, [section2StartIndex]);

  /**
   * Reset the survey to its initial state
   * Clears all answers and returns to the first question
   */
  const reset = useCallback(() => {
    setState({ answers: {}, currentIndex: 0, isComplete: false, sectionStartIndex: 0, earlyReasons: {} });
    setSectionTransition(null);
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState((prev) => {
      const nextIndex = Math.max(0, Math.min(index, allQuestions.length - 1));
      return { ...prev, currentIndex: nextIndex };
    });
  }, [allQuestions.length]);

  // Return all state and functions needed by the presentation layer
  return {
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
    goToQuestion,
    reset,
    section2StartIndex,
  };
};
