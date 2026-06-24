import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Link as LinkIcon } from 'lucide-react'
import { getPlan } from '../../../../api/adminApi'
import type { PlanInfoValues } from './planinfo-types'
import './PlanInfoFormSection.css'

const INPUTS: Array<{
  key: keyof PlanInfoValues
  label: string
  type: 'text' | 'date' | 'url'
  hint?: string
  short?: boolean
}> = [
  { key: 'planId', label: 'Plan-ID', type: 'text', hint: 'Uten kommunenummer', short: true },
  { key: 'name', label: 'Navn', type: 'text' },
  { key: 'adoptedDate', label: 'Vedtatt dato', type: 'date', short: true },
  { key: 'mapUrl', label: 'Lenke til plankart', type: 'url', hint: 'Fortrinnsvis digitalt plankart' },
  { key: 'regulationsUrl', label: 'Lenke til gjeldende bestemmelser', type: 'url' },
  { key: 'descriptionUrl', label: 'Lenke til planbeskrivelse', type: 'url' },
]

interface Props {
  values: PlanInfoValues
  onChange: (values: PlanInfoValues) => void
  onShowFields: () => void
  readOnly?: boolean
}

export function PlanInfoFormSection({ values, onChange, onShowFields, readOnly = false }: Props) {
  const { planId } = useParams<{ planId: string }>()

  useEffect(() => {
    if (values.planId.trim()) return

    const numericPlanId = Number(planId)
    if (!numericPlanId || Number.isNaN(numericPlanId)) return

    getPlan(numericPlanId)
      .then(data => {
        onChange({
          planId: data.planId,
          name: data.name,
          adoptedDate: data.adoptedDate ? data.adoptedDate.slice(0, 10) : '',
          mapUrl: data.mapUrl ?? '',
          regulationsUrl: data.regulationsUrl ?? '',
          descriptionUrl: data.descriptionUrl ?? '',
        })
      })
      .catch(() => undefined)
  }, [planId, values.planId, onChange])

  const openUrl = (rawUrl: string) => {
    const trimmed = rawUrl.trim()
    if (!trimmed) return
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    window.open(withProtocol, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="epi-form" aria-label="Planinformasjon">
      {INPUTS.map(({ key, label, type, hint, short }) => (
        <div key={key} className="epi-form__field">
          <label className="epi-form__label" htmlFor={`edit-${key}`}>
            {label}
          </label>
          {hint && <span className="epi-form__hint">{hint}</span>}
          {type === 'url' ? (
            <div className="epi-form__url-wrap">
              <input
                id={`edit-${key}`}
                className={`epi-form__input epi-form__input--url${short ? ' epi-form__input--short' : ''}`}
                type={type}
                value={values[key]}
                onChange={event => onChange({ ...values, [key]: event.target.value })}
                disabled={readOnly}
              />
              <button
                type="button"
                className="epi-form__url-link"
                aria-label={`Åpne ${label}`}
                title="Åpne lenke"
                onClick={() => openUrl(String(values[key] ?? ''))}
                disabled={!String(values[key] ?? '').trim()}
              >
                <LinkIcon size={16} />
              </button>
            </div>
          ) : (
            <input
              id={`edit-${key}`}
              className={`epi-form__input${short ? ' epi-form__input--short' : ''}`}
              type={type}
              value={values[key]}
              onChange={event => onChange({ ...values, [key]: event.target.value })}
              disabled={readOnly}
            />
          )}
        </div>
      ))}

      <button type="button" className="epi-form__next-btn" onClick={onShowFields}>
        {readOnly ? 'Se felt / delområder' : 'Rediger felt / delområder'}
      </button>
    </section>
  )
}
