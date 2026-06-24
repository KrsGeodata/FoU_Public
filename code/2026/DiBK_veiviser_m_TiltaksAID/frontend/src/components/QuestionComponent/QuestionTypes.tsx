// ==========================================================================
// Survey Type Definitions
//
// Defines all TypeScript interfaces and types used by the building permit
// survey system. Includes question structures, branching/conditional logic,
// answer types, and overall survey configuration and state.
// ==========================================================================
import type React from 'react';

// Question option for select-type questions
export interface SelectOption {
  value: string;
  label: string;
  warning?: Warning;
  endsSurvey?: boolean;
  image?: React.ReactNode; // Optional image to display with the option
}

export interface Warning{
  message: string;
  type: 'danger' | 'info';
}

// Base question interface - all questions extend this
export interface BaseQuestion {
  id: string;
  title: string;
  description?: string;
  descriptionContent?: React.ReactNode; // Rich JSX description (used instead of description when present)
  required?: boolean;
  showWhen?: BranchingRule[]; // Conditional display rules
  matchType?: 'all' | 'any'; // 'all' = AND logic (default), 'any' = OR logic
  descriptionImage?: React.ReactNode; // Optional image to display in the question description
}

// Single selection question (radio buttons)
export interface SingleSelectQuestion extends BaseQuestion {
  type: 'single-select';
  options: SelectOption[];
  layout?: 'vertical' | 'horizontal' | 'grid';
}

// Number input question
export interface NumberQuestion extends BaseQuestion {
  type: 'number';
  placeholder?: number;
  min?: number;
  max?: number;
}

// Union type of all question types
export type Question = NumberQuestion | SingleSelectQuestion;

// Branching conditions for conditional logic
export type BranchingCondition =
  | { type: 'equals'; value: string }
  | { type: 'greater-than'; value: number }
  | { type: 'less-than'; value: number }
  | { type: 'not-equals'; value: string }
  | { type: 'answered' }
  | { type: 'not-answered' };

// Branching rule combining question reference and condition
export interface BranchingRule {
  questionId: string;
  condition: BranchingCondition;
}

// Answer types
export type Answer = string | string[] | number | null;

// Survey answers record
export type QuestionAnswers = Record<string, Answer>;

// Survey configuration
export interface QuestionConfig {
  id: string;
  title: string;
  description?: string;
  questionSection: QuestionSection[]
  completionMessage?: string;
  image?: React.ReactNode;
}

// Survey state
export interface EarlyReason {
  questionTitle: string;
  questionDescription: string;
  reason: string;
}

export interface QuestionState {
  answers: QuestionAnswers;
  currentIndex: number;
  isComplete: boolean;
  sectionStartIndex: number;
  earlyReasons: Record<string, EarlyReason>;
}

//Question sections
export interface QuestionSection {
  id: string;
  title: string;
  questions: Question[];
}

