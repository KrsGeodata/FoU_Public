import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { updatePlan, type EditableField } from '../../../../api/adminApi'
import { DeleteReguleringsplanButton } from './DeleteReguleringsplan'
import { PlanFieldAreasEditor } from './PlanFieldAreasEditor'
import { PlanInfoFormSection } from './PlanInfoFormSection'
import type { LocalField, PlanInfoValues } from './planinfo-types'
import './PlaninformasjonEditorSection.css'

const EMPTY_VALUES: PlanInfoValues = {
  planId: '',
  name: '',
  adoptedDate: '',
  mapUrl: '',
  regulationsUrl: '',
  descriptionUrl: '',
}

interface Props {
  initialValues?: PlanInfoValues
  initialFields?: LocalField[]
  onSave?: (values: PlanInfoValues) => void
  onDelete?: (planId: string) => void
  readOnly?: boolean
}

export function PlaninformasjonEditorSection({
  initialValues,
  initialFields = [],
  onSave,
  onDelete,
  readOnly = false,
}: Props) {
  const { planId: routePlanId } = useParams<{ planId: string }>()
  const [step, setStep] = useState<'planInfo' | 'fields'>('planInfo')
  const [values, setValues] = useState<PlanInfoValues>(initialValues ?? EMPTY_VALUES)
  const [fields, setFields] = useState<LocalField[]>(initialFields)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues)
    }
  }, [initialValues])

  useEffect(() => {
    if (initialFields && initialFields.length > 0) {
      setFields(initialFields)
    }
  }, [initialFields])

  const toEditableFields = (items: LocalField[]): EditableField[] =>
    items.map(field => ({
      id: field.id,
      name: field.name,
      plots: field.plots,
      formal_1: field.formal_1,
      formal_2: field.formal_2,
    }))

  const handleSave = async () => {
    if (saving) return

    setSaving(true)
    try {
      if (onSave) {
        await onSave(values)
        return
      }

      const numericPlanId = Number(routePlanId)
      if (!numericPlanId || Number.isNaN(numericPlanId)) return

      await updatePlan(numericPlanId, {
        planId: values.planId,
        mapUrl: values.mapUrl,
        regulationsUrl: values.regulationsUrl,
        descriptionUrl: values.descriptionUrl,
        fields: toEditableFields(fields),
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    onDelete?.(values.planId)
  }

  return (
    <section className="epi-root" aria-label="Planinformasjon editor">
      {step === 'planInfo' ? (
        <>
          <span className="epi-step-chip">Steg 1 av 2 · Planinformasjon</span>
          <PlanInfoFormSection values={values} onChange={setValues} onShowFields={() => setStep('fields')} readOnly={readOnly} />

          {!readOnly && (
            <div className="epi-actions">
              <button type="button" className="epi-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Lagrer…' : 'Lagre'}
              </button>
              <DeleteReguleringsplanButton
                planName={values.name}
                onConfirmDelete={onDelete ? handleDelete : undefined}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <span className="epi-step-chip">Steg 2 av 2 · Felt og delområder</span>
          <button type="button" className="epi-back-btn" onClick={() => setStep('planInfo')}>
            <ArrowLeft size={16} />
            Tilbake til planinformasjon
          </button>
          <PlanFieldAreasEditor fields={fields} onChange={setFields} readOnly={readOnly} />

          {!readOnly && (
            <div className="epi-actions">
              <button type="button" className="epi-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Lagrer…' : 'Lagre'}
              </button>
              <DeleteReguleringsplanButton
                planName={values.name}
                onConfirmDelete={onDelete ? handleDelete : undefined}
              />
            </div>
          )}
        </>
      )}
    </section>
  )
}
