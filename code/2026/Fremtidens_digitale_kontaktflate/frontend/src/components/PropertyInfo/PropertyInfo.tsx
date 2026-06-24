import React, { useId } from "react";
import "./PropertyInfo.css";
import { useKommuneConfig } from "../../context/KommuneConfigContext";

/** Fallback text shown when a field has no value. */
const fallback = "N/A";

/** Props for the tooltip label. */
type TooltipLabelProps = {
  text: string;
  tooltip?: string;
};

/** Props for a single info card item. */
type InfoItemProps = {
  label: string;
  value?: string | number | null;
  tooltip?: string;
};

type PropertyOwner = {
  personnr?: string | null;
  name?: string | null;
  eierbrok?: string | null;
};

/** Data rendered in the property info card. */
type PropertyInfoData = {
  address?: string;
  owners?: PropertyOwner[] | null;
  propertyArea?: string | number | null;
  gnr?: string;
  bnr?: string;
  fnr?: string;
  snr?: string;
};

/** Tooltip overrides — keys are field names, values are tooltip text. */
type PropertyInfoTooltips = Record<string, string>;

type OwnerRow = {
  personnr: string | null;
  name: string;
  share: string | null;
};

/**
 * Format a full name as "First M. Last" or "First M. L." when space is tight.
 */
function formatOwnerName(name: string, useShortLastName: boolean): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length <= 1) {
    return name;
  }

  const lastName = parts[parts.length - 1];
  const firstName = parts[0];
  const middleInitials = parts.slice(1, -1).map((part) => `${part[0].toUpperCase()}.`);
  const lastPart = useShortLastName ? `${lastName[0].toUpperCase()}.` : lastName;
  return `${[firstName, ...middleInitials, lastPart].join(" ")}`.trim();
}

type OwnerNameProps = {
  name?: string | null;
  className?: string;
  allowShortening?: boolean;
};

function OwnerName({ name, className, allowShortening = true }: OwnerNameProps) {
  const containerRef = React.useRef<HTMLSpanElement | null>(null);
  const longRef = React.useRef<HTMLSpanElement | null>(null);
  const [useShort, setUseShort] = React.useState(false);
  const nameValue = name ?? "";

  const longName = React.useMemo(
    () => (nameValue ? formatOwnerName(nameValue, false) : ""),
    [nameValue],
  );
  const shortName = React.useMemo(
    () => (nameValue ? formatOwnerName(nameValue, true) : ""),
    [nameValue],
  );

  const measure = React.useCallback(() => {
    if (!containerRef.current || !longRef.current) {
      return;
    }
    if (!allowShortening || !nameValue) {
      setUseShort(false);
      return;
    }
    const containerWidth = containerRef.current.clientWidth;
    const longWidth = longRef.current.scrollWidth;
    const shouldUseShort = longWidth > containerWidth;
    setUseShort(shouldUseShort);
  }, [allowShortening, nameValue]);

  React.useLayoutEffect(() => {
    measure();
  }, [measure, longName]);

  React.useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const observer = new ResizeObserver(() => measure());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measure]);

  if (!nameValue) {
    return null;
  }

  const displayName = allowShortening ? (useShort ? shortName : longName) : nameValue;

  return (
    <span
      ref={containerRef}
      className={className}
      title={nameValue}
      aria-label={nameValue}
    >
      <span ref={longRef} className="owner-name-measure">
        {longName}
      </span>
      <span className="owner-name-display">{displayName}</span>
    </span>
  );
}

/**
 * Render a label with an optional tooltip icon.
 *
 * @param text - Visible label text.
 * @param tooltip - Optional tooltip content shown on hover/focus.
 */
const TooltipLabel = ({ text, tooltip }: TooltipLabelProps) => {
  const id = useId();

  return (
    <span className="info-label ui-info-label">
      {text}
      {tooltip ? (
        <span className="tooltip-wrap">
          <button
            type="button"
            className="tooltip-button"
            aria-label={`Hva er ${text.toLowerCase()}?`}
            aria-describedby={id}
          >
            i
          </button>
          <span className="info-tooltip" role="tooltip" id={id}>
            {tooltip}
          </span>
        </span>
      ) : null}
    </span>
  );
};

/**
 * Render a generic info card item (label + value).
 *
 * @param label - Field label.
 * @param value - Field value.
 * @param tooltip - Optional tooltip text for the label.
 */
const InfoItem = ({ label, value, tooltip }: InfoItemProps) => (
  <div className="info-item ui-info-item">
    <TooltipLabel text={label} tooltip={tooltip} />
    <div className="info-value ui-info-value">
      <span
        className="info-value-text"
        title={typeof value === "string" && value.trim() ? value : undefined}
      >
        {value ?? fallback}
      </span>
    </div>
  </div>
);


/** Map common decimal values to readable fractions. */
const shareMap: Record<string, string> = {
  "1.0000": "1/1",
  "0.5000": "1/2",
  "0.3333": "1/3",
  "0.2500": "1/4",
};

/**
 * Convert raw decimal ownership share to display format.
 *
 * @param rawShare - Raw share from backend (for example "0.5000").
 * @returns A readable fraction string (for example "1/2"), or null when missing.
 */
function formatShare(rawShare?: string | null): string | null {
  if (!rawShare) {
    return null;
  }
  return shareMap[String(rawShare)] ?? String(rawShare);
}

/** Keep area values consistent in the info grid. */
function formatArea(value?: string | number | null): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return `${value} m2`;
  }
  return value.toLowerCase().includes("m2") ? value : `${value} m2`;
}

/**
 * Property information card for the selected address.
 * Shows owner summary, property metadata, and an owner modal when multiple owners exist.
 *
 * @param selectedProperty - Selected property label shown in the title.
 * @param data - Property payload used to populate the card.
 * @param tooltips - Optional tooltip text overrides.
 */
export default function PropertyInfo({
  selectedProperty,
  data = {},
  tooltips = {},
  loggedInPersonnr,
}: {
  selectedProperty?: string | null;
  data?: PropertyInfoData;
  tooltips?: PropertyInfoTooltips;
  loggedInPersonnr?: string | null;
}) {
  const [isOwnersModalOpen, setIsOwnersModalOpen] = React.useState(false);
  // CMS tooltips from context; prop tooltips override CMS values.
  const { config } = useKommuneConfig();
  const mergedTooltips: PropertyInfoTooltips = { ...config?.tooltips, ...tooltips };

  // Normalize backend owner rows into a UI-friendly shape.
  const rawOwnerRows: OwnerRow[] = (data.owners ?? [])
    .filter((owner): owner is PropertyOwner & { name: string } => (
      typeof owner?.name === "string" && owner.name.trim().length > 0
    ))
    .map((owner) => ({
      personnr: owner.personnr ?? null,
      name: owner.name.trim(),
      share: formatShare(owner.eierbrok),
    }));

  // Pin the logged-in user first, then sort remaining owners alphabetically.
  const ownerRows: OwnerRow[] = rawOwnerRows.slice().sort((a, b) => {
    const aIsMe = loggedInPersonnr != null && a.personnr === loggedInPersonnr;
    const bIsMe = loggedInPersonnr != null && b.personnr === loggedInPersonnr;
    if (aIsMe) return -1;
    if (bIsMe) return 1;
    return a.name.localeCompare(b.name, "nb");
  });

  const firstOwner = ownerRows[0];

  // Close the owner modal when selected property context changes.
  React.useEffect(() => {
    setIsOwnersModalOpen(false);
  }, [selectedProperty, data.address]);

  // Close the owner modal on Escape key press.
  React.useEffect(() => {
    if (!isOwnersModalOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOwnersModalOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOwnersModalOpen]);

  React.useEffect(() => {
    if (!isOwnersModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOwnersModalOpen]);

  return (
    <section className="property-info ui-panel">
      <h2 className="section-title">
        Eiendomsinfo {selectedProperty ? `- ${selectedProperty}` : ""}
      </h2>
      <div className="info-grid ui-info-grid">
        <InfoItem label="Adresse" value={data.address} />

        <div className="info-item ui-info-item owner-info-item">
          <TooltipLabel text="Eies av" />
          {ownerRows.length ? (
            <div className="owner-summary-row">
              <div className="owner-list-item owner-primary-item">
                <OwnerName
                  name={firstOwner?.name}
                  className="owner-name owner-name-primary"
                  allowShortening={Boolean(firstOwner?.personnr)}
                />
              </div>
              {ownerRows.length > 1 ? (
                <button
                  type="button"
                  className="owners-toggle"
                  onClick={() => setIsOwnersModalOpen(true)}
                >
                  Se alle
                </button>
              ) : null}
            </div>
          ) : (
            <div className="info-value ui-info-value">{fallback}</div>
          )}
        </div>
        <InfoItem label="Eierbrøk" value={firstOwner?.share} tooltip={mergedTooltips.eierbrok} />
        <InfoItem
          label="Eiendomsareal"
          value={formatArea(data.propertyArea)}
          tooltip={mergedTooltips.propertyArea}
        />
        <InfoItem label="Gårdsnummer" value={data.gnr} tooltip={mergedTooltips.gnr} />
        <InfoItem label="Bruksnummer" value={data.bnr} tooltip={mergedTooltips.bnr} />
        <InfoItem label="Festenummer" value={data.fnr} tooltip={mergedTooltips.fnr} />
        <InfoItem label="Seksjonsnummer" value={data.snr} tooltip={mergedTooltips.snr} />
      </div>

      {isOwnersModalOpen ? (
        <div
          className="owners-modal-backdrop"
          role="presentation"
          onClick={() => setIsOwnersModalOpen(false)}
        >
          <div
            className="owners-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="owners-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="owners-modal-header">
              <h3 id="owners-modal-title" className="owners-modal-title">Alle eiere</h3>
              <button
                type="button"
                className="owners-modal-close"
                onClick={() => setIsOwnersModalOpen(false)}
              >
                Lukk
              </button>
            </div>
            <ul className="owner-list owner-list-modal">
              {ownerRows.map((owner) => (
                <li
                  key={owner.personnr ?? owner.name}
                  className="owner-list-item"
                >
                  <OwnerName
                    name={owner.name}
                    className="owner-name"
                    allowShortening={Boolean(owner.personnr)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
