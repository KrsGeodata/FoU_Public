export interface TutorialConfig {
  title: string;
  description: string;
  gif?: string;
}

export interface TutorialCardProps {
  step: TutorialConfig;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

export interface TutorialOverlayProps {
  visible: boolean;
  onComplete: () => void;
}
