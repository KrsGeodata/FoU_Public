import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createPlan,
  searchPlanregister,
  type PlanSuggestion,
} from '../../../../api/adminApi'
import type { LocalField } from './FieldAreasSection'

export interface PlanInfoValues {
  planId: string
  name: string
  adoptedDate: string
  mapUrl: string
  regulationsUrl: string
  descriptionUrl: string
}

const EMPTY_VALUES: PlanInfoValues = {
  planId: '',
  name: '',
  adoptedDate: '',
  mapUrl: '',
  regulationsUrl: '',
  descriptionUrl: '',
}

export function useCreateReguleringsplanWorkflow() {
  const navigate = useNavigate()
  const [values, setValues] = useState<PlanInfoValues>(EMPTY_VALUES)
  const [fields, setFields] = useState<LocalField[]>([])
  const [planSuggestions, setPlanSuggestions] = useState<PlanSuggestion[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const q = values.planId.trim()
    if (q.length < 2) {
      setPlanSuggestions([])
      return
    }

    const timer = setTimeout(() => {
      searchPlanregister(q)
        .then(rows => {
          if (active) setPlanSuggestions(rows)
        })
        .catch(() => {
          if (active) setPlanSuggestions([])
        })
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [values.planId])

  useEffect(() => {
    const match = planSuggestions.find(item => item.plan_id === values.planId.trim())
    if (!match) return

    setValues(prev => ({
      ...prev,
      name: match.name,
      adoptedDate: match.adopted_date ? match.adopted_date.slice(0, 10) : '',
    }))
  }, [planSuggestions, values.planId])

  const primaryActionLabel = useMemo(() => (saving ? 'Oppretter…' : 'Opprett'), [saving])

  const submit = async () => {
    setError(null)
    if (!values.planId.trim()) {
      setError('Plan-ID må fylles ut')
      return
    }

    setSaving(true)
    try {
      const created = await createPlan({
        planId: values.planId.trim(),
        mapUrl: values.mapUrl,
        regulationsUrl: values.regulationsUrl,
        descriptionUrl: values.descriptionUrl,
        fields,
      })
      navigate(`/reguleringsplaner/plan/${created.id}/bestemmelser`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kunne ikke opprette plan')
    } finally {
      setSaving(false)
    }
  }

  return {
    values,
    setValues,
    fields,
    setFields,
    planSuggestions,
    saving,
    error,
    primaryActionLabel,
    submit,
  }
}
