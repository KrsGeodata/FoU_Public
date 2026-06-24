import type { WasteCategory, WasteCollectionItem, RenovasjonResponse } from "../types/waste";

export const wasteCategoryTitle: Record<WasteCategory, string> = {
  restavfall: "Restavfall",
  matavfall: "Matavfall",
  papir: "Papp og papir",
  plast: "Plastemballasje",
  glass: "Glass og metall",
};

export function normalizeWasteKey(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[å]/g, "a")
    .replace(/[ø]/g, "o")
    .replace(/[æ]/g, "ae")
    .replace(/[^a-z0-9]/g, "");
}

export function toWasteCategory(id?: string, title?: string): WasteCategory | null {
  const rawValues = [id, title].filter((value): value is string => Boolean(value && value.trim()));

  for (const rawValue of rawValues) {
    const value = normalizeWasteKey(rawValue);

    if (
      value === "restavfall"
      || value === "rest"
      || value === "residual"
      || value === "residualwaste"
      || value === "matogrestavfall"
    ) {
      return "restavfall";
    }
    if (
      value === "matavfall"
      || value === "mat"
      || value === "food"
      || value === "organic"
      || value === "bioavfall"
      || value === "biowaste"
      || value === "bio"
    ) {
      return "matavfall";
    }
    if (
      value === "papir"
      || value === "pappogpapir"
      || value === "paper"
      || value === "cardboard"
    ) {
      return "papir";
    }
    if (
      value === "plast"
      || value === "plastemballasje"
      || value === "plastic"
    ) {
      return "plast";
    }
    if (
      value === "glass"
      || value === "metal"
      || value === "metall"
      || value === "glassogmetall"
      || value === "glassogmetallemballasje"
    ) {
      return "glass";
    }
  }

  return null;
}

export function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === "string");
}

/** Normalize RenovasjonAPI response to safe frontend waste collection data. */
export function toWasteCollectionItems(payload: unknown): WasteCollectionItem[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }

  const response = payload as RenovasjonResponse;
  const hentedager = response.hentedager;
  if (!Array.isArray(hentedager)) {
    return [];
  }

  return hentedager.flatMap((hentedag): WasteCollectionItem[] => {
    if (!hentedag || typeof hentedag !== "object") {
      return [];
    }

    const category = toWasteCategory(hentedag.fraksjon);
    if (!category) {
      return [];
    }

    const title = category === "glass"
      ? wasteCategoryTitle.glass
      : (typeof hentedag.fraksjon === "string" && hentedag.fraksjon.trim()
        ? hentedag.fraksjon
        : wasteCategoryTitle[category]);

    const nextPickups = toStringList(hentedag.kommende_datoer);

    return [
      {
        id: category,
        title,
        frequency: null,
        nextPickups,
      },
    ];
  });
}
