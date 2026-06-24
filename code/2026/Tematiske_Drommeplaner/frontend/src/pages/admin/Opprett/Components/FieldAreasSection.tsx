import { useState, useEffect } from 'react'
import { Home, Plus, Trash2, ChevronDown } from 'lucide-react'
import { getFormalCodes, type FormalCodeOption } from '../../../../api/adminApi'
import './FieldAreasSection.css'

export interface LocalField {
  id: number
  name: string
  plots: string[]
  formal_1?: string
  formal_2?: string
}

interface Props {
  fields?: LocalField[]
  onChange?: (fields: LocalField[]) => void
}

export function FieldAreasSection({ fields, onChange }: Props) {
  const [internalFields, setInternalFields] = useState<LocalField[]>([])
  const [nextId, setNextId] = useState(1)
  const [formalCodes, setFormalCodes] = useState<FormalCodeOption[]>([])
  const [showFormal1Menu, setShowFormal1Menu] = useState<number | null>(null)
  const [showFormal2Menu, setShowFormal2Menu] = useState<number | null>(null)

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

  const resolvedFields = fields ?? internalFields

  const applyChange = (next: LocalField[]) => {
    if (onChange) onChange(next)
    else setInternalFields(next)
  }

  const update = (fieldId: number, updater: (field: LocalField) => LocalField) => {
    applyChange(resolvedFields.map(field => field.id === fieldId ? updater(field) : field))
  }

  const getFormal2Options = (formal1: string): string[] => {
    const found = formalCodes.find(code => code.formal_1 === formal1)
    return found?.formal_2_options ?? []
  }

  return (
    <section className="fas-root" aria-label="Felt og delområder">
      <div className="fas-header">
        <span className="fas-title">Felt / Delområder</span>
        <span className="fas-hint">Valgfritt – kan legges til senere</span>
      </div>

      {resolvedFields.length === 0 && <p className="fas-empty">Ingen felt lagt til ennå.</p>}

      <div className="fas-list">
        {resolvedFields.map((field, fieldIndex) => (
          <article key={field.id} className="fas-card">
            <div className="fas-card__header">
              <input
                className="fas-card__name"
                type="text"
                placeholder="Navn på felt (f.eks. B1, BKS1)"
                value={field.name}
                onChange={event => update(field.id, current => ({ ...current, name: event.target.value }))}
              />
              <button
                type="button"
                className="fas-icon-btn"
                onClick={() => applyChange(resolvedFields.filter(item => item.id !== field.id))}
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Formål selector */}
            <div className="fas-formal-section">
              <div className="fas-formal-group">
                <label className="fas-label">Formål (nivå 1)</label>
                <button
                  type="button"
                  className="fas-dropdown-btn"
                  onClick={() => setShowFormal1Menu(showFormal1Menu === field.id ? null : field.id)}
                >
                  <span>{field.formal_1 || 'Velg formål 1'}</span>
                  <ChevronDown size={16} />
                </button>
                {showFormal1Menu === field.id && (
                  <div className="fas-dropdown-menu">
                    {formalCodes.map(code => (
                      <button
                        key={code.formal_1}
                        type="button"
                        className="fas-dropdown-item"
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

              {field.formal_1 && (
                <div className="fas-formal-group">
                  <label className="fas-label">Formål (nivå 2)</label>
                  <button
                    type="button"
                    className="fas-dropdown-btn"
                    onClick={() => setShowFormal2Menu(showFormal2Menu === field.id ? null : field.id)}
                  >
                    <span>{field.formal_2 || 'Velg formål 2'}</span>
                    <ChevronDown size={16} />
                  </button>
                  {showFormal2Menu === field.id && (
                    <div className="fas-dropdown-menu">
                      {getFormal2Options(field.formal_1).map(option => (
                        <button
                          key={option}
                          type="button"
                          className="fas-dropdown-item"
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
              )}
            </div>

            {field.plots.length > 0 && (
              <div className="fas-plots">
                {field.plots.map((plot, plotIndex) => (
                  <div key={plotIndex} className="fas-plot-row">
                    <Home size={13} className="fas-plot-row__icon" />
                    <input
                      className="fas-plot-row__input"
                      type="text"
                      placeholder={`Tomt ${fieldIndex + 1}.${plotIndex + 1}`}
                      value={plot}
                      onChange={event => update(field.id, current => {
                        const nextPlots = [...current.plots]
                        nextPlots[plotIndex] = event.target.value
                        return { ...current, plots: nextPlots }
                      })}
                    />
                    <button
                      type="button"
                      className="fas-icon-btn fas-icon-btn--light"
                      onClick={() => update(field.id, current => ({ ...current, plots: current.plots.filter((_, i) => i !== plotIndex) }))}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="fas-secondary-btn"
              onClick={() => update(field.id, current => ({ ...current, plots: [...current.plots, ''] }))}
            >
              <Plus size={13} />
              Legg til tomt
            </button>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="fas-primary-btn"
        onClick={() => {
          applyChange([...resolvedFields, { id: nextId, name: '', plots: [] }])
          setNextId(value => value + 1)
        }}
      >
        <Plus size={15} />
        Legg til felt
      </button>
    </section>
  )
}
