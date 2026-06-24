// Renders a single tutorial step as a fixed-size card with three sections:
// GIF preview (60%), descriptive text (30%), and navigation controls (10%).
// Step indicator dots and Hopp over / Neste buttons are shown in the footer.
import type { TutorialCardProps } from './TutorialTypes';

export default function TutorialCard({ step, currentIndex, totalSteps, onNext, onSkip }: TutorialCardProps) {
  const isLast = currentIndex === totalSteps - 1;

  return (
    <div className="bg-white shadow-2xl w-[40vw] max-w-[520px] min-w-[300px] h-[70vh] max-h-[660px] min-h-[400px] flex flex-col overflow-hidden">

      {/* GIF area — 60% */}
      <div className="h-[60%] bg-gray-200 flex items-end justify-center flex-shrink-0">
        {step.gif ? (
          <img src={step.gif} alt={step.title} className="w-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">Kunne ikke laste inn</span>
        )}
      </div>

      {/* Text area — 30% */}
      <div className="h-[30%] px-6 pt-4 flex flex-col items-start justify-start flex-shrink-0">
        <h2 className="text-xl font-bold text-primary mb-2">{step.title}</h2>
        <p className="text-sm text-slate-600 leading-relaxed text-left">{step.description}</p>
      </div>

      {/* Button area — 10% */}
      <div className="h-[10%] px-6 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onSkip}
          className="bg-secondary text-primary border-2 border-primary px-5 py-1.5 text-sm font-medium cursor-pointer hover:underline focus-visible:outline-none"
        >
          Hopp over
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-primary' : 'bg-gray-300'}`}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          className="bg-primary text-white px-5 py-1.5 text-sm font-medium cursor-pointer hover:opacity-90 focus-visible:outline-none"
        >
          {isLast ? 'Fullfør' : 'Neste'}
        </button>
      </div>

    </div>
  );
}
