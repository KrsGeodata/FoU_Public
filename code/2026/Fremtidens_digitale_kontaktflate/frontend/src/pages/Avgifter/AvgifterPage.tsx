import React from "react";
import { createPortal } from "react-dom";
import "./AvgifterPage.css";
import { useKommuneConfig } from "../../context/KommuneConfigContext";
import AddressDropdown from "../../components/AddressDropdown/AddressDropdown";
import type { PropertyOption } from "../../components/PropertyChooser/PropertyChooser";
import { propertyKey, propertyPath } from "../../components/PropertyChooser/PropertyChooser";

type AvgifterPageProps = {
  selectedProperty?: PropertyOption | null;
  properties?: PropertyOption[];
  onPropertySelect?: (p: PropertyOption) => void;
};

type AvgiftApiResponse = {
  gebyr?: string | null;
  grunnlag?: string | null;
  enhetspris?: string | null;
  fra_dato?: string | null;
  til_dato?: string | null;
  beløp?: string | null;
  årsbeløp?: string | null;
  type?: string | null;
};

type FeeLine = {
  name: string;
  basis: string;
  unit: string;
  unitPrice: string;
  fromDate: string;
  toDate?: string;
  amount: number | null;
  annualAmount: number | null;
  type: string;
  emphasizeBasis?: boolean;
};

type HeaderTooltipProps = {
  label: string;
  tooltip?: string;
};

const API_BASE_URL = "/api";

const TOOLTIP_WIDTH = 220;

function HeaderTooltip({ label, tooltip }: HeaderTooltipProps) {
  const id = React.useId();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const wrapRef = React.useRef<HTMLSpanElement>(null);
  const openedByClickRef = React.useRef(false);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number; above: boolean } | null>(null);

  if (!tooltip) return null;

  function calculatePosition() {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 8));
    const above = rect.top >= 60;
    const top = above ? rect.top - 8 : rect.bottom + 8;
    setPos({ top, left, above });
  }

  function close() {
    openedByClickRef.current = false;
    setOpen(false);
  }

  React.useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function handleScroll() { calculatePosition(); }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [open]);

  const tooltipPortal = open && pos
    ? createPortal(
        <span
          className="info-tooltip-portal"
          role="tooltip"
          id={id}
          style={{
            top: pos.top,
            left: pos.left,
            transform: pos.above ? "translateY(-100%) translateY(-8px)" : "none",
          }}
        >
          {tooltip}
        </span>,
        document.body,
      )
    : null;

  return (
    <span ref={wrapRef} className="tooltip-wrap">
      <button
        ref={buttonRef}
        type="button"
        className="tooltip-button"
        aria-label={`Hva er ${label.toLowerCase()}?`}
        aria-describedby={id}
        aria-expanded={open}
        onMouseEnter={() => { calculatePosition(); setOpen(true); }}
        onMouseLeave={() => { if (!openedByClickRef.current) setOpen(false); }}
        onFocus={() => { if (!openedByClickRef.current) { calculatePosition(); setOpen(true); } }}
        onBlur={() => { if (!openedByClickRef.current) setOpen(false); }}
        onClick={() => {
          const next = !open;
          openedByClickRef.current = next;
          if (next) calculatePosition();
          setOpen(next);
        }}
      >
        i
      </button>
      {tooltipPortal}
    </span>
  );
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) {
    return "Ikke oppgitt";
  }

  return `kr ${new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function buildApiUrl(path: string): string {
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function parseNorwegianNumber(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  let normalized = value
    .replace(/kr/gi, "")
    .replace(/\s+/g, "")
    .trim();

  if (!normalized) {
    return null;
  }

  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  }

  normalized = normalized.replace(/[^0-9.-]/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanText(value?: string | null): string {
  return (value ?? "").trim();
}

function toNullableString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function toSafeNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function splitValueAndUnit(raw?: string | null): { value: string; unit: string | null } {
  const text = cleanText(raw);
  if (!text) {
    return { value: "-", unit: null };
  }

  const parts = text.split(/\s+/);
  if (parts.length < 2) {
    return { value: text, unit: null };
  }

  const lastToken = parts[parts.length - 1];
  const hasUnitHint = /[A-Za-zÆØÅæøå]/.test(lastToken) || lastToken.includes("/");
  if (!hasUnitHint) {
    return { value: text, unit: null };
  }

  return {
    value: parts.slice(0, -1).join(" ").trim() || text,
    unit: lastToken,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function normalizeApiItem(item: unknown): AvgiftApiResponse {
  if (!isObject(item)) {
    return {};
  }

  return {
    gebyr: toNullableString(item.gebyr),
    grunnlag: toNullableString(item.grunnlag),
    enhetspris: toNullableString(item.enhetspris),
    fra_dato: toNullableString(item.fra_dato),
    til_dato: toNullableString(item.til_dato),
    beløp: toNullableString(item.beløp),
    årsbeløp: toNullableString(item.årsbeløp),
    type: toNullableString(item.type),
  };
}

function buildFeeLineBaseKey(line: FeeLine): string {
  return [
    line.name,
    line.basis,
    line.unit,
    line.unitPrice,
    line.fromDate,
    line.toDate ?? "",
    line.type,
    line.amount ?? "",
    line.annualAmount ?? "",
  ].join("|");
}

function toFeeLine(item: AvgiftApiResponse): FeeLine {
  const basisSplit = splitValueAndUnit(item.grunnlag);
  const unitPriceSplit = splitValueAndUnit(item.enhetspris);
  const rawType = cleanText(item.type);
  const rawName = cleanText(item.gebyr);

  return {
    name: rawName || "Ukjent gebyr",
    basis: basisSplit.value,
    unit: basisSplit.unit ?? unitPriceSplit.unit ?? "-",
    unitPrice: unitPriceSplit.value,
    fromDate: (item.fra_dato ?? "").trim() || "Ikke oppgitt",
    toDate: (item.til_dato ?? "").trim() || undefined,
    amount: parseNorwegianNumber(item.beløp),
    annualAmount: parseNorwegianNumber(item.årsbeløp),
    type: rawType || "Ukjent",
    emphasizeBasis: rawName.toLowerCase().includes("eiendomsskatt"),
  };
}

const defaultTooltips: Record<string, string> = {
  avgifter_gebyr:      "Hva du betaler for, for eksempel renovasjon eller eiendomsskatt.",
  avgifter_grunnlag:   "Verdien eller antallet gebyret beregnes ut fra, for eksempel areal eller antall enheter.",
  avgifter_enhet:      "Måleenheten som brukes i beregningen, for eksempel stk, m² eller o/oo.",
  avgifter_enhetspris: "Pris per enhet i grunnlaget.",
  avgifter_periode:    "Fra- og til-dato for gjeldende gebyrperiode.",
  avgifter_belop:      "Løpende beløp for gjeldende periode.",
  avgifter_arsbelop:   "Estimert total kostnad for ett år.",
};

export default function AvgifterPage({
  selectedProperty,
  properties = [],
  onPropertySelect,
}: AvgifterPageProps) {
  const { config } = useKommuneConfig();
  // CMS tooltips override the hardcoded defaults.
  const tooltips = { ...defaultTooltips, ...config?.tooltips };
  const [feeLines, setFeeLines] = React.useState<FeeLine[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const selectedKey = selectedProperty ? propertyKey(selectedProperty) : null;

  React.useEffect(() => {
    if (!selectedProperty) {
      setFeeLines([]);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    const controller = new AbortController();

    async function loadAvgifter() {
      setFeeLines([]);
      setIsLoading(true);
      setLoadError(null);

      try {
        const feesResponse = await fetch(buildApiUrl(`/property/${propertyPath(selectedProperty!)}/municipal-fees`), {
          signal: controller.signal,
        });

        if (feesResponse.status === 404) {
          setFeeLines([]);
        } else if (!feesResponse.ok) {
          throw new Error(`Kunne ikke hente avgifter (${feesResponse.status})`);
        } else {
          const payload = (await feesResponse.json()) as unknown;
          setFeeLines(
            Array.isArray(payload)
              ? payload.map((entry) => toFeeLine(normalizeApiItem(entry)))
              : [],
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setFeeLines([]);
          setLoadError("Kunne ikke hente avgifter akkurat nå.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAvgifter();
    return () => controller.abort();
  }, [selectedKey]);

  const totalAmount = feeLines.reduce((sum, fee) => sum + toSafeNumber(fee.amount), 0);
  const totalAnnualAmount = feeLines.reduce((sum, fee) => sum + toSafeNumber(fee.annualAmount), 0);
  const rowKeyCounts = new Map<string, number>();

  return (
    <div className="page-layout avgifter-layout">
      <section className="page-panel avgifter-header-panel">
        <AddressDropdown
          properties={properties}
          selectedProperty={selectedProperty ?? null}
          onSelect={onPropertySelect}
        />
        <h1 className="page-title">Kommunale gebyr</h1>
        <p className="page-subtitle">
          Oversikt over priser, grunnlag og løpende beløp for avtalen.
        </p>
      </section>

      <section className="ui-panel avgifter-section-panel">
        <div className="avgifter-collapsible">
          <div className="avgifter-collapsible-title">Gjeldende gebyr</div>
          <div className="avgifter-collapsible-content">
            <div className="avgifter-total-grid ui-info-grid">
              <div className="ui-info-item">
                <span className="ui-info-label">Sum løpende beløp</span>
                <div className="ui-info-value">{formatCurrency(totalAmount)}</div>
              </div>
              <div className="ui-info-item">
                <span className="ui-info-label">Årsbeløp totalt</span>
                <div className="ui-info-value">{formatCurrency(totalAnnualAmount)}</div>
              </div>
              <div className="ui-info-item">
                <span className="ui-info-label">Antall gebyrlinjer</span>
                <div className="ui-info-value">{feeLines.length}</div>
              </div>
            </div>

            {!selectedProperty ? (
              <p className="page-text">Velg en eiendom for å se avgifter.</p>
            ) : isLoading ? (
              <p className="page-text">Laster avgifter...</p>
            ) : loadError ? (
              <p className="page-text">{loadError}</p>
            ) : feeLines.length === 0 ? (
              <p className="page-text">Ingen avgifter funnet for denne eiendommen.</p>
            ) : (
              <div className="avgifter-fee-table-wrapper">
                <table className="avgifter-fee-table" aria-label="Gjeldende gebyr">
                  <thead>
                    <tr>
                      <th scope="col">
                        <span className="avgifter-th-inner">
                          Hva gebyret gjelder
                          <HeaderTooltip label="hva gebyret gjelder" tooltip={tooltips["avgifter_gebyr"]} />
                        </span>
                      </th>
                      <th scope="col">
                        <span className="avgifter-th-inner">
                          Grl.
                          <HeaderTooltip label="grunnlag" tooltip={tooltips["avgifter_grunnlag"]} />
                        </span>
                      </th>
                      <th scope="col">
                        <span className="avgifter-th-inner">
                          Enhet
                          <HeaderTooltip label="enhet" tooltip={tooltips["avgifter_enhet"]} />
                        </span>
                      </th>
                      <th scope="col">
                        <span className="avgifter-th-inner">
                          Enh.pris
                          <HeaderTooltip label="enhetspris" tooltip={tooltips["avgifter_enhetspris"]} />
                        </span>
                      </th>
                      <th scope="col">
                        <span className="avgifter-th-inner">
                          Periode
                          <HeaderTooltip label="periode" tooltip={tooltips["avgifter_periode"]} />
                        </span>
                      </th>
                      <th scope="col">
                        <span className="avgifter-th-inner">
                          Beløp
                          <HeaderTooltip label="beløp" tooltip={tooltips["avgifter_belop"]} />
                        </span>
                      </th>
                      <th scope="col">
                        <span className="avgifter-th-inner">
                          Årsbeløp
                          <HeaderTooltip label="årsbeløp" tooltip={tooltips["avgifter_arsbelop"]} />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeLines.map((line) => {
                      const baseKey = buildFeeLineBaseKey(line);
                      const count = (rowKeyCounts.get(baseKey) ?? 0) + 1;
                      rowKeyCounts.set(baseKey, count);
                      const rowKey = count === 1 ? baseKey : `${baseKey}-${count}`;

                      return (
                      <tr key={rowKey}>
                        <th scope="row">
                          <span className="avgifter-row-title">{line.name}</span>
                          <span className="avgifter-fee-type">{line.type}</span>
                        </th>
                        <td className={line.emphasizeBasis ? "avgifter-highlight-basis" : undefined}>{line.basis}</td>
                        <td>{line.unit}</td>
                        <td className="avgifter-number-cell">{line.unitPrice}</td>
                        <td className="avgifter-period-cell">
                          <span className="avgifter-period-line">Fra {line.fromDate}</span>
                          {line.toDate ? <span className="avgifter-period-line">Til {line.toDate}</span> : null}
                        </td>
                        <td className="avgifter-number-cell">
                          {formatCurrency(line.amount ?? Number.NaN)}
                        </td>
                        <td className="avgifter-number-cell">
                          {formatCurrency(line.annualAmount ?? Number.NaN)}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p className="avgifter-footnote">
              Eiendomsskatt, feiing og tilsyn av fyringsanlegg er unntatt mva. Andre beløp vises inkl.
              mva. Løpende gebyr fordeler en årlig kostnad på flere innbetalinger.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
