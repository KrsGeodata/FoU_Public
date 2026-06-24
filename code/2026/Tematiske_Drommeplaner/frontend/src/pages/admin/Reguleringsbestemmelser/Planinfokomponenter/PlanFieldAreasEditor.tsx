import { useEffect, useState } from 'react'
import { Home, Plus, Trash2, ChevronDown } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { getPlan, getFormalCodes, type FormalCodeOption } from '../../../../api/adminApi'
import type { LocalField } from './planinfo-types'
import './PlanFieldAreasEditor.css'

interface Props {
  initialFields?: LocalField[]
  fields?: LocalField[]
  onChange?: (fields: LocalField[]) => void
  readOnly?: boolean
}

export function PlanFieldAreasEditor({
  initialFields = [],
  fields,
  onChange,
  readOnly = false,
}: Props) {
  const { planId } = useParams<{ planId: string }>()
  const [nextId, setNextId] = useState(1000)
  const [localFields, setLocalFields] = useState<LocalField[]>(initialFields)
  const [formalCodes, setFormalCodes] = useState<FormalCodeOption[]>([])
  const [showFormal1Menu, setShowFormal1Menu] = useState<number | null>(null)
  const [showFormal2Menu, setShowFormal2Menu] = useState<number | null>(null)

  const resolvedFields = fields ?? localFields

  useEffect(() => {
    const loadFormalCodes = async () => {
      try {
        const codes = await getFormalCodes()
        setFormalCodes(codes)
      } catch (error) {
        console.error('Failed to load formal codes:', error)
      }
    }

    loadFormalCodes()
  }, [])

  useEffect(() => {
    if (fields !== undefined || initialFields.length > 0) return

    const numericPlanId = Number(planId)
    if (!numericPlanId || Number.isNaN(numericPlanId)) return

    getPlan(numericPlanId)
      .then(data => {
        setLocalFields(
          data.fields.map(field => ({
            id: field.id,
            name: field.fieldName,
            plots: field.plots.map(plot => plot.plotName ?? ''),
            formal_1: field.formal_1,
            formal_2: field.formal_2,
          })),
        )
      })
      .catch(() => undefined)
  }, [fields, initialFields.length, planId])

  const setFields = (next: LocalField[]) => {
    setLocalFields(next)
    onChange?.(next)
  }

  const update = (fieldId: number, updater: (field: LocalField) => LocalField) => {
    setFields(resolvedFields.map(field => (field.id === fieldId ? updater(field) : field)))
  }

  const getFormal2Options = (formal1: string): string[] => {
    const found = formalCodes.find(code => code.formal_1 === formal1)
    return found?.formal_2_options ?? []
  }

  return (
    <section className="epf-root" aria-label="Felt og delområder">
      <div className="epf-header">
        <span className="epf-title">Felt / Delområder</span>
      </div>

      {resolvedFields.length === 0 && <p className="epf-empty">Ingen felt lagt til ennå.</p>}

      <div className="epf-list">
        {resolvedFields.map((field, fieldIndex) => (
          <article key={field.id} className="epf-card">
            <div className="epf-card__header">
              <input
                className="epf-card__name"
                type="text"
                placeholder="Navn på felt (f.eks. B1, BKS1)"
                value={field.name}
                onChange={event =>
                  update(field.id, current => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                disabled={readOnly}
              />
              {!readOnly && (
                <button
                  type="button"
                  className="epf-icon-btn"
                  onClick={() => setFields(resolvedFields.filter(item => item.id !== field.id))}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            {/* Formål selector with display values */}
            <div className="epf-formal-section">
              <div className="epf-formal-group">
                <label className="epf-label">Formål (nivå 1)</label>
                <div className="epf-input-wrapper">
                  <input
                    type="text"
                    className="epf-formal-input"
                    value={field.formal_1 || ''}
                    readOnly
                    onClick={() => !readOnly && setShowFormal1Menu(showFormal1Menu === field.id ? null : field.id)}
                    style={{ cursor: readOnly ? 'default' : 'pointer' }}
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <button
                      type="button"
                      className="epf-dropdown-trigger"
                      onClick={() => setShowFormal1Menu(showFormal1Menu === field.id ? null : field.id)}
                    >
                      <ChevronDown size={16} />
                    </button>
                  )}
                </div>
                {showFormal1Menu === field.id && (
                  <div className="epf-dropdown-menu">
                    {formalCodes.map(code => (
                      <button
                        key={code.formal_1}
                        type="button"
                        className="epf-dropdown-item"
                        onClick={() => {
                          update(field.id, current => ({ ...current, formal_1: code.formal_1, formal_2: undefined }))
                          setShowFormal1Menu(null)
                        }}
                      >
                        {code.formal_1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="epf-formal-group">
                <label className="epf-label">Formål (nivå 2)</label>
                <div className="epf-input-wrapper">
                  <input
                    type="text"
                    className="epf-formal-input"
                    value={field.formal_2 || ''}
                    readOnly
                    placeholder={field.formal_1 ? 'Velg formål 2' : 'Velg formål 1 først'}
                    onClick={() => !readOnly && field.formal_1 && setShowFormal2Menu(showFormal2Menu === field.id ? null : field.id)}
                    style={{ cursor: readOnly ? 'default' : field.formal_1 ? 'pointer' : 'not-allowed' }}
                    disabled={readOnly}
                  />
                  {!readOnly && field.formal_1 && (
                    <button
                      type="button"
                      className="epf-dropdown-trigger"
                      onClick={() => setShowFormal2Menu(showFormal2Menu === field.id ? null : field.id)}
                    >
                      <ChevronDown size={16} />
                    </button>
                  )}
                </div>
                {showFormal2Menu === field.id && field.formal_1 && (
                  <div className="epf-dropdown-menu">
                    {getFormal2Options(field.formal_1).map(option => (
                      <button
                        key={option}
                        type="button"
                        className="epf-dropdown-item"
                        onClick={() => {
                          update(field.id, current => ({ ...current, formal_2: option }))
                          setShowFormal2Menu(null)
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {field.plots.length > 0 && (
              <div className="epf-plots">
                {field.plots.map((plot, plotIndex) => (
                  <div key={plotIndex} className="epf-plot-row">
                    <Home size={13} className="epf-plot-row__icon" />
                    <input
                      className="epf-plot-row__input"
                      type="text"
                      placeholder={`Tomt ${fieldIndex + 1}.${plotIndex + 1}`}
                      value={plot}
                      onChange={event =>
                        update(field.id, current => {
                          const nextPlots = [...current.plots]
                          nextPlots[plotIndex] = event.target.value
                          return { ...current, plots: nextPlots }
                        })
                      }
                      disabled={readOnly}
                    />
                    {!readOnly && (
                      <button
                        type="button"
                        className="epf-icon-btn epf-icon-btn--light"
                        onClick={() =>
                          update(field.id, current => ({
                            ...current,
                            plots: current.plots.filter((_, i) => i !== plotIndex),
                          }))
                        }
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!readOnly && (
              <button
                type="button"
                className="epf-secondary-btn"
                onClick={() => update(field.id, current => ({ ...current, plots: [...current.plots, ''] }))}
              >
                <Plus size={13} />
                Legg til tomt
              </button>
            )}
          </article>
        ))}
      </div>

      {!readOnly && (
        <button
          type="button"
          className="epf-primary-btn"
          onClick={() => {
            setFields([...resolvedFields, { id: nextId, name: '', plots: [] }])
            setNextId(value => value + 1)
          }}
        >
          <Plus size={15} />
          Legg til felt
        </button>
      )}
    </section>
  )
}
