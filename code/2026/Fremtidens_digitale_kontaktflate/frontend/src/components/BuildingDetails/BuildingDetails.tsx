import React from "react";
import "./BuildingDetails.css";

/** Fallback text when a value is missing. */
const fallback = "N/A";
const selectBuildingValue = "";

type FloorDetail = {
  id: string;
  title?: string;
  dwellingUnits?: string | number | null;
  residentialBra?: string | number | null;
  otherBra?: string | number | null;
  totalBra?: string | number | null;
};

type UsageUnitDetail = {
  id: string;
  title?: string;
  unitNumber?: string | null;
  bra?: string | number | null;
  floor?: string | null;
};

/** Building option shown in the building selector. */
export type BuildingOption = {
  id: string;
  label: string;
  buildingNumber?: string | number | null;
  area?: string | number | null;
  usableArea?: string | number | null;
  builtArea?: string | number | null;
  residentialUsableArea?: string | number | null;
  nonResidentialUsableArea?: string | number | null;
  buildingType?: string | null;
  status?: string | null;
  floors?: string | number | null;
  units?: string | number | null;
  floorDetails?: FloorDetail[];
  usageUnitDetails?: UsageUnitDetail[];
  waterSupply?: string | null;
  sewage?: string | null;
  buildYear?: string | number | null;
  condition?: string | null;
};

function formatArea(value?: string | number | null): string {
  // Keep area output consistent and readable in the details grid.
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  if (typeof value === "number") {
    return `${value} m2`;
  }
  return value.toLowerCase().includes("m2") ? value : `${value} m2`;
}

function formatValue(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

function hasValue(value?: string | number | null): value is string | number {
  return value !== null && value !== undefined && value !== "";
}

function toPositiveInt(value?: string | number | null): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

function fallbackFloorTitle(index: number): string {
  if (index === 0) {
    return "Hovedetasje 1";
  }
  return `Etasje ${index + 1}`;
}

/** Building selector and details panel shown under the map. */
export default function BuildingDetails({ buildings, isLoading = false }: { buildings: BuildingOption[]; isLoading?: boolean }) {
  // Empty string represents "no building selected" in the select input.
  const [selectedBuildingId, setSelectedBuildingId] = React.useState<string>(selectBuildingValue);
  const chooserDescriptionId = React.useId();

  React.useEffect(() => {
    // Reset selection if the current id no longer exists in the incoming list.
    if (
      selectedBuildingId !== selectBuildingValue
      && !buildings.some((building) => building.id === selectedBuildingId)
    ) {
      setSelectedBuildingId(selectBuildingValue);
    }
  }, [buildings, selectedBuildingId]);

  // Resolve the active building from the selected id.
  const selectedBuilding = selectedBuildingId === selectBuildingValue
    ? undefined
    : buildings.find((building) => building.id === selectedBuildingId);

  const panelClassName = "building-details-panel ui-panel";

  const floorCountFromProperty = toPositiveInt(selectedBuilding?.floors);
  const floorCountFromDetails = selectedBuilding?.floorDetails?.length ?? 0;
  const resolvedFloorCount = floorCountFromProperty ?? (floorCountFromDetails > 0 ? floorCountFromDetails : 1);

  const floorsSummary = hasValue(selectedBuilding?.floors)
    ? selectedBuilding.floors
    : resolvedFloorCount;

  const usageUnitsSummary = hasValue(selectedBuilding?.units)
    ? selectedBuilding.units
    : (selectedBuilding?.usageUnitDetails?.length ? selectedBuilding.usageUnitDetails.length : null);

  const floorDetails: FloorDetail[] = selectedBuilding?.floorDetails?.length
    ? selectedBuilding.floorDetails.map((floor, index) => ({
      ...floor,
      title: floor.title && floor.title.trim() ? floor.title : fallbackFloorTitle(index),
    }))
    : Array.from({ length: resolvedFloorCount }, (_, index): FloorDetail => ({
        id: `__placeholder-floor-${index + 1}__`,
        title: fallbackFloorTitle(index),
      }));

  const usageUnitDetails = selectedBuilding?.usageUnitDetails?.length
    ? selectedBuilding.usageUnitDetails
    : [{ id: "__placeholder-unit__", title: "" }];

  return (
    <section className={panelClassName} aria-label="Bygninger">
      <h2 className="building-details-title">Bygninger</h2>
      <p id={chooserDescriptionId} className="building-details-subtitle">
        Velg en bygning for å se detaljert informasjon.
      </p>

      {isLoading ? <p className="page-text">Laster bygninger...</p> : null}
      {!isLoading && buildings.length === 0 ? <p className="page-text">Ingen bygninger funnet.</p> : null}

      {!isLoading && buildings.length > 0 && (
        <div
          className="building-chooser"
          role="group"
          aria-label="Velg bygning"
          aria-describedby={chooserDescriptionId}
        >
          {buildings.map((building) => {
            const isActive = selectedBuildingId === building.id;
            // Only disambiguate with the building number when another building shares the same label.
            const hasDuplicateLabel = buildings.some(
              (other) => other.id !== building.id && other.label === building.label,
            );
            const buildingNumber = hasDuplicateLabel && hasValue(building.buildingNumber)
              ? String(building.buildingNumber)
              : null;
            return (
              <button
                key={building.id}
                type="button"
                className={`building-option${isActive ? " active" : ""}`}
                aria-pressed={isActive}
                onClick={() => setSelectedBuildingId(isActive ? selectBuildingValue : building.id)}
              >
                <span className="building-option-label">{building.label}</span>
                {buildingNumber ? (
                  <span className="building-option-number">{`Nr. ${buildingNumber}`}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {selectedBuilding ? (
        <div className="building-details-sections">
          <section className="building-details-section" aria-label="Bygningsinfo">
            <h3 className="building-details-section-title">Bygningsinfo</h3>
            <div className="building-details-summary-grid ui-info-grid">
              <div className="building-details-summary-item ui-info-item">
                <p className="building-details-summary-label ui-info-label">Bygningsnummer</p>
                <p className="building-details-summary-value ui-info-value">{formatValue(selectedBuilding.buildingNumber)}</p>
              </div>
              <div className="building-details-summary-item ui-info-item">
                <p className="building-details-summary-label ui-info-label">Bygningstype</p>
                <p className="building-details-summary-value ui-info-value">{formatValue(selectedBuilding.buildingType)}</p>
              </div>
              <div className="building-details-summary-item ui-info-item">
                <p className="building-details-summary-label ui-info-label">Etasjer</p>
                <p className="building-details-summary-value ui-info-value">{formatValue(floorsSummary)}</p>
              </div>
              <div className="building-details-summary-item ui-info-item">
                <p className="building-details-summary-label ui-info-label">Bruksenheter</p>
                <p className="building-details-summary-value ui-info-value">{formatValue(usageUnitsSummary)}</p>
              </div>
              <div className="building-details-summary-item ui-info-item">
                <p className="building-details-summary-label ui-info-label">Status</p>
                <p className="building-details-summary-value ui-info-value">{formatValue(selectedBuilding.status)}</p>
              </div>
              <div className="building-details-summary-item ui-info-item">
                <p className="building-details-summary-label ui-info-label">Vannforsyning</p>
                <p className="building-details-summary-value ui-info-value">{formatValue(selectedBuilding.waterSupply)}</p>
              </div>
              <div className="building-details-summary-item ui-info-item">
                <p className="building-details-summary-label ui-info-label">Bruksareal til bolig</p>
                <p className="building-details-summary-value ui-info-value">
                  {formatArea(selectedBuilding.residentialUsableArea)}
                </p>
              </div>
              <div className="building-details-summary-item ui-info-item">
                <p className="building-details-summary-label ui-info-label">{"Avl\u00f8p"}</p>
                <p className="building-details-summary-value ui-info-value">{formatValue(selectedBuilding.sewage)}</p>
              </div>
              <div className="building-details-summary-item ui-info-item">
                <p className="building-details-summary-label ui-info-label">Bruksareal til annet</p>
                <p className="building-details-summary-value ui-info-value">
                  {formatArea(selectedBuilding.nonResidentialUsableArea)}
                </p>
              </div>
            </div>
          </section>

          <section className="building-details-section" aria-label="Etasjer">
            <h3 className="building-details-section-title">Etasjer</h3>
            <div className="building-details-floor-groups">
              {floorDetails.map((floor, index) => {
                const floorName = floor.title && floor.title.trim()
                  ? floor.title
                  : fallbackFloorTitle(index);
                return (
                  <div key={floor.id} className="building-details-floor-group">
                    <p className="building-details-floor-title">{floorName}</p>
                    <div className="building-details-summary-grid ui-info-grid building-details-summary-grid-two-columns">
                      <div className="building-details-summary-item ui-info-item">
                        <p className="building-details-summary-label ui-info-label">Antall boenheter</p>
                        <p className="building-details-summary-value ui-info-value">{formatValue(floor.dwellingUnits)}</p>
                      </div>
                      <div className="building-details-summary-item ui-info-item">
                        <p className="building-details-summary-label ui-info-label">BRA, bolig</p>
                        <p className="building-details-summary-value ui-info-value">{formatArea(floor.residentialBra)}</p>
                      </div>
                      <div className="building-details-summary-item ui-info-item">
                        <p className="building-details-summary-label ui-info-label">BRA, annet</p>
                        <p className="building-details-summary-value ui-info-value">{formatArea(floor.otherBra)}</p>
                      </div>
                      <div className="building-details-summary-item ui-info-item">
                        <p className="building-details-summary-label ui-info-label">BRA, totalt</p>
                        <p className="building-details-summary-value ui-info-value">{formatArea(floor.totalBra)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="building-details-section" aria-label="Bruksenheter">
            <h3 className="building-details-section-title">Bruksenheter</h3>
            <div className="building-details-usage-unit-groups">
              {usageUnitDetails.map((unit) => {
                return (
                  <div key={unit.id} className="building-details-usage-unit-group">
                    {unit.title ? <p className="building-details-usage-unit-title">{unit.title}</p> : null}
                    <div className="building-details-summary-grid ui-info-grid building-details-summary-grid-two-columns">
                      <div className="building-details-summary-item ui-info-item">
                        <p className="building-details-summary-label ui-info-label">Bruksenhet</p>
                        <p className="building-details-summary-value ui-info-value">{formatValue(unit.unitNumber)}</p>
                      </div>
                      <div className="building-details-summary-item ui-info-item">
                        <p className="building-details-summary-label ui-info-label">BRA</p>
                        <p className="building-details-summary-value ui-info-value">{formatArea(unit.bra)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
