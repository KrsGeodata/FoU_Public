import React, { useEffect, useMemo, useRef, useState } from "react";
import PropertyMap from "../Map/Map";
import type { PropertyOption } from "../PropertyChooser/PropertyChooser";
import { propertyKey as computePropertyKey, propertyPath } from "../PropertyChooser/PropertyChooser";
import "./Naboliste.css";
import "./Naboliste.cards.css";
import "./Naboliste.notice.css";

// Shape of a single neighbor returned by the API.
type Neighbor = {
  id?: number;
  owner_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  lat?: number;
  lon?: number;
  distance?: number | string; // meters, may arrive as string from API
};

const API_BASE = "/api";
const MAX_RADIUS = 100; // slider upper bound in meters

// Convert any numeric-like value to a finite number, or null.
function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// Keeps a number within [min, max].
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Returns a human-readable distance string, e.g. "42 m unna".
function getDistanceText(distance: Neighbor["distance"]): string {
  const meters = toNumber(distance);
  return meters === null ? "Avstand ikke registrert" : `${Math.round(meters)} m unna`;
}

// Sorts neighbors ascending by distance; entries without a distance go last.
function sortByDistance(neighbors: Neighbor[]): Neighbor[] {
  return [...neighbors].sort((a, b) => {
    const da = toNumber(a.distance);
    const db = toNumber(b.distance);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  });
}

// Stable React list key: prefers the backend id, falls back to render index.
function neighborKey(neighbor: Neighbor, index: number): string {
  return neighbor.id != null ? String(neighbor.id) : String(index);
}

// Open the system email client with BCC pre-filled. Returns false when no valid emails found.
function openEmailClient(neighbors: Neighbor[], subject: string, body: string): boolean {
  const emails = [
    ...new Set(
      neighbors
        .map((n) => n.email?.trim())
        .filter((e): e is string => !!e && e.includes("@") && !e.includes(" ")),
    ),
  ];
  if (emails.length === 0) return false;

  const params = new URLSearchParams({ bcc: emails.join(","), subject, body });
  const link = Object.assign(document.createElement("a"), {
    href: `mailto:?${params.toString().replaceAll("+", "%20")}`,
    target: "_blank",
    rel: "noopener noreferrer",
  });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

// Fetch neighbors for a property within the given radius. Returns [] on error.
async function fetchNeighbors(property: PropertyOption, radius: number, signal: AbortSignal): Promise<Neighbor[]> {
  const url = `${API_BASE}/property/${propertyPath(property)}/neighbors?radius=${encodeURIComponent(radius)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Labeled range slider that emits a clamped meter value on change.
type RadiusControlProps = {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
};

function RadiusControl({ label, value, max, onChange }: RadiusControlProps) {
  return (
    <label className="radius-label">
      <span className="radius-text">{label}</span>
      <div className="radius-control">
        <input
          type="range"
          min={0}
          max={max}
          step={5}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value), 0, max))}
          aria-label="Radius i meter"
          style={{ "--pct": `${(value / max) * 100}%` } as React.CSSProperties}
        />
        <div className="radius-value">
          <input
            type="number"
            className="radius-value-input"
            min={0}
            max={max}
            step={1}
            value={value === 0 ? "" : value}
            placeholder="0"
            onChange={(e) => onChange(clamp(Number(e.target.value) || 0, 0, max))}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Radius i meter (manuell)"
          />
          <span className="radius-value-unit" aria-hidden="true">m</span>
        </div>
      </div>
    </label>
  );
}

// Single label/value row inside a neighbor card.
function NeighborDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="neighbor-detail">
      <span className="neighbor-detail-label">{label}</span>
      <span className="neighbor-detail-value">{value}</span>
    </div>
  );
}

type NeighborCardProps = {
  neighbor: Neighbor;
  index: number;
  id?: string;           // DOM id used for scroll-to from map marker click
  active?: boolean;      // highlights the card briefly after a map click
  headingLevel?: "h3" | "h4";
};

// Card showing address, owner, phone and email for one neighbor.
function NeighborCard({ neighbor, index, id, active, headingLevel: Heading = "h3" }: NeighborCardProps) {
  return (
    <article id={id} className={`neighbor-card${active ? " neighbor-card-active" : ""}`}>
      <div className="neighbor-head">
        <div>
          <Heading className="neighbor-title">{neighbor.owner_name ?? `Nabo ${index + 1}`}</Heading>
          <p className="neighbor-meta">{getDistanceText(neighbor.distance)}</p>
        </div>
      </div>
      <div className="neighbor-details">
        <NeighborDetail label="ADRESSE" value={neighbor.address ?? "Ukjent"} />
        <NeighborDetail label="TELEFON" value={neighbor.phone?.trim() || "Ikke registrert"} />
        <NeighborDetail label="E-POST" value={neighbor.email ?? "Ikke registrert"} />
      </div>
    </article>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type NabolisteProps = {
  selectedProperty: PropertyOption | null;
};

export default function Naboliste({ selectedProperty }: NabolisteProps) {
  const selectedKey = selectedProperty ? computePropertyKey(selectedProperty) : null;

  // ── Neighbors section state ──────────────────────────────────────────────
  const [radius, setRadius] = useState(50);               // slider value in meters
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);

  // ── Notice section state ─────────────────────────────────────────────────
  const [selectedNoticeKeys, setSelectedNoticeKeys] = useState<string[]>([]);
  const [subject, setSubject] = useState("Nabovarsel");
  const [message, setMessage] = useState(() => {
    const name = sessionStorage.getItem("userFullName") ?? sessionStorage.getItem("userFirstName");
    const closing = name ? `Vennlig hilsen\n${name}` : "Vennlig hilsen";
    return `Hei,\n\n\n\nVennligst svar dersom du har mottatt denne e-posten.\n\n${closing}`;
  });
  const [status, setStatus] = useState<string | null>(null); // feedback shown below the form

  // ── Shared ───────────────────────────────────────────────────────────────
  const [activeKey, setActiveKey] = useState<string | null>(null); // briefly highlighted card key
  const highlightTimer = useRef<number | null>(null);              // timeout id for clearing highlight
  const messageRef = useRef<HTMLTextAreaElement>(null);            // used for auto-resize

  const sortedNeighbors = useMemo(() => sortByDistance(neighbors), [neighbors]);
  // Set lookup keeps selection checks cheap while rendering many cards.
  const selectedNoticeKeySet = useMemo(() => new Set(selectedNoticeKeys), [selectedNoticeKeys]);
  const noticeNeighborEntries = useMemo(
    () => sortedNeighbors.map((n, i) => ({ neighbor: n, key: neighborKey(n, i) })),
    [sortedNeighbors],
  );
  const selectedNoticeRecipients = useMemo(
    () =>
      noticeNeighborEntries
        .filter((entry) => selectedNoticeKeySet.has(entry.key))
        .map((entry) => entry.neighbor),
    [noticeNeighborEntries, selectedNoticeKeySet],
  );
  // True when every available recipient card is currently selected.
  const allNoticeSelected = noticeNeighborEntries.length > 0 && selectedNoticeKeys.length === noticeNeighborEntries.length;

  // Map marker objects derived from neighbors that have valid coordinates.
  const mapMarkers = useMemo(
    () =>
      neighbors.flatMap((n, i) => {
        const lat = toNumber(n.lat);
        const lon = toNumber(n.lon);
        if (lat === null || lon === null) return [];
        return [{
          neighborKey: neighborKey(n, i),
          lat, lng: lon,
          title: n.address ?? `Nabo ${i + 1}`,
          address: n.address,
          ownerName: n.owner_name,
          phone: n.phone,
          email: n.email,
          distanceMeters: toNumber(n.distance),
        }];
      }),
    [neighbors],
  );

  // Fetch map coordinates for the selected property.
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!selectedProperty) { setMapCoords(null); return; }
    const ctrl = new AbortController();
    fetch(`${API_BASE}/map/${propertyPath(selectedProperty)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!ctrl.signal.aborted && data?.lat != null && data?.lon != null) {
          setMapCoords({ lat: Number(data.lat), lng: Number(data.lon) });
        } else if (!ctrl.signal.aborted) {
          setMapCoords(null);
        }
      })
      .catch(() => { if (!ctrl.signal.aborted) setMapCoords(null); });
    return () => ctrl.abort();
  }, [selectedKey]);

  // Load neighbor list used by map + "Dine naboer" section.
  useEffect(() => {
    if (!selectedProperty) { setNeighbors([]); return; }
    const ctrl = new AbortController();
    fetchNeighbors(selectedProperty, radius, ctrl.signal)
      .then(setNeighbors)
      .catch((err) => { if (!ctrl.signal.aborted) { console.error(err); setNeighbors([]); } });
    return () => ctrl.abort();
  }, [selectedKey, radius]);

  // Cleanup highlight timer on unmount.
  useEffect(() => () => { if (highlightTimer.current) window.clearTimeout(highlightTimer.current); }, []);

  // Auto-resize textarea to fit content on mount, message change, and window resize.
  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    function resize() {
      el!.style.height = "auto";
      el!.style.height = `${el!.scrollHeight}px`;
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [message]);

  // Keep selected keys in sync when notice list changes.
  useEffect(() => {
    const available = new Set(noticeNeighborEntries.map((entry) => entry.key));
    setSelectedNoticeKeys((prev) => prev.filter((key) => available.has(key)));
  }, [noticeNeighborEntries]);

  // Reset notice status when relevant inputs change.
  useEffect(() => { setStatus(null); }, [subject, selectedNoticeKeys]);

  // Scrolls to the matching neighbor card and briefly highlights it.
  const handleMapMarkerClick = React.useCallback((key: string) => {
    document.getElementById(`neighbor-card-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveKey(key);
    if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => { setActiveKey(null); highlightTimer.current = null; }, 1800);
  }, []);

  function toggleNoticeRecipient(key: string) {
    setSelectedNoticeKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function toggleSelectAllNoticeRecipients() {
    if (allNoticeSelected) {
      setSelectedNoticeKeys([]);
      return;
    }

    // Select every rendered notice candidate.
    setSelectedNoticeKeys(noticeNeighborEntries.map((entry) => entry.key));
  }

  // Validates the form, then opens the system email client with recipients in BCC.
  function handleSendNotice(e: React.FormEvent) {
    e.preventDefault();
    if (selectedNoticeRecipients.length === 0) { setStatus("Velg minst én nabo du vil varsle."); return; }
    if (!message.trim()) { setStatus("Skriv en melding før du sender nabovarsel."); return; }
    const sent = openEmailClient(selectedNoticeRecipients, subject.trim() || "Nabovarsel", message.trim());
    if (!sent) { setStatus("Ingen av de valgte naboene har gyldig e-post."); return; }
    const count = selectedNoticeRecipients.filter((n) => n.email?.trim()?.includes("@")).length;
    setStatus(`Åpner e-post med ${count} valgte mottakere.`);
    setMessage("");
  }

  return (
    <div className="naboliste">
      <section className="naboliste-section neighbors-map-wrapper ui-panel">
        <PropertyMap
          title="Kart over naboer"
          controls={<RadiusControl label="Angi avstand for naboliste" value={radius} max={MAX_RADIUS} onChange={setRadius} />}
          coordinates={mapCoords}
          neighbors={neighbors}
          neighborMarkers={mapMarkers}
          radiusMeters={radius}
          enableFullscreen
          onNeighborClick={handleMapMarkerClick}
        />
      </section>

      <section className="naboliste-section notice-panel ui-panel">
        <h2 className="naboliste-section-title">Dine naboer og send nabovarsel</h2>
        <p className="page-text notice-intro">Klikk på naboene du vil varsle, og åpne e-post med mottakere ferdig utfylt.</p>

        <h3 className="naboliste-section-title">
          {`Naboer innenfor ${radius} meter (${selectedNoticeRecipients.length} valgt)`}
        </h3>
        <div className="notice-selection-actions">
          <button
            type="button"
            className="notice-select-all-button"
            onClick={toggleSelectAllNoticeRecipients}
            disabled={noticeNeighborEntries.length === 0}
          >
            {allNoticeSelected ? "Fjern alle" : "Velg alle naboer innenfor valgt radius"}
          </button>
        </div>
        {noticeNeighborEntries.length === 0 ? (
          <p className="page-text">Ingen naboer funnet i valgt radius.</p>
        ) : (
          <ul className="neighbor-list">
            {noticeNeighborEntries.map(({ neighbor, key }, i) => {
              const selected = selectedNoticeKeySet.has(key);
              const cardIsActive = selected || activeKey === key;

              return (
                <li key={`notice-${key}`} className="neighbor-item">
                  <button
                    type="button"
                    className={`notice-recipient-button${selected ? " is-selected" : ""}`}
                    aria-pressed={selected}
                    onClick={() => toggleNoticeRecipient(key)}
                  >
                    <span className={`notice-recipient-indicator${selected ? " is-active" : ""}`} aria-hidden="true" />
                    <NeighborCard
                      neighbor={neighbor}
                      index={i}
                      id={`neighbor-card-${key}`}
                      headingLevel="h4"
                      active={cardIsActive}
                    />
                    <span className="notice-select-hint">{selected ? "Valgt mottaker" : "Trykk for å velge mottaker"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <form className="notice-form" onSubmit={handleSendNotice}>
          <label className="notice-field">
            <span>Emne</span>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Skriv emne" />
          </label>
          <label className="notice-field">
            <span>Melding</span>
            <textarea ref={messageRef} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Skriv nabovarsel..." />
          </label>
          <button type="submit" className="notice-send-button">Åpne i e-post</button>
          <p className="notice-status" aria-live="polite">{status ?? "\u00A0"}</p>
        </form>
      </section>
    </div>
  );
}
