import WasteList from "./WasteList";
import { WasteCollectionItem, WasteItem } from "../../types/waste";
import "./AvfallPage.css";
import AddressDropdown from "../../components/AddressDropdown/AddressDropdown";
import type { PropertyOption } from "../../components/PropertyChooser/PropertyChooser";

type AvfallPageProps = {
  liveWasteItems?: WasteCollectionItem[] | null;
  isWasteLoading?: boolean;
  selectedProperty?: PropertyOption | null;
  properties?: PropertyOption[];
  onPropertySelect?: (p: PropertyOption) => void;
};

const restavfallImg = "/restavfall.png";
const matavfallImg = "/matAvfall.png";
const plastImg = "/Plastemballasje-1.jpeg.webp";
const papirImg = "/aviser.jpg.webp";
const glassImg = "/glass-og-metallemballasje.jpg.webp";

const defaultWasteItems: WasteItem[] = [
  {
    id: "restavfall",
    title: "Restavfall",
    img: restavfallImg,
    frequency: "Kan tømmes hver uke",
    badges: ["Svart dunk"],
    nextPickups: ["", "", ""],
  },
  {
    id: "matavfall",
    title: "Matavfall",
    img: matavfallImg,
    frequency: "Kan tømmes hver uke",
    badges: ["Brun dunk"],
    nextPickups: ["", "", ""],
  },
  {
    id: "papir",
    title: "Papp og papir",
    img: papirImg,
    frequency: "Kan tømmes hver 4. uke",
    badges: ["Blå dunk"],
    nextPickups: ["", "", ""],
  },
  {
    id: "plast",
    title: "Plastemballasje",
    img: plastImg,
    frequency: "Kan tømmes hver 4. uke",
    badges: ["Plastsekk"],
    nextPickups: ["", "", ""],
  },
  {
    id: "glass",
    title: "Glass og metall",
    img: glassImg,
    frequency: "Kan tømmes hver 8. uke",
    badges: ["Grønn dunk"],
    nextPickups: ["", "", ""],
  },
];

function formatPickupDate(value: string): string {
  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!isoDateMatch) {
    return value;
  }
  return `${isoDateMatch[3]}.${isoDateMatch[2]}.${isoDateMatch[1]}`;
}

function parseIsoDate(value: string): Date | null {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return null;
  }
  return new Date(timestamp);
}

function inferWeeksFromDates(nextPickups?: string[]): number | null {
  if (!nextPickups || nextPickups.length < 2) {
    return null;
  }

  const first = parseIsoDate(nextPickups[0]);
  const second = parseIsoDate(nextPickups[1]);
  if (!first || !second) {
    return null;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round(Math.abs(second.getTime() - first.getTime()) / msPerDay);
  if (diffDays <= 0) {
    return null;
  }

  return Math.max(1, Math.round(diffDays / 7));
}

function inferWeeksFromFrequencyText(frequency?: string | null): number | null {
  if (!frequency) {
    return null;
  }

  const normalized = frequency.toLowerCase();

  if (normalized.includes("partallsuk") || normalized.includes("oddetallsuk")) {
    return 2;
  }
  if (normalized.includes("annenhver") || normalized.includes("annethver")) {
    return 2;
  }
  if (normalized.includes("hver uke") || normalized.includes("ukentlig")) {
    return 1;
  }

  const match = normalized.match(/(\d+)\s*\.?\s*uke/);
  if (!match?.[1]) {
    return null;
  }

  const parsed = Number.parseInt(match[1], 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function toWasteFrequencyText(
  frequency?: string | null,
  nextPickups?: string[],
  fallbackFrequency?: string,
): string {
  const intervalWeeks = inferWeeksFromFrequencyText(frequency) ?? inferWeeksFromDates(nextPickups);

  if (intervalWeeks === 1) {
    return "Kan tømmes hver uke";
  }
  if (intervalWeeks && intervalWeeks > 1) {
    return `Kan tømmes hver ${intervalWeeks}. uke`;
  }

  return fallbackFrequency ?? "Kan tømmes";
}

function mergeWasteItems(
  fallbackItems: WasteItem[],
  liveItems: WasteCollectionItem[],
): WasteItem[] {
  const liveItemsById = new Map(liveItems.map((item) => [item.id, item]));

  return fallbackItems.map((fallbackItem) => {
    const liveItem = liveItemsById.get(fallbackItem.id);
    if (!liveItem) {
      if (fallbackItem.id === "matavfall") {
        return {
          ...fallbackItem,
          frequency: "",
          nextPickups: ["Ingen separat matavfallshenting", "", ""],
        };
      }
      return fallbackItem;
    }

    const nextPickups = (liveItem.nextPickups ?? []).map(formatPickupDate);

    return {
      ...fallbackItem,
      title: liveItem.title || fallbackItem.title,
      frequency: toWasteFrequencyText(
        liveItem.frequency,
        liveItem.nextPickups,
        fallbackItem.frequency,
      ),
      nextPickups: nextPickups.length ? nextPickups : fallbackItem.nextPickups,
    };
  });
}

/** Main purpose: Build the waste page and pass display data to WasteList. */
export default function AvfallPage({
  liveWasteItems,
  isWasteLoading = false,
  selectedProperty,
  properties = [],
  onPropertySelect,
}: AvfallPageProps) {
  const hasLiveWasteItems = Boolean(liveWasteItems?.length);
  const wasteItems = hasLiveWasteItems
    ? mergeWasteItems(defaultWasteItems, liveWasteItems ?? [])
    : defaultWasteItems;

  return (
    <div className="waste-page">
      <section className="waste-panel">
        <AddressDropdown
          properties={properties}
          selectedProperty={selectedProperty ?? null}
          onSelect={onPropertySelect}
        />
        <div className="waste-page-header">
          <h1 className="page-title">Avfall og tømming</h1>
          <p className="page-subtitle">
            Enkel oversikt over neste tømming for de ulike avfallstypene.
          </p>
        </div>

        <div className="pickup-group">
          {isWasteLoading && !hasLiveWasteItems ? (
            <p className="waste-note">Laster avfallsdata...</p>
          ) : (
            <WasteList items={wasteItems} />
          )}
        </div>

        <p className="waste-note">
          <strong>Merk:</strong> Tømmingstider kan endres ved helligdager. Sett frem
          avfall innen kl. 06:00 på tømmedagen.
        </p>
      </section>
    </div>
  );
}
