import React from "react";
import "./ByggesakPage.css";
import AddressDropdown from "../../components/AddressDropdown/AddressDropdown";
import { propertyKey } from "../../components/PropertyChooser/PropertyChooser";
import type { PropertyOption } from "../../components/PropertyChooser/PropertyChooser";

type ByggesakPageProps = {
  selectedProperty?: PropertyOption | null;
  properties?: PropertyOption[];
  onPropertySelect?: (p: PropertyOption) => void;
};

type BuildingCase = {
  case_id: string;
  case_number?: string | null;
  title?: string | null;
  status?: string | null;
  created_date?: string | null;
  closed_date?: string | null;
};

const apiBaseUrl = "/api";

function formatDate(value?: string | null): string {
  if (!value) {
    return "Ikke oppgitt";
  }
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!isoMatch) {
    return value;
  }
  return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
}

function toStatusClassName(status?: string | null): string {
  if (!status) {
    return "status-badge status-unknown";
  }

  const normalized = status.toLowerCase();
  if (normalized.includes("tatt i bruk") || normalized.includes("in use")) {
    return "status-badge status-in-use";
  }
  if (normalized.includes("godkjent") || normalized.includes("approved")) {
    return "status-badge status-approved";
  }
  if (normalized.includes("avslått") || normalized.includes("rejected")) {
    return "status-badge status-rejected";
  }
  if (normalized.includes("behandling") || normalized.includes("pending")) {
    return "status-badge status-pending";
  }
  return "status-badge status-unknown";
}

/** Building cases page with a simple case list and key details. */
export default function ByggesakPage({
  selectedProperty,
  properties = [],
  onPropertySelect,
}: ByggesakPageProps) {
  const [cases, setCases] = React.useState<BuildingCase[]>([]);
  const [isCasesLoading, setIsCasesLoading] = React.useState(false);
  const [caseError, setCaseError] = React.useState<string | null>(null);
  const selectedKey = selectedProperty ? propertyKey(selectedProperty) : null;

  React.useEffect(() => {
    if (!selectedProperty) {
      setCases([]);
      setCaseError(null);
      setIsCasesLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadCases() {
      setCases([]);
      setIsCasesLoading(true);
      setCaseError(null);

      try {
        const prop = selectedProperty!;
        const response = await fetch(`${apiBaseUrl}/byggesaker/sok`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matrikkelnummer: {
              kommunenummer: prop.kommunenr,
              gardsnummer: prop.gnr,
              bruksnummer: prop.bnr,
              festenummer: prop.fnr,
              seksjonsnummer: prop.snr,
            },
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch building cases (${response.status})`);
        }

        const payload = (await response.json()) as unknown;
        setCases(Array.isArray(payload) ? (payload as BuildingCase[]) : []);
      } catch {
        if (!controller.signal.aborted) {
          setCases([]);
          setCaseError("Kunne ikke hente byggesaker akkurat nå.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCasesLoading(false);
        }
      }
    }

    void loadCases();
    return () => controller.abort();
  }, [selectedKey]);

  return (
    <div className="page-layout byggesak-layout">
      <section className="ui-panel byggesak-intro-panel">
        <AddressDropdown
          properties={properties}
          selectedProperty={selectedProperty ?? null}
          onSelect={onPropertySelect}
        />
        <div className="byggesak-intro-text">
          <h1 className="page-title">Byggesak</h1>
          <p className="page-subtitle">Vurder om tiltaket ditt er søknadspliktig og få oversikt over dine byggesaker.</p>
        </div>
        <div className="byggesak-intro-actions">
          <a
            className="start-case-button"
            href={
              selectedProperty
                ? `http://dibkveiviser.geokrs.no?adresse=${encodeURIComponent(selectedProperty.label)}`
                : "http://dibkveiviser.geokrs.no"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Start DiBK Veiviser
          </a>
        </div>
      </section>

      <section className="page-panel cases-panel" aria-label="Byggesaker">
        <h2 className="cases-section-title">Dine byggesaker</h2>

        {!selectedProperty ? (
          <p className="page-text">Velg en eiendom for å se byggesaker.</p>
        ) : isCasesLoading ? (
          <p className="page-text">Laster byggesaker...</p>
        ) : caseError ? (
          <p className="page-text">{caseError}</p>
        ) : cases.length === 0 ? (
          <p className="page-text">Ingen byggesaker funnet for denne eiendommen.</p>
        ) : (
          <ul className="case-list">
            {cases.map((caseItem) => {
              const saksnummer = caseItem.case_number ?? caseItem.case_id;
              const isOpen = (caseItem.status ?? "").toLowerCase().includes("behandling");
              const closedDisplay = caseItem.closed_date
                ? formatDate(caseItem.closed_date)
                : isOpen
                  ? "Under behandling"
                  : caseItem.status?.trim() || "Avsluttet";
              return (
                <li key={caseItem.case_id} className="case-item ui-panel">
                  <div className="case-row">
                    <div className="case-main">
                      <h3 className="case-title">{caseItem.title || `Byggesak ${saksnummer}`}</h3>
                      <p className="case-meta">Saksnummer: {saksnummer}</p>
                    </div>
                    <span className={toStatusClassName(caseItem.status)}>{caseItem.status || "Ukjent status"}</span>
                  </div>
                  <div className="case-details">
                    <div className="case-details-grid ui-info-grid">
                      <div className="ui-info-item">
                        <span className="info-label ui-info-label">Registrert</span>
                        <div className="info-value ui-info-value">{formatDate(caseItem.created_date)}</div>
                      </div>
                      <div className="ui-info-item">
                        <span className="info-label ui-info-label">Status</span>
                        <div className="info-value ui-info-value">{closedDisplay}</div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
