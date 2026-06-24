export interface PlanInfoValues {
  planId: string
  name: string
  adoptedDate: string
  mapUrl: string
  regulationsUrl: string
  descriptionUrl: string
}

export interface LocalField {
  id: number
  name: string
  plots: string[]
  formal_1?: string
  formal_2?: string
}
