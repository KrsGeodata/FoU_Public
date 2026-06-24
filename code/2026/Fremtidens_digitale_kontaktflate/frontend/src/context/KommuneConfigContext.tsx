import React from "react";

type KommuneColors = {
  primary: string;
  secondary: string;
};

type KommuneContact = {
  email: string;
  phone: string;
  website: string;
  visiting_address_line1: string;
  visiting_address_line2: string;
  opening_hours: string[];
};

type KommuneLink = {
  label: string;
  url: string;
};

/** Dynamic tooltip map — keys are field names, values are tooltip text from CMS. */
export type KommuneTooltips = Record<string, string>;

export type KommuneConfig = {
  municipality_id: string;
  name: string;
  logo_url: string;
  colors: KommuneColors;
  contact: KommuneContact;
  org_number: string;
  content_blocks: Record<string, string>;
  links: KommuneLink[];
  tooltips: KommuneTooltips;
};

type KommuneConfigContextValue = {
  config: KommuneConfig | null;
  // Base URL of the backend API — use this to resolve relative logo_url paths.
  apiBaseUrl: string;
};

const KommuneConfigContext = React.createContext<KommuneConfigContextValue>({
  config: null,
  apiBaseUrl: "",
});

export function useKommuneConfig(): KommuneConfigContextValue {
  return React.useContext(KommuneConfigContext);
}

type Props = {
  apiBaseUrl: string;
  // When provided, fetches config for this specific municipality instead of the default.
  // Re-fetches automatically whenever the value changes (e.g. user switches property).
  municipalityId: string | null;
  children: React.ReactNode;
};

function applyColors(colors: KommuneColors) {
  const root = document.documentElement;
  root.style.setProperty("--kommune-primary", colors.primary);
  root.style.setProperty("--kommune-secondary", colors.secondary);
}

export function resetColors() {
  const root = document.documentElement;
  root.style.removeProperty("--kommune-primary");
  root.style.removeProperty("--kommune-secondary");
}

// Bump this version whenever the KommuneConfig shape changes, to invalidate old cached data.
const CACHE_VERSION = "v3";

function cacheKey(municipalityId: string | null) {
  return `kommune-config-${CACHE_VERSION}-${municipalityId ?? "default"}`;
}

function loadCached(municipalityId: string | null): KommuneConfig | null {
  try {
    const raw = localStorage.getItem(cacheKey(municipalityId));
    return raw ? (JSON.parse(raw) as KommuneConfig) : null;
  } catch {
    return null;
  }
}

export function KommuneConfigProvider({ apiBaseUrl, municipalityId, children }: Props) {
  const [config, setConfig] = React.useState<KommuneConfig | null>(() => {
    // Load cached config synchronously so colors are applied before first render,
    // avoiding a flash of the CSS fallback colors on page refresh.
    const cached = loadCached(municipalityId);
    if (cached) applyColors(cached.colors);
    return cached;
  });

  React.useEffect(() => {
    const controller = new AbortController();

    // Fetch the config for the given municipality, or the backend default if no ID is known yet.
    const url = municipalityId
      ? `${apiBaseUrl}/municipality-config/${municipalityId}`
      : `${apiBaseUrl}/municipality-config/`;

    // Fetch municipality config and CMS tooltips in parallel.
    const configPromise = fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Config fetch failed (${res.status})`);
        return res.json() as Promise<KommuneConfig>;
      });

    const tooltipsPromise = fetch(`${apiBaseUrl}/cms/tooltips`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Tooltips fetch failed (${res.status})`);
        return res.json() as Promise<KommuneTooltips>;
      })
      .catch(() => ({}) as KommuneTooltips);

    configPromise
      .then(async (data) => {
        // Merge CMS tooltips into config — CMS endpoint takes precedence.
        const cmsTooltips = await tooltipsPromise;
        data.tooltips = { ...data.tooltips, ...cmsTooltips };

        applyColors(data.colors);
        localStorage.setItem(cacheKey(municipalityId), JSON.stringify(data));
        setConfig(data);
      })
      .catch((err) => {
        // Silently fall back to cached or static CSS defaults — no UI disruption.
        if (import.meta.env.DEV) console.warn("[KommuneConfig] fetch failed:", err);
      });

    return () => {
      controller.abort();
    };
  }, [apiBaseUrl, municipalityId]);

  return (
    <KommuneConfigContext.Provider value={{ config, apiBaseUrl }}>
      {children}
    </KommuneConfigContext.Provider>
  );
}
