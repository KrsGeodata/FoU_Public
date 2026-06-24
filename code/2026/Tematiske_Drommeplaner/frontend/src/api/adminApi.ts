import type {
  BestemmelseCategory,
  BestemmelseField,
  BestemmelseItem,
  BestemmelseUpdate,
  BuildingTypeOption,
} from '../pages/admin/Reguleringsbestemmelser/Bestemmelseskomponenter/bestemmelse-types'

const API_BASE = import.meta.env.VITE_API_BASE
  ?? (import.meta.env.DEV ? '/api' : '/mikro-drommeplan/api')

export interface PlanListItem {
  id: number
  plan_id: string
  name: string
  adopted_date: string | null
  field_count: number
  plot_count: number
  updated_at: string
}

export interface PlanSuggestion {
  id: number
  plan_id: string
  name: string
  adopted_date: string | null
}

export interface HensynssoneOption {
  kode: number
  navn: string
}

export interface FormalCodeOption {
  formal_1: string
  formal_2_options: string[]
}

export interface EditableField {
  id: number
  name: string
  plots: string[]
  formal_1?: string
  formal_2?: string
}

export interface PlanDetail {
  id: number
  planId: string
  name: string
  adoptedDate: string | null
  mapUrl: string | null
  regulationsUrl: string | null
  descriptionUrl: string | null
  fields: BestemmelseField[]
  categories: BestemmelseCategory[]
  buildingTypes: BuildingTypeOption[]
  hensynssoner: HensynssoneOption[]
  bestemmelser: BestemmelseItem[]
}

interface PlanSavePayload {
  plan_id: string
  map_url: string | null
  regulations_url: string | null
  description_url: string | null
  fields: Array<{
    name: string
    plots: Array<{ name: string }>
    formal_1?: string | null
    formal_2?: string | null
  }>
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
    ...init,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed (${res.status})`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

export function listPlans() {
  return request<PlanListItem[]>(`${API_BASE}/plans`)
}

export function searchPlanregister(query: string) {
  const params = new URLSearchParams({ q: query, limit: '10' })
  return request<PlanSuggestion[]>(`${API_BASE}/planregister/search?${params.toString()}`)
}

export function listHensynssoner() {
  return request<HensynssoneOption[]>(`${API_BASE}/hensynssoner`)
}

export function getFormalCodes() {
  return request<FormalCodeOption[]>(`${API_BASE}/formalkoder`)
}

function toPlanSavePayload(data: {
  planId: string
  mapUrl: string
  regulationsUrl: string
  descriptionUrl: string
  fields: EditableField[]
}): PlanSavePayload {
  return {
    plan_id: data.planId,
    map_url: data.mapUrl.trim() || null,
    regulations_url: data.regulationsUrl.trim() || null,
    description_url: data.descriptionUrl.trim() || null,
    fields: data.fields.map(field => ({
      name: field.name,
      plots: field.plots
        .map(plot => plot.trim())
        .filter(Boolean)
        .map(name => ({ name })),
      formal_1: field.formal_1 || null,
      formal_2: field.formal_2 || null,
    })),
  }
}

export function createPlan(data: {
  planId: string
  mapUrl: string
  regulationsUrl: string
  descriptionUrl: string
  fields: EditableField[]
}) {
  return request<PlanDetail>(`${API_BASE}/plans`, {
    method: 'POST',
    body: JSON.stringify(toPlanSavePayload(data)),
  })
}

export function getPlan(planId: number) {
  return request<PlanDetail>(`${API_BASE}/plans/${planId}`)
}

export function updatePlan(
  planId: number,
  data: {
    planId: string
    mapUrl: string
    regulationsUrl: string
    descriptionUrl: string
    fields: EditableField[]
  },
) {
  return request<PlanDetail>(`${API_BASE}/plans/${planId}`, {
    method: 'PUT',
    body: JSON.stringify(toPlanSavePayload(data)),
  })
}

export function deletePlan(planId: number) {
  return request<{ ok: boolean }>(`${API_BASE}/plans/${planId}`, {
    method: 'DELETE',
  })
}

export function createBestemmelse(planId: number, payload: BestemmelseUpdate) {
  return request<BestemmelseItem>(`${API_BASE}/plans/${planId}/bestemmelser`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateBestemmelse(bestemmelseId: number, payload: BestemmelseUpdate) {
  return request<BestemmelseItem>(`${API_BASE}/bestemmelser/${bestemmelseId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteBestemmelse(bestemmelseId: number) {
  return request<{ ok: boolean }>(`${API_BASE}/bestemmelser/${bestemmelseId}`, {
    method: 'DELETE',
  })
}