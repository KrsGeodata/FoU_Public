import { Link, useSearchParams } from 'react-router-dom';
import './App.css';

function Index() {
  const [searchParams] = useSearchParams();
  const adresse = searchParams.get('adresse');
  return (
    <main className="h-screen w-screen flex flex-col justify-center items-start bg-secondary overflow-y-auto">
      <div className="w-full flex flex-col max-w-2xl space-y-8 pt-20 items-start justify-center">

        <div className="space-y-6">
          <h1 className="text-3xl font-semibold leading-snug text-primary text-start">Sjekk om du trenger byggesøknad</h1>
          <div className="bg-info p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-primary leading-snug text-start">Hva er dette?</h2>
            <p className="text-sm text-start font-medium text-slate-600 leading-relaxed">
              Denne veiviseren hjelper deg med å finne ut om byggetiltaket ditt
              krever søknad til kommunen. Du vil bli stilt noen spørsmål om
              tiltaket og eiendommen din, og til slutt får du en veiledende
              vurdering.
            </p>
          </div>
          <div className="bg-info p-6 space-y-3">
            <h2 className="text-2xl font-semibold text-primary leading-snug text-start">Før du starter</h2>
            <p className="text-sm text-start font-medium text-slate-600 leading-relaxed">
              Det kan være lurt å ha følgende klart: informasjon om hva du
              skal bygge, mål og plassering på eiendommen, og eventuell
              kjennskap til reguleringsplanen for området.
            </p>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Link
            to={adresse ? `/veiviser?adresse=${encodeURIComponent(adresse)}` : '/veiviser'}
            className="bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
          >
            Start veiviser
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Index;
