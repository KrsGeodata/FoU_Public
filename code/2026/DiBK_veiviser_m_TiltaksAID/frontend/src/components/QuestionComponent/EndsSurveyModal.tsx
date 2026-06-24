interface EndsSurveyModalProps {
  onContinue: () => void;
  onReset: () => void;
}

export default function EndsSurveyModal({ onContinue, onReset }: EndsSurveyModalProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="bg-white max-w-md w-full text-start mx-4 p-8 space-y-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-primary">Du kan trenge å søke</h2>
        <p className="text-sm text-black">
          Svaret du har gitt tyder på at tiltaket kan være søknadspliktig.
          Du kan avslutte og se begrunnelsen, eller fortsette veiviseren for å få en fullstendig vurdering.
        </p>
        <div className="flex gap-8 justify-between">
          <button
            onClick={onReset}
            className="bg-secondary flex-1 text-primary border-2 border-primary px-6 py-2.5 text-base font-medium cursor-pointer hover:underline"
          >
            Start på nytt
          </button>
          <button
            onClick={onContinue}
            className="bg-primary flex-1 text-white px-6 py-2.5 text-base font-medium cursor-pointer hover:opacity-90"
          >
            Fortsett
          </button>
        </div>
      </div>
    </div>
  );
}
