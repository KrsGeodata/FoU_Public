// Reference table of minimum building setback distances from public roads,
// organized by regulatory time period and road type (municipal, county, national).
// Rendered as descriptive JSX content inside the "distance to road" survey question.
const roadDistanceData = [
  { period: '1912 - 1931', kommunal: '3,5 meter', fylke: '3,5 meter', riks: '3,5 meter', from: 'Veikant' },
  { period: '1931 - 1938', kommunal: '5,0 meter', fylke: '5,0 meter', riks: '5,0 meter', from: 'Veikant' },
  { period: '1938 - 1964', kommunal: '7,5 meter', fylke: '7,5 meter', riks: '7,5 meter', from: 'Veikant' },
  { period: '1964 - 31. juni 1996', kommunal: '12,5 meter', fylke: '12,5 meter', riks: '30,0 meter', from: 'Veiens midtlinje' },
  { period: '1. juli 1996 - 31. desember 2009', kommunal: '15,0 meter', fylke: '15,0 meter', riks: '50,0 meter', from: 'Veiens midtlinje' },
  { period: '1. januar 2010 - nå', kommunal: '15,0 meter', fylke: '50,0 meter', riks: '50,0 meter', from: 'Veiens midtlinje' },
];

export const RoadDistanceDescription = () => (
  <div className="space-y-4 text-sm">
    <p>
      Se etter byggegrense mot vei i reguleringsplan eller i kommuneplanens arealdel.
      Hvis plasseringen til bygningen ikke er i strid med denne byggegrensa, kan du plassere bygningen der du ønsker.
    </p>
    <p>
      Er det ikke oppgitt byggegrense mot vei i planene? Sjekk hvilket årstall reguleringsplanen din er vedtatt,
      og finn byggegrensen i tabellen under. Vil du bygge nærmere enn dette, må du søke om dispensasjon.
    </p>
    <p>
      Du kan lese mer om byggegrense mot offentlig vei i{' '}
      <a
        href="https://lovdata.no/dokument/NL/lov/1963-06-21-23/KAPITTEL_5"
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-600 hover:underline"
      >
        kapittel 5 i veglova
      </a>.
    </p>

    <div className="overflow-x-auto mt-4">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-slate-700 text-white">
            <th className="text-left p-2 font-semibold">Tidsrom</th>
            <th className="text-left p-2 font-semibold">Avstand til kommunal vei</th>
            <th className="text-left p-2 font-semibold">Avstand til fylkesvei</th>
            <th className="text-left p-2 font-semibold">Avstand til riksvei</th>
            <th className="text-left p-2 font-semibold">Avstanden måles fra</th>
          </tr>
        </thead>
        <tbody>
          {roadDistanceData.map((row, i) => (
            <tr key={row.period} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b text-primary border-slate-200`}>
              <td className="p-2">{row.period}</td>
              <td className="p-2">{row.kommunal}</td>
              <td className="p-2">{row.fylke}</td>
              <td className="p-2">{row.riks}</td>
              <td className="p-2">{row.from}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
