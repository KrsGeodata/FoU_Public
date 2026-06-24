// Summary / receipt page displayed after the survey or drawing analysis.
// Shows either a rejection notice (with reasons why a building permit is needed)
// or an approval indication that the project may not require a permit.

import { Link } from 'react-router-dom';
import { useSummary } from './SummaryLogic';
import '../../App.css';
import PDFSummaryPage from '../PDFComponent/PDFSummaryPage';

function Summary() {
  const summary = useSummary();

  console.log('summary state: ', summary);

  // No summary data — user navigated here directly
  if (!summary) {
    return (
      <main className="h-screen w-screen flex flex-col gap-4 items-center justify-center bg-secondary">
        <p className="text-black">
          Ingen sammendrag funnet. Fullfør undersøkelsen først.
        </p>

        <Link
          to="/"
          className="bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
        >
          Tilbake til start
        </Link>
      </main>
    );
  }

  const { rejectionInfo } = summary;

  return (
    <main className="h-screen w-screen flex flex-col justify-center items-start bg-secondary overflow-y-auto">
      <div className="w-full flex flex-col max-w-2xl space-y-4 pt-20 pb-20 items-start justify-center">

        {rejectionInfo.length > 0 ? (
          // Rejection summary
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold leading-none text-primary text-start">
              Hva betyr dette for deg?
            </h1>
            <p className="text-sm text-start text-slate-600 leading-relaxed">
              Du må sende byggesøknad til kommunen. Du kan ikke starte bygging før
              søknaden er godkjent. Tiltaket må behandles av kommunen før arbeid
              kan igangsettes, og i enkelte tilfeller må det benyttes ansvarlige
              foretak i samsvar med regelverket.
            </p>
            <div className="bg-info text-start p-6 space-y-3">
              <h2 className="text-2xl font-semibold text-primary leading-snug text-start">
                Begrunnelse
              </h2>

              {rejectionInfo.map((info, index) => (
                <div key={index} className="space-y-1">
                  {info.questionTitle && (
                    <p className="text-sm text-primary font-semibold">
                      {info.questionTitle}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">
                    {info.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Approval summary
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold leading-snug text-primary text-start">
              En god start!
            </h1>

            <div className="bg-info p-6 space-y-3">
              <h2 className="text-2xl font-semibold text-primary leading-snug text-start">
                Viktig informasjon
              </h2>

              <p className="text-sm text-start text-slate-600 leading-relaxed">
                Basert på svarene du har gitt, kan det se ut som tiltaket ikke
                er søknadspliktig. Dette er kun en veiledende vurdering fra
                verktøyet og regnes ikke som en godkjenning. Vi anbefaler at du
                selv undersøker regelverket og avklarer med kommunen ved behov,
                da det er ditt ansvar å sikre at tiltaket kan gjennomføres uten
                søknad.
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 justify-start">

          {/* Back button */}
          <Link
            to="/"
            className="bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
          >
            Tilbake til start
          </Link>

          {/* PDF button */}
          <div className="bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50">
            <PDFSummaryPage />
          </div>

        </div>

        <div className='pt-10'></div>

        {/* Feedback section */}
        <div className="bg-info p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-primary leading-snug text-start">
            Hjelp oss å bli bedre
          </h2>
          <p className="text-sm text-start text-slate-600 leading-relaxed">
            Vi ønsker å gjøre opplevelsen så god som mulig. Din tilbakemelding
            hjelper oss med å forbedre veiviseren.{' '}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdo4UgFUYuhav9_mngrhdrYSnahzBmYPmTxrtu_NuZLV5ZyfQ/viewform?usp=dialog"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary font-medium hover:opacity-70"
            >
              Del dine tanker her.
            </a>
          </p>
        </div>

      </div>
    </main>
  );
}

export default Summary;
