import React from "react";
import type { Feature, Polygon } from "geojson";
import L, {
  type Circle as LeafletCircle,
  type LatLngTuple,
  type Layer as LeafletLayer,
  type LayerGroup as LeafletLayerGroup,
  type Map as LeafletMap,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

export type MapCoordinates = {
  lat: number;
  lng: number;
};

export type MapNeighborMarker = {
  neighborKey?: string;
  lat: number;
  lng: number;
  title?: string;
  address?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  distanceMeters?: number | null;
};

export type MapNeighbor = {
  id?: number | string | null;
  lat?: number | string | null;
  lon?: number | string | null;
  address?: string | null;
  owner_name?: string | null;
  phone?: string | null;
  email?: string | null;
  distance?: number | string | null;
};

type MapProps = {
  coordinates?: MapCoordinates | null;
  boundary?: Feature<Polygon> | null;
  neighbors?: MapNeighbor[];
  title?: string;
  controls?: React.ReactNode;
  footer?: React.ReactNode;
  radiusMeters?: number | null;
  neighborMarkers?: MapNeighborMarker[];
  propertyMarkerType?: "circle" | "home";
  showPropertyMarker?: boolean;
  enableFullscreen?: boolean;
  onNeighborClick?: (neighborKey: string) => void;
};

const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const boundaryStyle = { color: "#1d4ed8", weight: 2, fillColor: "#60a5fa", fillOpacity: 0.15 };
const defaultCenter: LatLngTuple = [58.1467, 7.9956];
const defaultZoom = 15;
const propertyZoom = 17;
const mapPadding: [number, number] = [40, 40];
const propertyMarkerBlue = "#1d4ed8";
const propertyMarkerLightBlue = "#60a5fa";
const radiusStrokeColor = "#2f5f89";
const radiusFillColor = "#7ca9d4";
const personIconHtml = '<img src="/profilePicture.svg" class="map-icon-person-image" alt="" aria-hidden="true" />';
const noCoordinatesText = "Ingen koordinater valgt enda.";

const personIcon = L.divIcon({
  className: "map-icon map-icon-person",
  html: personIconHtml,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type WebkitHTMLElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toNeighborMarker(neighbor: MapNeighbor, index: number): MapNeighborMarker | null {
  const lat = toNumber(neighbor.lat);
  const lon = toNumber(neighbor.lon);

  if (lat === null || lon === null) {
    return null;
  }

  const address = toText(neighbor.address);
  const ownerName = toText(neighbor.owner_name);
  const phone = toText(neighbor.phone);
  const email = toText(neighbor.email);
  const distanceMeters = toNumber(neighbor.distance);

  return {
    neighborKey: neighbor.id != null ? String(neighbor.id) : String(index),
    lat,
    lng: lon,
    title: address ?? `Nabo ${index + 1}`,
    address: address ?? undefined,
    ownerName: ownerName ?? undefined,
    phone: phone ?? undefined,
    email: email ?? undefined,
    distanceMeters,
  };
}

function buildNeighborTooltipHtml(marker: MapNeighborMarker, index: number): string {
  const title = marker.address ?? marker.title ?? `Nabo ${index + 1}`;
  const distance = marker.distanceMeters != null ? `${Math.round(marker.distanceMeters)} m unna` : "Avstand ikke registrert";
  const owner = marker.ownerName ?? "Ikke registrert";
  const phone = marker.phone ?? "Ikke registrert";
  const email = marker.email ?? "Ikke registrert";

  return `
    <div class="map-neighbor-tooltip">
      <p class="map-neighbor-tooltip-title">${escapeHtml(title)}</p>
      <p class="map-neighbor-tooltip-distance">${escapeHtml(distance)}</p>
      <div class="map-neighbor-tooltip-row">
        <span class="map-neighbor-tooltip-label">Eier</span>
        <span class="map-neighbor-tooltip-value">${escapeHtml(owner)}</span>
      </div>
      <div class="map-neighbor-tooltip-row">
        <span class="map-neighbor-tooltip-label">Telefon</span>
        <span class="map-neighbor-tooltip-value">${escapeHtml(phone)}</span>
      </div>
      <div class="map-neighbor-tooltip-row">
        <span class="map-neighbor-tooltip-label">E-post</span>
        <span class="map-neighbor-tooltip-value">${escapeHtml(email)}</span>
      </div>
    </div>
  `;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function isValidRadius(value: number | null): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function createPropertyMarker(point: LatLngTuple, type: "circle" | "home"): LeafletLayer {
  if (type === "home") {
    return L.circleMarker(point, {
      radius: 7,
      color: propertyMarkerBlue,
      weight: 1,
      fillColor: propertyMarkerBlue,
      fillOpacity: 1,
    });
  }

  return L.circleMarker(point, {
    radius: 8,
    color: propertyMarkerBlue,
    weight: 2,
    fillColor: propertyMarkerLightBlue,
    fillOpacity: 0.9,
  });
}

function getOrCreateNeighborLayer(
  map: LeafletMap,
  layerRef: React.MutableRefObject<LeafletLayerGroup | null>,
): LeafletLayerGroup {
  if (!layerRef.current) {
    layerRef.current = L.layerGroup().addTo(map);
  }

  return layerRef.current;
}

function drawNeighborMarkers(
  layer: LeafletLayerGroup,
  markers: MapNeighborMarker[],
  onNeighborClick?: (neighborKey: string) => void,
): LatLngTuple[] {
  layer.clearLayers();

  const points: LatLngTuple[] = [];
  for (let i = 0; i < markers.length; i += 1) {
    const marker = markers[i];
    if (!isValidLatLng(marker.lat, marker.lng)) {
      continue;
    }

    const point: LatLngTuple = [marker.lat, marker.lng];
    const leafletMarker = L.marker(point, {
      icon: personIcon,
      title: marker.title ?? `Nabo ${i + 1}`,
      alt: marker.title ?? `Nabo ${i + 1}`,
    }).addTo(layer);

    leafletMarker.bindTooltip(buildNeighborTooltipHtml(marker, i), {
      className: "map-neighbor-tooltip-card",
      // "auto" avoids the tooltip being clipped at the top edge.
      direction: "auto",
      offset: [12, 0],
      opacity: 1,
    });

    if (onNeighborClick) {
      const neighborKey = marker.neighborKey ?? String(i);
      leafletMarker.on("click", () => onNeighborClick(neighborKey));
    }

    points.push(point);
  }

  return points;
}

function resolveNeighborMarkers(neighborMarkers: MapNeighborMarker[] | undefined, neighbors: MapNeighbor[]): MapNeighborMarker[] {
  if (neighborMarkers !== undefined) {
    return neighborMarkers;
  }

  return neighbors
    .map(toNeighborMarker)
    .filter((marker): marker is MapNeighborMarker => marker !== null);
}

function syncRadiusCircle(
  map: LeafletMap,
  circleRef: React.MutableRefObject<LeafletCircle | null>,
  center: LatLngTuple,
  radiusMeters: number | null,
): LeafletCircle | null {
  if (!isValidRadius(radiusMeters)) {
    circleRef.current?.remove();
    circleRef.current = null;
    return null;
  }

  if (!circleRef.current) {
    circleRef.current = L.circle(center, {
      radius: radiusMeters,
      color: radiusStrokeColor,
      weight: 2,
      fillColor: radiusFillColor,
      fillOpacity: 0.18,
    }).addTo(map);
    return circleRef.current;
  }

  circleRef.current.setLatLng(center);
  circleRef.current.setRadius(radiusMeters);
  return circleRef.current;
}

function getCurrentFullscreenElement(): Element | null {
  const doc = document as WebkitDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export default function Map({
  coordinates,
  boundary = null,
  neighbors = [],
  title = "Map",
  controls,
  footer,
  radiusMeters = null,
  neighborMarkers,
  propertyMarkerType = "circle",
  showPropertyMarker = true,
  enableFullscreen = false,
  onNeighborClick,
}: MapProps) {
  const resetTooltipId = React.useId();
  const mapSectionRef = React.useRef<HTMLElement | null>(null);
  const mapElementRef = React.useRef<HTMLDivElement | null>(null);
  const resetButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const mapRef = React.useRef<LeafletMap | null>(null);
  const propertyMarkerRef = React.useRef<LeafletLayer | null>(null);
  const boundaryLayerRef = React.useRef<LeafletLayer | null>(null);
  const radiusCircleRef = React.useRef<LeafletCircle | null>(null);
  const neighborLayerRef = React.useRef<LeafletLayerGroup | null>(null);
  const [resolvedCoordinates, setResolvedCoordinates] = React.useState<MapCoordinates | null>(coordinates ?? null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const resolvedNeighborMarkers = React.useMemo(
    () => resolveNeighborMarkers(neighborMarkers, neighbors),
    [neighborMarkers, neighbors],
  );

  // Sync resolved coordinates with the coordinates prop.
  React.useEffect(() => {
    setResolvedCoordinates(coordinates ?? null);
  }, [coordinates]);

  // Create Leaflet instance once coordinates are available so the initial view
  // lands on the property instead of flickering through defaultCenter.
  React.useEffect(() => {
    if (mapRef.current || !mapElementRef.current || !resolvedCoordinates) {
      return;
    }

    const initialCenter: LatLngTuple = [resolvedCoordinates.lat, resolvedCoordinates.lng];
    const map = L.map(mapElementRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      minZoom: 15,
      maxZoom: 19
    }).setView(initialCenter, propertyZoom);

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());

    mapRef.current = map;
    neighborLayerRef.current = L.layerGroup().addTo(map);
    window.setTimeout(() => map.invalidateSize(), 0);
  }, [resolvedCoordinates]);

  // Dispose Leaflet instance on unmount.
  React.useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      propertyMarkerRef.current = null;
      boundaryLayerRef.current = null;
      radiusCircleRef.current = null;
      neighborLayerRef.current = null;
    };
  }, []);

  // Track fullscreen state to update button label and force map resize.
  React.useEffect(() => {
    if (!enableFullscreen) {
      setIsFullscreen(false);
      return;
    }

    function handleFullscreenChange() {
      const isCurrentMapFullscreen = getCurrentFullscreenElement() === mapSectionRef.current;
      setIsFullscreen(isCurrentMapFullscreen);
      window.setTimeout(() => mapRef.current?.invalidateSize(), 0);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [enableFullscreen]);

  React.useEffect(() => {
    const button = resetButtonRef.current;
    if (!button) {
      return;
    }

    L.DomEvent.disableClickPropagation(button);
    L.DomEvent.disableScrollPropagation(button);
  }, [Boolean(resolvedCoordinates)]);

  // Keep markers, boundary polygon, radius circle and neighbors in sync.
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const neighborLayer = getOrCreateNeighborLayer(map, neighborLayerRef);

    boundaryLayerRef.current?.remove();
    boundaryLayerRef.current = boundary
      ? L.geoJSON(boundary, { style: boundaryStyle }).addTo(map)
      : null;

    if (!resolvedCoordinates) {
      map.setView(defaultCenter, defaultZoom);
      propertyMarkerRef.current?.remove();
      propertyMarkerRef.current = null;
      radiusCircleRef.current?.remove();
      radiusCircleRef.current = null;
      neighborLayer.clearLayers();
      return;
    }

    const center: LatLngTuple = [resolvedCoordinates.lat, resolvedCoordinates.lng];

    propertyMarkerRef.current?.remove();
    propertyMarkerRef.current = showPropertyMarker
      ? createPropertyMarker(center, propertyMarkerType).addTo(map)
      : null;

    const radiusCircle = syncRadiusCircle(map, radiusCircleRef, center, radiusMeters);

    const neighborPoints = drawNeighborMarkers(neighborLayer, resolvedNeighborMarkers, onNeighborClick);
    const shouldFitBounds = Boolean(radiusCircle) || neighborPoints.length > 0;

    if (!shouldFitBounds) {
      map.setView(center, propertyZoom);
      return;
    }

    const bounds = L.latLngBounds(center, center);
    if (radiusCircle) {
      bounds.extend(radiusCircle.getBounds());
    }

    for (let i = 0; i < neighborPoints.length; i += 1) {
      bounds.extend(neighborPoints[i]);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: mapPadding, maxZoom: 18 });
    } else {
      map.setView(center, propertyZoom);
    }
  }, [boundary, onNeighborClick, propertyMarkerType, radiusMeters, resolvedCoordinates, resolvedNeighborMarkers, showPropertyMarker]);

  const toggleFullscreen = React.useCallback(async () => {
    if (!enableFullscreen || !mapSectionRef.current) {
      return;
    }

    const target = mapSectionRef.current as WebkitHTMLElement;
    const doc = document as WebkitDocument;

    try {
      if (getCurrentFullscreenElement() === mapSectionRef.current) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          return;
        }

        if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      } else {
        if (mapSectionRef.current.requestFullscreen) {
          await mapSectionRef.current.requestFullscreen();
          return;
        }

        if (target.webkitRequestFullscreen) {
          await target.webkitRequestFullscreen();
        }
      }
    } catch (error) {
      console.error("Unable to toggle fullscreen mode:", error);
    }
  }, [enableFullscreen]);

  const resetView = React.useCallback(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (!resolvedCoordinates) {
      map.setView(defaultCenter, defaultZoom, { animate: false });
      return;
    }

    map.setView([resolvedCoordinates.lat, resolvedCoordinates.lng], propertyZoom, { animate: false });
  }, [resolvedCoordinates]);

  const handleResetViewPointerDown = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    // Prevent Leaflet map interactions from hijacking control clicks on touch/mouse.
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleResetViewClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    mapRef.current?.stop();
    resetView();
  }, [resetView]);

  return (
    <section ref={mapSectionRef} className="map-card ui-panel">
      <div className="map-header">
        <h2 className="map-title">{title}</h2>
        {enableFullscreen ? (
          <button
            type="button"
            className="map-fullscreen-button"
            aria-pressed={isFullscreen}
            onClick={() => {
              void toggleFullscreen();
            }}
          >
            {isFullscreen ? "Lukk fullskjerm" : "Fullskjerm"}
          </button>
        ) : null}
      </div>
      {controls ? <div className="map-controls">{controls}</div> : null}
      <div className="map-canvas-wrapper">
        <div ref={mapElementRef} className="map-canvas" />
        {resolvedCoordinates ? (
          <button
            ref={resetButtonRef}
            type="button"
            className="map-reset-view-button"
            onPointerDown={handleResetViewPointerDown}
            onClick={handleResetViewClick}
            aria-label="Tilbakestill visning"
            aria-describedby={resetTooltipId}
          >
            <svg className="map-reset-view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
            <span id={resetTooltipId} className="map-reset-view-tooltip" role="tooltip">
              Tilbakestill kartet til standardutsnitt
            </span>
          </button>
        ) : null}
      </div>
      {!resolvedCoordinates ? <p className="map-empty">{noCoordinatesText}</p> : null}
      {footer ? <div className="map-footer">{footer}</div> : null}
    </section>
  );
}
