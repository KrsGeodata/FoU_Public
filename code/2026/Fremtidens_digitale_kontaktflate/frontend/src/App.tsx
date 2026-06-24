import React from "react";
import Header from "./components/Header/Header";
import PropertyInfo from "./components/PropertyInfo/PropertyInfo";
import BuildingDetails, { type BuildingOption } from "./components/BuildingDetails/BuildingDetails";
import Navigationbar from "./components/NavigationBar/NavigationBar";
import Footer from "./components/Footer/Footer";
import PropertyMap from "./components/Map/Map";
import AvfallPage from "./pages/Avfall/AvfallPage";
import ByggesakPage from "./pages/Byggesak/ByggesakPage";
import NabolistePage from "./pages/Naboliste/NabolistePage";
import AvgifterPage from "./pages/Avgifter/AvgifterPage";
import LoginPage from "./pages/Login/LoginPage";
import { PropertyChooser, propertyKey, propertyPath } from "./components/PropertyChooser/PropertyChooser";
import type { PropertyOption } from "./components/PropertyChooser/PropertyChooser";
import type { WasteCollectionItem } from "./types/waste";
import { KommuneConfigProvider, resetColors } from "./context/KommuneConfigContext";
import { toMapCoordinates } from "./utils/coordinates";
import type { MapResponse, Coordinates } from "./utils/coordinates";
import { toViewFromHash, toHashFromView } from "./utils/navigation";
import type { AppView } from "./utils/navigation";
import { toWasteCollectionItems } from "./utils/renovasjon";

/** Property payload returned from the backend endpoint. */
type PropertyResponse = {
  address?: string;
  owner?: string;
  owners?: { personnr?: string | null; name?: string | null; eierbrok?: string | null; share?: string | null }[] | null;
  propertyArea?: number | null;
  gnr?: string;
  bnr?: string;
  fnr?: string;
  snr?: string;
  eierbrok?: string;
  municipality_id?: string | null;
};

/** GeoJSON property boundary returned from the backend boundary endpoint. */
type PropertyBoundary = {
  type: "Feature";
  geometry: { type: "Polygon"; coordinates: number[][][] };
  properties: Record<string, unknown>;
};

/** Waste collection payload returned from backend route. */
type BuildingDetailsApiFloor = {
  floor?: string | null;
  dwelling_units?: string | null;
  residential_area?: string | null;
  other_area?: string | null;
  total_area?: string | null;
};

type BuildingDetailsApiUnit = {
  address?: string | null;
  unit_number?: string | null;
  area?: string | null;
};

type BuildingDetailsApiResponse = {
  building_type?: string | null;
  building_number?: string | null;
  status?: string | null;
  build_year?: string | null;
  water_supply?: string | null;
  sewage?: string | null;
  residential_area?: string | null;
  other_area?: string | null;
  floors?: BuildingDetailsApiFloor[] | null;
  units?: BuildingDetailsApiUnit[] | null;
};

const apiBaseUrl = "/api";
const selectedPropertyStorageKey = "selectedProperty";
const userFirstNameStorageKey = "userFirstName";
const activeRoleIdStorageKey = "activeRoleId";
const activeRoleTypeStorageKey = "activeRoleType";

type RoleOption = {
  type: "PERSON" | "ORG";
  id: string;
  label: string;
};

function toBuildingOption(
  building: BuildingDetailsApiResponse,
  index: number,
  key: string,
): BuildingOption {
  const floors = Array.isArray(building.floors) ? building.floors : [];
  const units = Array.isArray(building.units) ? building.units : [];

  return {
    id: `building-${key}-${index}`,
    label: building.building_type?.trim() ? building.building_type : `Bygg ${index + 1}`,
    buildingNumber: building.building_number ?? null,
    buildingType: building.building_type ?? null,
    status: building.status ?? null,
    buildYear: building.build_year ?? null,
    waterSupply: building.water_supply ?? null,
    sewage: building.sewage ?? null,
    residentialUsableArea: building.residential_area ?? null,
    nonResidentialUsableArea: building.other_area ?? null,
    floors: floors.length,
    units: units.length,
    floorDetails: floors.map((floor, floorIndex) => ({
      id: `floor-${key}-${index}-${floorIndex}`,
      title: floor.floor ? `Etasje ${floor.floor}` : `Etasje ${floorIndex + 1}`,
      dwellingUnits: floor.dwelling_units ?? null,
      residentialBra: floor.residential_area ?? null,
      otherBra: floor.other_area ?? null,
      totalBra: floor.total_area ?? null,
    })),
    usageUnitDetails: units.map((unit, unitIndex) => ({
      id: `unit-${key}-${index}-${unitIndex}`,
      title: unit.address ?? "",
      unitNumber: unit.unit_number ?? null,
      bra: unit.area ?? null,
    })),
  };
}

/** Try to restore the saved property from localStorage. */
function loadSavedProperty(): PropertyOption | null {
  const stored = window.localStorage.getItem(selectedPropertyStorageKey);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (
      parsed &&
      typeof parsed.kommunenr === "string" &&
      typeof parsed.gnr === "number" &&
      typeof parsed.bnr === "number" &&
      typeof parsed.fnr === "number" &&
      typeof parsed.snr === "number" &&
      typeof parsed.label === "string"
    ) {
      return parsed as PropertyOption;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Main application component.
 * Renders the header, property chooser, and property information display.
 */
export default function App() {
  const [personnr, setPersonnr] = React.useState<string | null>(() => {
    return sessionStorage.getItem("personnr");
  });
  const [userFirstName, setUserFirstName] = React.useState<string | null>(() => {
    return sessionStorage.getItem(userFirstNameStorageKey);
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const mobileNavShellRef = React.useRef<HTMLDivElement | null>(null);
  const [bostedkommunenr, setBostedkommunenr] = React.useState<string | null>(() => {
    return sessionStorage.getItem("bostedkommunenr");
  });
  const [activeView, setActiveView] = React.useState<AppView>(() => toViewFromHash(window.location.hash));
  const [activeProperty, setActiveProperty] = React.useState<PropertyOption | null>(loadSavedProperty);
  const [propertyOptions, setPropertyOptions] = React.useState<PropertyOption[]>([]);
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [activeRoleId, setActiveRoleId] = React.useState<string | null>(() => {
    return sessionStorage.getItem(activeRoleIdStorageKey);
  });
  const [activeRoleType, setActiveRoleType] = React.useState<RoleOption["type"] | null>(() => {
    const stored = sessionStorage.getItem(activeRoleTypeStorageKey);
    return stored === "ORG" || stored === "PERSON" ? stored : null;
  });
  const [propertyData, setPropertyData] = React.useState<PropertyResponse | null>(null);
  const [wasteCollectionData, setWasteCollectionData] = React.useState<WasteCollectionItem[] | null>(null);
  const [isWasteCollectionLoading, setIsWasteCollectionLoading] = React.useState<boolean>(false);
  const [buildingData, setBuildingData] = React.useState<BuildingOption[]>([]);
  const [isBuildingsLoading, setIsBuildingsLoading] = React.useState<boolean>(false);

  const selectedProperty = activeProperty && propertyOptions.some(
    (p) => propertyKey(p) === propertyKey(activeProperty),
  ) ? activeProperty : null;

  const selectedKey = selectedProperty ? propertyKey(selectedProperty) : null;

  const propertyDataCacheRef = React.useRef<Map<string, PropertyResponse>>(new Map());
  const mapCoordinatesCacheRef = React.useRef<Map<string, Coordinates | null>>(new Map());
  const propertyBoundaryCacheRef = React.useRef<Map<string, PropertyBoundary | null>>(new Map());
  const wasteCollectionCacheRef = React.useRef<Map<string, WasteCollectionItem[]>>(new Map());
  const buildingsCacheRef = React.useRef<Map<string, BuildingOption[]>>(new Map());

  React.useEffect(() => {
    if (!personnr) {
      setRoles([]);
      setActiveRoleId(null);
      setActiveRoleType(null);
      return;
    }

    fetch(`${apiBaseUrl}/auth/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personnr }),
    })
      .then((res) => res.json())
      .then((data: RoleOption[]) => {
        const normalized = Array.isArray(data) ? data : [];
        setRoles(normalized);

        const preferredRole = normalized.find(
          (role) => role.id === activeRoleId && role.type === activeRoleType,
        );
        const nextRole = preferredRole ?? normalized[0] ?? null;
        if (nextRole) {
          setActiveRoleId(nextRole.id);
          setActiveRoleType(nextRole.type);
          sessionStorage.setItem(activeRoleIdStorageKey, nextRole.id);
          sessionStorage.setItem(activeRoleTypeStorageKey, nextRole.type);
        }
      })
      .catch(() => {
        setRoles([]);
      });
  }, [personnr]);

  React.useEffect(() => {
    if (!activeRoleId || !activeRoleType) {
      setPropertyOptions([]);
      return;
    }

    const query = new URLSearchParams({
      role_type: activeRoleType,
      role_id: activeRoleId,
    }).toString();

    fetch(`${apiBaseUrl}/auth/properties?${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { kommunenr: string; address: string | null; gnr: number; bnr: number; fnr: number; snr: number }[]) => {
        const options: PropertyOption[] = data.map((p) => ({
          kommunenr: p.kommunenr,
          gnr: p.gnr,
          bnr: p.bnr,
          fnr: p.fnr,
          snr: p.snr,
          label: p.address ?? `${p.gnr}/${p.bnr}`,
        }));
        setPropertyOptions(options);
        setActiveProperty((prev) => {
          if (prev && options.some((o) => propertyKey(o) === propertyKey(prev))) {
            return prev;
          }
          return options[0] ?? null;
        });
      })
      .catch(() => {
        setPropertyOptions([]);
      });
  }, [activeRoleId, activeRoleType]);

  React.useEffect(() => {
    if (!activeProperty) {
      window.localStorage.removeItem(selectedPropertyStorageKey);
      return;
    }
    window.localStorage.setItem(selectedPropertyStorageKey, JSON.stringify(activeProperty));
  }, [activeProperty]);

  React.useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = "#min-eiendom";
    }

    function onHashChange() {
      setActiveView(toViewFromHash(window.location.hash));
    }

    window.addEventListener("hashchange", onHashChange);
    onHashChange();

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  React.useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target || !mobileNavShellRef.current) {
        return;
      }
      if (!mobileNavShellRef.current.contains(target)) {
        setIsMobileNavOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isMobileNavOpen]);

  const [mapCoordinates, setMapCoordinates] = React.useState<Coordinates | null>(null);
  const [propertyBoundary, setPropertyBoundary] = React.useState<PropertyBoundary | null>(null);

  React.useEffect(() => {
    async function loadPropertyInfo(signal: AbortSignal) {
      if (!selectedProperty || !selectedKey) {
        setPropertyData(null);
        setMapCoordinates(null);
        setPropertyBoundary(null);
        return;
      }

      const path = propertyPath(selectedProperty);

      const cachedProperty = propertyDataCacheRef.current.get(selectedKey);
      const cachedCoordinates = mapCoordinatesCacheRef.current.get(selectedKey);

      if (cachedProperty) {
        setPropertyData(cachedProperty);
      } else {
        setPropertyData(null);
      }

      if (cachedCoordinates !== undefined) {
        setMapCoordinates(cachedCoordinates);
      } else {
        setMapCoordinates(null);
      }

      if (propertyBoundaryCacheRef.current.has(selectedKey)) {
        setPropertyBoundary(propertyBoundaryCacheRef.current.get(selectedKey) ?? null);
      } else {
        setPropertyBoundary(null);
      }

      try {
        const propertyPromise = cachedProperty
          ? Promise.resolve(cachedProperty)
          : fetch(`${apiBaseUrl}/property/${path}`, { signal })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch property (${response.status})`);
              }
              return response.json() as Promise<PropertyResponse>;
            });

        const coordinatesPromise = cachedCoordinates !== undefined
          ? Promise.resolve(cachedCoordinates)
          : fetch(`${apiBaseUrl}/map/${path}`, { signal })
            .then(async (response) => {
              if (!response.ok) {
                return null;
              }
              const mapPayload = (await response.json()) as MapResponse;
              return toMapCoordinates(mapPayload);
            });

        const boundaryPromise = propertyBoundaryCacheRef.current.has(selectedKey)
          ? Promise.resolve(propertyBoundaryCacheRef.current.get(selectedKey) ?? null)
          : fetch(`${apiBaseUrl}/map/${path}/boundary`, { signal })
            .then(async (response) => {
              if (!response.ok) {
                return null;
              }
              return (await response.json()) as PropertyBoundary;
            })
            .catch(() => null);

        const [propertyPayload, coordinatesPayload] = await Promise.all([
          propertyPromise, coordinatesPromise,
        ]);

        if (signal.aborted) {
          return;
        }

        propertyDataCacheRef.current.set(selectedKey, propertyPayload);
        mapCoordinatesCacheRef.current.set(selectedKey, coordinatesPayload);
        setPropertyData(propertyPayload);
        setMapCoordinates(coordinatesPayload);

        // Boundary lands later so the polygon fades in after the property is on screen.
        void boundaryPromise.then((boundaryPayload) => {
          if (signal.aborted) {
            return;
          }
          propertyBoundaryCacheRef.current.set(selectedKey, boundaryPayload);
          setPropertyBoundary(boundaryPayload);
        });
      } catch (error) {
        if (signal.aborted) {
          return;
        }
        setPropertyData(null);
        setMapCoordinates(null);
        setPropertyBoundary(null);
      }
    }

    const controller = new AbortController();
    loadPropertyInfo(controller.signal);

    return () => {
      controller.abort();
    };
  }, [selectedKey]);

  React.useEffect(() => {
    async function loadBuildingDetails(signal: AbortSignal) {
      if (!selectedProperty || !selectedKey) {
        setBuildingData([]);
        setIsBuildingsLoading(false);
        return;
      }

      const cachedBuildings = buildingsCacheRef.current.get(selectedKey);
      if (cachedBuildings !== undefined) {
        setBuildingData(cachedBuildings);
        setIsBuildingsLoading(false);
        return;
      }

      setBuildingData([]);
      setIsBuildingsLoading(true);

      try {
        const response = await fetch(`${apiBaseUrl}/property/${propertyPath(selectedProperty)}/buildings`, { signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch buildings (${response.status})`);
        }

        const payload = (await response.json()) as BuildingDetailsApiResponse[];
        const parsedBuildings = Array.isArray(payload)
          ? payload.map((building, index) => toBuildingOption(building, index, selectedKey))
          : [];

        if (signal.aborted) {
          return;
        }

        buildingsCacheRef.current.set(selectedKey, parsedBuildings);
        setBuildingData(parsedBuildings);
      } catch {
        if (signal.aborted) {
          return;
        }
        setBuildingData([]);
      } finally {
        if (!signal.aborted) {
          setIsBuildingsLoading(false);
        }
      }
    }

    const controller = new AbortController();
    loadBuildingDetails(controller.signal);

    return () => {
      controller.abort();
    };
  }, [selectedKey]);

  React.useEffect(() => {
    async function loadWasteCollection(signal: AbortSignal) {
      if (activeView !== "avfall") {
        setIsWasteCollectionLoading(false);
        return;
      }
      if (!selectedProperty || !selectedKey) {
        setWasteCollectionData(null);
        setIsWasteCollectionLoading(false);
        return;
      }

      const cachedWasteCollection = wasteCollectionCacheRef.current.get(selectedKey);
      if (cachedWasteCollection !== undefined) {
        setWasteCollectionData(cachedWasteCollection);
        setIsWasteCollectionLoading(false);
        return;
      }

      setWasteCollectionData(null);
      setIsWasteCollectionLoading(true);

      try {
        const response = await fetch(`${apiBaseUrl}/property/${propertyPath(selectedProperty)}/renovasjon`, { signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch waste collection (${response.status})`);
        }

        const payload = (await response.json()) as unknown;
        const parsedWasteCollection = toWasteCollectionItems(payload);

        if (signal.aborted) {
          return;
        }

        wasteCollectionCacheRef.current.set(selectedKey, parsedWasteCollection);
        setWasteCollectionData(parsedWasteCollection);
      } catch {
        if (signal.aborted) {
          return;
        }
        setWasteCollectionData(null);
      } finally {
        if (!signal.aborted) {
          setIsWasteCollectionLoading(false);
        }
      }
    }

    const controller = new AbortController();
    loadWasteCollection(controller.signal);

    return () => {
      controller.abort();
    };
  }, [selectedKey, activeView]);

  function handleLogout() {
    setIsMobileNavOpen(false);
    sessionStorage.removeItem("personnr");
    sessionStorage.removeItem(userFirstNameStorageKey);
    sessionStorage.removeItem("userFullName");
    sessionStorage.removeItem("bostedkommunenr");
    sessionStorage.removeItem(activeRoleIdStorageKey);
    sessionStorage.removeItem(activeRoleTypeStorageKey);
    window.location.hash = "#min-eiendom";
    setPersonnr(null);
    setUserFirstName(null);
    setBostedkommunenr(null);
    setRoles([]);
    setActiveRoleId(null);
    setActiveRoleType(null);
    resetColors();
  }

  function handleNavigate(view: AppView) {
    setIsMobileNavOpen(false);
    const nextHash = toHashFromView(view);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    } else {
      setActiveView(view);
    }
  }

  if (personnr === null) {
    return (
      <LoginPage
        onLoginSuccess={(pnr, firstName, kommunenr) => {
          setPersonnr(pnr);
          setUserFirstName(firstName);
          setBostedkommunenr(kommunenr);
        }}
      />
    );
  }

  return (
    <KommuneConfigProvider apiBaseUrl={apiBaseUrl} municipalityId={bostedkommunenr}>
      <div ref={mobileNavShellRef}>
        <Header
          onLogout={handleLogout}
          firstName={userFirstName}
          roles={roles}
          selectedRoleId={activeRoleId}
          isMobileNavOpen={isMobileNavOpen}
          onToggleMobileNav={() => setIsMobileNavOpen((open) => !open)}
          onRoleChange={(roleId) => {
            const role = roles.find((r) => r.id === roleId);
            if (!role) {
              return;
            }
            setActiveRoleId(role.id);
            setActiveRoleType(role.type);
            sessionStorage.setItem(activeRoleIdStorageKey, role.id);
            sessionStorage.setItem(activeRoleTypeStorageKey, role.type);
            window.location.hash = "#min-eiendom";
          }}
        />
        <Navigationbar
          activeView={activeView}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          isMenuOpen={isMobileNavOpen}
        />
      </div>
      <main style={{ padding: "24px 24px 64px", display: "grid", gap: "20px" }}>
        {activeView === "min-eiendom" ? (
          <>
            <PropertyChooser
              properties={propertyOptions}
              selectedProperty={selectedProperty}
              onSelect={setActiveProperty}
            />
            <PropertyInfo selectedProperty={selectedProperty?.label} data={propertyData ?? {}} loggedInPersonnr={personnr} />
            <BuildingDetails
              key={selectedKey ?? "no-property"}
              buildings={buildingData}
              isLoading={isBuildingsLoading}
            />
            <PropertyMap
              title="Eiendomskart"
              coordinates={mapCoordinates}
              boundary={propertyBoundary}
              showPropertyMarker={false}
              footer={
                <p className="map-disclaimer">
                  Eiendomsgrensene i kartet er veiledende og basert på data fra Matrikkelen.
                  De kan ikke brukes i grensetvister eller juridiske sammenhenger.
                </p>
              }
            />
          </>
        ) : activeView === "byggesak" ? (
          <ByggesakPage
            selectedProperty={selectedProperty}
            properties={propertyOptions}
            onPropertySelect={setActiveProperty}
          />
        ) : activeView === "naboliste" ? (
          <NabolistePage
            selectedProperty={selectedProperty}
            properties={propertyOptions}
            onPropertySelect={setActiveProperty}
          />
        ) : activeView === "avgifter" ? (
          <AvgifterPage
            selectedProperty={selectedProperty}
            properties={propertyOptions}
            onPropertySelect={setActiveProperty}
          />
        ) : (
          <AvfallPage
            liveWasteItems={wasteCollectionData}
            isWasteLoading={isWasteCollectionLoading}
            selectedProperty={selectedProperty}
            properties={propertyOptions}
            onPropertySelect={setActiveProperty}
          />
        )}
      </main>
      <Footer />
    </KommuneConfigProvider>
  );
}
