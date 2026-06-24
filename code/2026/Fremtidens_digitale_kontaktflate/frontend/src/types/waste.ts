/** Main purpose: Shared data types for the waste page. */
export type WasteCategory =
  | "restavfall"
  | "matavfall"
  | "papir"
  | "plast"
  | "glass";

/** One waste item shown in the list. Optional fields can be filled from backend later. */
export interface WasteItem {
  id: WasteCategory;
  title: string;
  img: string;
  frequency?: string;
  badges?: string[];
  nextPickups?: string[];
}

/** Single waste fraction from the RenovasjonAPI response. */
export interface Hentedag {
  fraksjon: string;
  neste_henting: string | null;
  kommende_datoer: string[];
}

/** Full response from GET /property/{id}/renovasjon. */
export interface RenovasjonResponse {
  adresse: string | null;
  kommune: string | null;
  kommunenummer: string | null;
  provider: string | null;
  hentedager: Hentedag[];
}

/** Normalized waste item used internally by frontend components. */
export interface WasteCollectionItem {
  id: WasteCategory;
  title: string;
  frequency?: string | null;
  nextPickups?: string[];
}
