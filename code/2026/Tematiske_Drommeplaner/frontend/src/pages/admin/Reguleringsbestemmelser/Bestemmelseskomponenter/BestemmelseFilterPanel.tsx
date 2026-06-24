import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { getPlan, type PlanDetail } from '../../../../api/adminApi'
import './BestemmelseFilterPanel.css'
import type {
  BestemmelseField,
  BestemmelseFilterState,
  BuildingTypeOption,
} from './bestemmelse-types'

interface Props {
  fields: BestemmelseField[]
  buildingTypes: BuildingTypeOption[]
  filter: BestemmelseFilterState
  onChange: (filter: BestemmelseFilterState) => void
}

export function BestemmelseFilterPanel({ fields, buildingTypes, filter, onChange }: Props) {
  const { planId } = useParams<{ planId: string }>()
  const [expandedFormalGroups, setExpandedFormalGroups] = useState<Set<string>>(new Set())
  const [expandedFields, setExpandedFields] = useState<Set<number>>(new Set())
  const [loaded, setLoaded] = useState<PlanDetail | null>(null)

  useEffect(() => {
    if (fields.length > 0 || buildingTypes.length > 0) return

    const numericPlanId = Number(planId)
    if (!numericPlanId || Number.isNaN(numericPlanId)) return

    getPlan(numericPlanId)
      .then(setLoaded)
      .catch(() => setLoaded(null))
  }, [fields.length, buildingTypes.length, planId])

  const resolvedFields = fields.length > 0 ? fields : loaded?.fields ?? []
  const resolvedBuildingTypes =
    buildingTypes.length > 0 ? buildingTypes : loaded?.buildingTypes ?? []

  // Get unique formal_1 values that have at least one field
  const formalGroups = Array.from(
    new Set(resolvedFields.filter(f => f.formal_1).map(f => f.formal_1 as string)),
  ).sort()

  // Get fields for a specific formal_1
  const getFieldsForFormal1 = (formal1: string) =>
    resolvedFields.filter(f => f.formal_1 === formal1) as BestemmelseField[]

  const toggleExpandFormal = (formal1: string) => {
    setExpandedFormalGroups(previous => {
      const next = new Set(previous)
      next.has(formal1) ? next.delete(formal1) : next.add(formal1)
      return next
    })
  }

  const toggleExpandField = (fieldId: number) => {
    setExpandedFields(previous => {
      const next = new Set(previous)
      next.has(fieldId) ? next.delete(fieldId) : next.add(fieldId)
      return next
    })
  }

  const isFieldChecked = (field: BestemmelseField) => {
    if (field.plots.length === 0) return filter.fieldIds.includes(field.id)
    return field.plots.every(plot => filter.plotIds.includes(plot.id))
  }

  const isFieldIndeterminate = (field: BestemmelseField) =>
    field.plots.some(plot => filter.plotIds.includes(plot.id)) && !isFieldChecked(field)

  const toggleField = (field: BestemmelseField) => {
    if (field.plots.length === 0) {
      onChange({
        ...filter,
        fieldIds: filter.fieldIds.includes(field.id)
          ? filter.fieldIds.filter(id => id !== field.id)
          : [...filter.fieldIds, field.id],
      })
      return
    }

    const plotIds = field.plots.map(plot => plot.id)

    if (isFieldChecked(field) || isFieldIndeterminate(field)) {
      onChange({
        ...filter,
        fieldIds: filter.fieldIds.filter(id => id !== field.id),
        plotIds: filter.plotIds.filter(id => !plotIds.includes(id)),
      })
      return
    }

    onChange({
      ...filter,
      fieldIds: [...filter.fieldIds.filter(id => id !== field.id), field.id],
      plotIds: [...filter.plotIds.filter(id => !plotIds.includes(id)), ...plotIds],
    })
  }

  const togglePlot = (fieldId: number, plotId: number) => {
    const allFieldPlotIds =
      resolvedFields.find(field => field.id === fieldId)?.plots.map(plot => plot.id) ?? []

    if (filter.plotIds.includes(plotId)) {
      const nextPlotIds = filter.plotIds.filter(id => id !== plotId)
      const anyLeft = allFieldPlotIds.some(id => nextPlotIds.includes(id))
      onChange({
        ...filter,
        fieldIds: anyLeft ? filter.fieldIds : filter.fieldIds.filter(id => id !== fieldId),
        plotIds: nextPlotIds,
      })
      return
    }

    onChange({
      ...filter,
      fieldIds: filter.fieldIds.includes(fieldId) ? filter.fieldIds : [...filter.fieldIds, fieldId],
      plotIds: [...filter.plotIds, plotId],
    })
  }

  const toggleFormal1 = (formal1: string) => {
    const fieldsInGroup = getFieldsForFormal1(formal1)
    const fieldIdsInGroup = fieldsInGroup.map(f => f.id)
    const allPlotsInGroup = fieldsInGroup.flatMap(f => f.plots.map(p => p.id))

    // Check if all fields in group are selected
    const allSelected = fieldIdsInGroup.every(fId => filter.fieldIds.includes(fId))

    if (allSelected) {
      // Deselect all fields and plots in group
      onChange({
        ...filter,
        fieldIds: filter.fieldIds.filter(id => !fieldIdsInGroup.includes(id)),
        plotIds: filter.plotIds.filter(id => !allPlotsInGroup.includes(id)),
      })
    } else {
      // Select all fields and plots in group
      onChange({
        ...filter,
        fieldIds: Array.from(new Set([...filter.fieldIds, ...fieldIdsInGroup])),
        plotIds: Array.from(new Set([...filter.plotIds, ...allPlotsInGroup])),
      })
    }
  }

  const reset = () => onChange({ formal1Values: [], fieldIds: [], plotIds: [], buildingTypes: [] })

  return (
    <aside className="bfp-root">
      <div className="bfp-header">
        <h2 className="bfp-title">Filtrer</h2>
        <button type="button" className="bfp-reset" onClick={reset}>
          Nullstill
        </button>
      </div>

      <section className="bfp-section">
        <h3 className="bfp-section-title">Relevant for:</h3>
        <div className="bfp-check-group">
          <label className="bfp-check">
            <input
              type="checkbox"
              checked={filter.buildingTypes.length === 0}
              onChange={() => onChange({ ...filter, buildingTypes: [] })}
            />
            Alle typer
          </label>

          {resolvedBuildingTypes.map(type => (
            <label key={type.code} className="bfp-check">
              <input
                type="checkbox"
                checked={filter.buildingTypes.includes(type.code)}
                onChange={() => {
                  const has = filter.buildingTypes.includes(type.code)
                  const next = has
                    ? filter.buildingTypes.filter(code => code !== type.code)
                    : [...filter.buildingTypes, type.code]
                  const allSelected =
                    resolvedBuildingTypes.length > 0 &&
                    resolvedBuildingTypes.every(item => next.includes(item.code))
                  onChange({ ...filter, buildingTypes: allSelected ? [] : next })
                }}
              />
              {type.name}
            </label>
          ))}
        </div>
      </section>

      {formalGroups.length > 0 && (
        <section className="bfp-section">
          <h3 className="bfp-section-title">FELT / TOMT</h3>
          <div className="bfp-tree">
            {formalGroups.map(formal1 => {
              const isExpanded = expandedFormalGroups.has(formal1)
              const fieldsInGroup = getFieldsForFormal1(formal1)
              const fieldIdsInGroup = fieldsInGroup.map(f => f.id)
              const allFieldsInGroupSelected = fieldIdsInGroup.every(fId => filter.fieldIds.includes(fId))
              const someFormalFieldsSelected = fieldIdsInGroup.some(fId => filter.fieldIds.includes(fId))

              return (
                <div key={formal1} className="bfp-formal-group">
                  <div className="bfp-formal-row">
                    <button
                      type="button"
                      className={`bfp-chevron${isExpanded ? ' bfp-chevron--open' : ''}`}
                      onClick={() => toggleExpandFormal(formal1)}
                      aria-label={isExpanded ? 'Skjul felt' : 'Vis felt'}
                    >
                      <ChevronRight size={14} />
                    </button>

                    <label className="bfp-formal-label">
                      <input
                        type="checkbox"
                        checked={allFieldsInGroupSelected}
                        ref={element => {
                          if (element) element.indeterminate = someFormalFieldsSelected && !allFieldsInGroupSelected
                        }}
                        onChange={() => toggleFormal1(formal1)}
                      />
                      {formal1}
                    </label>
                  </div>

                  {isExpanded && fieldsInGroup.length > 0 && (
                    <div className="bfp-formal-fields">
                      {fieldsInGroup.map(field => {
                        const isFieldExpanded = expandedFields.has(field.id)
                        return (
                          <div key={field.id} className="bfp-field-nested">
                            <div className="bfp-field-row">
                              <button
                                type="button"
                                className={`bfp-chevron${isFieldExpanded ? ' bfp-chevron--open' : ''}`}
                                onClick={() => toggleExpandField(field.id)}
                                aria-label={isFieldExpanded ? 'Skjul tomter' : 'Vis tomter'}
                                disabled={field.plots.length === 0}
                              >
                                <ChevronRight size={14} />
                              </button>

                              <label className="bfp-field-label">
                                <input
                                  type="checkbox"
                                  checked={isFieldChecked(field)}
                                  ref={element => {
                                    if (element) element.indeterminate = isFieldIndeterminate(field)
                                  }}
                                  onChange={() => toggleField(field)}
                                />
                                {field.fieldName}
                              </label>
                            </div>

                            {isFieldExpanded && field.plots.length > 0 && (
                              <div className="bfp-plots">
                                {field.plots.map(plot => (
                                  <label key={plot.id} className="bfp-plot-label">
                                    <input
                                      type="checkbox"
                                      checked={filter.plotIds.includes(plot.id)}
                                      onChange={() => togglePlot(field.id, plot.id)}
                                    />
                                    {plot.plotName ?? `Tomt #${plot.id}`}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </aside>
  )
}
