import { useEffect, useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import './BestemmelseModal.css'
import { GalleriSelector } from './GalleriSelector'
import type {
  BestemmelseCategory,
  BestemmelseField,
  BestemmelseItem,
  BestemmelseUpdate,
  BuildingTypeOption,
  HensynssoneOption,
} from './bestemmelse-types'

interface Props {
  mode: 'add' | 'edit'
  bestemmelse?: BestemmelseItem
  categories: BestemmelseCategory[]
  fields: BestemmelseField[]
  buildingTypes: BuildingTypeOption[]
  hensynssoneOptions: HensynssoneOption[]
  onSave: (data: BestemmelseUpdate) => void | Promise<void>
  onClose: () => void
}

interface ScopeItem {
  fieldId: number
  plotId: number | null
}

export function BestemmelseModal({
  mode,
  bestemmelse,
  categories,
  fields,
  buildingTypes,
  hensynssoneOptions,
  onSave,
  onClose,
}: Props) {
  const [titleId, setTitleId] = useState<number | null>(bestemmelse?.titleId ?? null)
  const [hensynssoneKode, setHensynssoneKode] = useState<number | null>(bestemmelse?.hensynssoneKode ?? null)
  const [content, setContent] = useState(bestemmelse?.content ?? '')
  const [galleriItemIds, setGalleriItemIds] = useState<number[]>(
    bestemmelse?.galleriItems.map(g => g.tema_tittel_galleri_id) ?? []
  )
  const [scope, setScope] = useState<ScopeItem[]>(
      bestemmelse?.scope.map(item => ({ fieldId: item.fieldId, plotId: item.plotId })) ?? [],
    )
    const sortering = bestemmelse?.sortering ?? 0
  const [selectedBuildingTypes, setSelectedBuildingTypes] = useState<string[]>(
    bestemmelse?.buildingTypeCodes ?? [],
  )
  const [scopeMode, setScopeMode] = useState<'global' | 'specific'>(
    (bestemmelse?.scope ?? []).length > 0 ? 'specific' : 'global',
  )
  const [expandedFields, setExpandedFields] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const toggleBuildingType = (code: string) => {
    setSelectedBuildingTypes(previous => {
      const next = previous.includes(code)
        ? previous.filter(item => item !== code)
        : [...previous, code]

      const allSelected = buildingTypes.length > 0 && buildingTypes.every(item => next.includes(item.code))
      return allSelected ? [] : next
    })
  }

  const toggleExpandField = (fieldId: number) => {
    setExpandedFields(previous => {
      const next = new Set(previous)
      next.has(fieldId) ? next.delete(fieldId) : next.add(fieldId)
      return next
    })
  }

  const hasFieldAll = (fieldId: number) => scope.some(item => item.fieldId === fieldId && item.plotId === null)

  const hasPlot = (fieldId: number, plotId: number) =>
    hasFieldAll(fieldId) || scope.some(item => item.fieldId === fieldId && item.plotId === plotId)

  const fieldHasAnyScope = (fieldId: number) => scope.some(item => item.fieldId === fieldId)

  const toggleScopeField = (fieldId: number) => {
    if (hasFieldAll(fieldId)) {
      setScope(previous => previous.filter(item => item.fieldId !== fieldId))

      return
    }

    setScope(previous => [
      ...previous.filter(item => item.fieldId !== fieldId),
      { fieldId, plotId: null },
    ])

  }

  const toggleScopePlot = (fieldId: number, plotId: number) => {
    if (hasFieldAll(fieldId)) {
      const field = fields.find(item => item.id === fieldId)
      const otherPlots = field?.plots.filter(item => item.id !== plotId) ?? []
      const rest = scope.filter(item => item.fieldId !== fieldId)
      setScope([...rest, ...otherPlots.map(item => ({ fieldId, plotId: item.id }))])

      return
    }

    if (hasPlot(fieldId, plotId)) {
      setScope(previous => previous.filter(item => !(item.fieldId === fieldId && item.plotId === plotId)))

      return
    }

    setScope(previous => [...previous, { fieldId, plotId }])

  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payloadToSend = {
        titleId,
        hensynssoneKode,
        content,
        sortering,
        scope: scopeMode === 'global' ? [] : scope,
        buildingTypeCodes: selectedBuildingTypes,
        galleriItemIds,
      }

      await onSave(payloadToSend)

      onClose()
    } catch (error) {
      console.error('❌ Error in handleSave:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bem-overlay" onClick={onClose}>
      <div className="bem-panel" onClick={event => event.stopPropagation()}>
        <div className="bem-header">
          <h2 className="bem-title">{mode === 'add' ? 'Ny bestemmelse' : 'Rediger bestemmelse'}</h2>
          <button type="button" className="bem-close" onClick={onClose} aria-label="Lukk">
            <X size={20} />
          </button>
        </div>

        <div className="bem-body">
          <div className="bem-field">
            <label className="bem-label">Tittel</label>
            <select
              className="bem-select"
              value={titleId ?? ''}
              onChange={event => setTitleId(event.target.value ? Number(event.target.value) : null)}
            >
              <option value="">— Velg tittel —</option>
              {categories.map(category =>
                category.titles.length > 0 ? (
                  <optgroup key={category.id} label={category.name}>
                    {category.titles.map(title => (
                      <option key={title.id} value={title.id}>
                        {title.label}
                      </option>
                    ))}
                  </optgroup>
                ) : null,
              )}
            </select>
          </div>

          <div className="bem-field">
            <label className="bem-label">Tekst</label>
            <textarea
              className="bem-textarea"
              value={content}
              onChange={event => setContent(event.target.value)}
              rows={7}
              placeholder="Skriv bestemmelsestekst her…"
            />
          </div>

          {titleId && (
            <div className="bem-field">
              <label className="bem-label">Galleri</label>
              <GalleriSelector
                titleId={titleId}
                selectedItems={bestemmelse?.galleriItems ?? []}
                onSelectionChange={setGalleriItemIds}
              />
            </div>
          )}

          <div className="bem-field">
            <label className="bem-label">Hensynssone</label>
            <select
              className="bem-select"
              value={hensynssoneKode ?? ''}
              onChange={event => setHensynssoneKode(event.target.value ? Number(event.target.value) : null)}
            >
              <option value="">Ingen hensynssone</option>
              {hensynssoneOptions.map(option => (
                <option key={option.kode} value={option.kode}>
                  {option.kode} – {option.navn}
                </option>
              ))}
            </select>
          </div>

          <div className="bem-field">
            <label className="bem-label">Gjelder for</label>
            <div className="bem-scope-modes">
              <label className="bem-scope-mode">
                <input
                  type="radio"
                  checked={scopeMode === 'global'}
                  onChange={() => {

                    setScopeMode('global')
                    setScope([])
                  }}
                />
                Hele planen
              </label>
              <label className="bem-scope-mode">
                <input
                  type="radio"
                  checked={scopeMode === 'specific'}
                  onChange={() => {

                    setScopeMode('specific')
                  }}
                />
                Velg felt / tomter
              </label>
            </div>
            {scopeMode === 'specific' && (
              <div className="bem-tree">
                {fields.map(field => {
                  const isExpanded = expandedFields.has(field.id)
                  return (
                    <div key={field.id} className="bem-tree-field">
                      <div className="bem-tree-row">
                        <button
                          type="button"
                          className={`bem-chevron${isExpanded ? ' bem-chevron--open' : ''}`}
                          onClick={() => toggleExpandField(field.id)}
                          aria-label={isExpanded ? 'Skjul tomter' : 'Vis tomter'}
                          disabled={field.plots.length === 0}
                        >
                          <ChevronRight size={14} />
                        </button>

                        <label className="bem-tree-label">
                          <input
                            type="checkbox"
                            checked={hasFieldAll(field.id)}
                            ref={element => {
                              if (element) {
                                element.indeterminate = !hasFieldAll(field.id) && fieldHasAnyScope(field.id)
                              }
                            }}
                            onChange={() => toggleScopeField(field.id)}
                          />
                          {field.fieldName}
                        </label>
                      </div>

                      {isExpanded && field.plots.length > 0 && (
                        <div className="bem-plots">
                          {field.plots.map(plot => (
                            <label key={plot.id} className="bem-plot-label">
                              <input
                                type="checkbox"
                                checked={hasPlot(field.id, plot.id)}
                                onChange={() => toggleScopePlot(field.id, plot.id)}
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

          <div className="bem-field">
            <label className="bem-label">Relevant for:</label>
            <div className="bem-types">
              <label className="bem-type-item">
                <input
                  type="checkbox"
                  checked={selectedBuildingTypes.length === 0}
                  onChange={() => setSelectedBuildingTypes([])}
                />
                Alle typer
              </label>

              {buildingTypes.map(type => (
                <label key={type.code} className="bem-type-item">
                  <input
                    type="checkbox"
                    checked={selectedBuildingTypes.includes(type.code)}
                    onChange={() => toggleBuildingType(type.code)}
                  />
                  {type.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bem-footer">
          <button type="button" className="bem-btn bem-btn--save" onClick={handleSave} disabled={saving}>
            {saving ? 'Lagrer…' : 'Lagre'}
          </button>
          <button type="button" className="bem-btn bem-btn--cancel" onClick={onClose} disabled={saving}>
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}
