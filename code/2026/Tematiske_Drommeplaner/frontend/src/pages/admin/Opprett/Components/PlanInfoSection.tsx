import { ReactNode, useEffect, useState } from 'react'
import { searchPlanregister, type PlanSuggestion } from '../../../../api/adminApi'
import './PlanInfoSection.css'

interface PlanInfoValues {
  planId: string
  name: string
  adoptedDate: string
  mapUrl: string
  regulationsUrl: string
  descriptionUrl: string
}

const INPUTS: Array<{ key: keyof PlanInfoValues; label: string; type: 'text' | 'date' | 'url'; hint?: string; short?: boolean }> = [
  { key: 'planId', label: 'Plan-ID', type: 'text', hint: 'Uten kommunenummer', short: true },
  { key: 'name', label: 'Navn', type: 'text' },
  { key: 'adoptedDate', label: 'Vedtatt dato', type: 'date', short: true },
  { key: 'mapUrl', label: 'Lenke til plankart', type: 'url', hint: 'Fortrinnsvis digitalt plankart' },
  { key: 'regulationsUrl', label: 'Lenke til gjeldende bestemmelser', type: 'url' },
  { key: 'descriptionUrl', label: 'Lenke til planbeskrivelse', type: 'url' },
]

interface Props {
  values?: PlanInfoValues
  onChange?: (values: PlanInfoValues) => void
  suggestions?: Array<{ plan_id: string; name: string; adopted_date: string | null }>
  onPlanIdInput?: (value: string) => void
  onShowFields?: () => void
  primaryAction?: ReactNode
}

export function PlanInfoSection({ values, onChange, suggestions = [], onPlanIdInput, onShowFields, primaryAction }: Props) {
  const [internalValues, setInternalValues] = useState<PlanInfoValues>({
    planId: '',
    name: '',
    adoptedDate: '',
    mapUrl: '',
    regulationsUrl: '',
    descriptionUrl: '',
  })
  const [internalSuggestions, setInternalSuggestions] = useState<PlanSuggestion[]>([])

  const resolvedValues = values ?? internalValues
  const resolvedSuggestions = suggestions.length > 0 ? suggestions : internalSuggestions

  const setValues = (next: PlanInfoValues) => {
    if (onChange) onChange(next)
    else setInternalValues(next)
  }

  useEffect(() => {
    if (suggestions.length > 0) return
    const q = resolvedValues.planId.trim()
    if (q.length < 1) {
      setInternalSuggestions([])
      return
    }

    let active = true
    const timer = setTimeout(() => {
      searchPlanregister(q)
        .then(rows => {
          if (active) setInternalSuggestions(rows)
        })
        .catch(() => {
          if (active) setInternalSuggestions([])
        })
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [resolvedValues.planId, suggestions.length])

  useEffect(() => {
    const match = resolvedSuggestions.find(item => item.plan_id === resolvedValues.planId.trim())
    if (!match) return
    const nextDate = match.adopted_date ? match.adopted_date.slice(0, 10) : ''
    if (resolvedValues.name === match.name && resolvedValues.adoptedDate === nextDate) return

    setValues({
      ...resolvedValues,
      name: match.name,
      adoptedDate: nextDate,
    })
  }, [resolvedSuggestions, resolvedValues])

  return (
    <section className="pis-root" aria-label="Planinformasjon">
      {INPUTS.map(({ key, label, type, hint, short }) => (
        <div key={key} className="pis-field">
          <label className="pis-label" htmlFor={`create-${key}`}>{label}</label>
          {hint && <span className="pis-hint">{hint}</span>}
          <input
            id={`create-${key}`}
            className={`pis-input${short ? ' pis-input--short' : ''}`}
            type={type}
            value={resolvedValues[key]}
            list={key === 'planId' ? 'plan-id-suggestions' : undefined}
            onChange={event => {
              const next = { ...resolvedValues, [key]: event.target.value }
              setValues(next)
              if (key === 'planId') {
                onPlanIdInput?.(event.target.value)
              }
            }}
          />
        </div>
      ))}

      <datalist id="plan-id-suggestions">
        {resolvedSuggestions.map(item => (
          <option key={item.plan_id} value={item.plan_id}>
            {item.name}
          </option>
        ))}
      </datalist>

      {(primaryAction || onShowFields) && (
        <div className="pis-actions">
          {onShowFields && (
            <button type="button" className="pis-next-btn" onClick={onShowFields}>
              Legg til felt / delområder (valgfritt)
            </button>
          )}
          {primaryAction}
        </div>
      )}
    </section>
  )
}
