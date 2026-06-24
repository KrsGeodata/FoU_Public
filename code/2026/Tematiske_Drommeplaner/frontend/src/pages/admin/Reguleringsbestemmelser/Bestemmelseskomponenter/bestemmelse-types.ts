export interface BuildingTypeOption {
  code: string
  name: string
}

export interface BestemmelsePlot {
  id: number
  plotName?: string | null
}

export interface BestemmelseField {
  id: number
  fieldName: string
  plots: BestemmelsePlot[]
  formal_1?: string
  formal_2?: string
}

export interface HensynssoneOption {
  kode: number
  navn: string
}

export interface BestemmelseScope {
  fieldId: number
  fieldName?: string
  plotId: number | null
  plotName?: string | null
}

export interface GalleriItemRef {
  id: number  // bestemmelse_galleri junction table ID
  tema_tittel_galleri_id: number
  forklaring?: string | null
  overskrift: string
  bildefilnavn?: string | null
  forklaringstekst?: string | null
  sortering: number
}

export interface BestemmelseTitle {
  id: number
  label: string
}

export interface BestemmelseCategory {
  id: number
  name: string
  titles: BestemmelseTitle[]
}

export interface BestemmelseItem {
  id: number
  titleId: number | null
  titleLabel?: string | null
  hensynssoneKode?: number | null
  hensynssoneNavn?: string | null
  content: string
  sortering: number
  scope: BestemmelseScope[]
  buildingTypeCodes: string[]
  galleriItems: GalleriItemRef[]
}

export interface BestemmelseUpdate {
  titleId: number | null
  hensynssoneKode: number | null
  content: string
  sortering: number
  scope: Array<{
    fieldId: number
    plotId: number | null
  }>
  buildingTypeCodes: string[]
  galleriItemIds: number[]
}

export interface BestemmelseFilterState {
  formal1Values: string[]
  fieldIds: number[]
  plotIds: number[]
  buildingTypes: string[]
}

export const EMPTY_BESTEMMELSE_FILTER: BestemmelseFilterState = {
  formal1Values: [],
  fieldIds: [],
  plotIds: [],
  buildingTypes: [],
}
