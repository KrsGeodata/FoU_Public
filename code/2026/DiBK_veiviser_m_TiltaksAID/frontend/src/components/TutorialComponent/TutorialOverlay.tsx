// Full-screen backdrop overlay that sequences through tutorial steps.
// Controlled externally via visible/onComplete props — no internal persistence.
// Resets to step 0 each time it becomes visible (driven by key prop in Navigator).
import { useState } from 'react';
import TutorialCard from './TutorialCard';
import { tutorialSteps } from './tutorialConfig';
import type { TutorialOverlayProps } from './TutorialTypes';

export default function TutorialOverlay({ visible, onComplete }: TutorialOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!visible) return null;

  const handleNext = () => {
    if (currentIndex < tutorialSteps.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center">
      <TutorialCard
        step={tutorialSteps[currentIndex]}
        currentIndex={currentIndex}
        totalSteps={tutorialSteps.length}
        onNext={handleNext}
        onSkip={onComplete}
      />
    </div>
  );
}
