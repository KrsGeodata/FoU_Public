import { useState } from "react";
import "./PropertyChooser.css";

/**
 * One selectable property option shown in the chooser.
 * Uses matrikkelnummer as the identifier instead of serial ID.
 */
export type PropertyOption = {
  kommunenr: string;
  gnr: number;
  bnr: number;
  fnr: number;
  snr: number;
  label: string;
};

/** Stable string key for a property option (used in caches and localStorage). */
export function propertyKey(p: PropertyOption): string {
  return `${p.kommunenr}-${p.gnr}/${p.bnr}/${p.fnr}/${p.snr}`;
}

/** Build the API path segment for a property. */
export function propertyPath(p: PropertyOption): string {
  return `${p.kommunenr}/${p.gnr}/${p.bnr}/${p.fnr}/${p.snr}`;
}

/**
 * Property chooser component.
 * Renders one button per property and reports selected property.
 */
export function PropertyChooser({
  properties,
  selectedProperty,
  onSelect,
}: {
  properties: PropertyOption[];
  selectedProperty?: PropertyOption | null;
  onSelect?: (p: PropertyOption) => void;
}) {
  const [localKey, setLocalKey] = useState<string | null>(null);

  function handleSelect(p: PropertyOption) {
    setLocalKey(propertyKey(p));
    onSelect?.(p);
  }

  const activeKey = selectedProperty ? propertyKey(selectedProperty) : localKey;

  return (
    <section className="property-chooser-card ui-panel">
      <h2 className="property-chooser-title">Adressevalg</h2>
      <p className="property-chooser-subtitle">
        Velg din adresse for å se detaljert info om eiendommen din.
      </p>
      <div className="property-chooser">
        {properties.map((property) => {
          const key = propertyKey(property);
          const isActive = activeKey === key;

          return (
            <button
              key={key}
              type="button"
              className={isActive ? "property-option active" : "property-option"}
              aria-pressed={isActive}
              onClick={() => handleSelect(property)}
            >
              <span className="property-option-label">{property.label}</span>
              <span
                className={isActive ? "property-option-indicator is-active" : "property-option-indicator"}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
