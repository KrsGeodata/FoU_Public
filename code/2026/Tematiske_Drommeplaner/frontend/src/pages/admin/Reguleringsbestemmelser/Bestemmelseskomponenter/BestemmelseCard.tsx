import { useState } from 'react'
import { ChevronDown, ChevronUp, GripVertical, Hammer, Layers, Pencil, Trash2,} from 'lucide-react'
import './BestemmelseCard.css'
import { BestemmelseModal } from './BestemmelseModal'
import { DeleteBestemmelseModal } from './DeleteBestemmelseModal'
import type {
  BestemmelseCategory,
  BestemmelseField,
  BestemmelseItem,
  BestemmelseUpdate,
  BuildingTypeOption,
  HensynssoneOption,
} from './bestemmelse-types'

const BASE_PATH = import.meta.env.VITE_BASE_PATH ?? (import.meta.env.DEV ? '/' : '/mikro-drommeplan/')

interface Props {
  bestemmelse: BestemmelseItem
  categories: BestemmelseCategory[]
  fields: BestemmelseField[]
  buildingTypes: BuildingTypeOption[]
  hensynssoneOptions: HensynssoneOption[]
  onUpdate: (id: number, updates: BestemmelseUpdate) => void | Promise<void>
  onDelete: (id: number) => void | Promise<void>
  onGripDragStart: (e: React.DragEvent<HTMLSpanElement>) => void
  readOnly?: boolean
}

export function BestemmelseCard({
  bestemmelse,
  categories,
  fields,
  buildingTypes,
  hensynssoneOptions,
  onUpdate,
  onDelete,
  onGripDragStart,
  readOnly = false,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)



  const handleSave = async (data: BestemmelseUpdate) => {
    await onUpdate(bestemmelse.id, data)
  }

  const scopeChips = (): string[] => {
    if (bestemmelse.scope.length === 0) {
      return ['Hele planen']
    }

    const fieldMap = new Map<string, string[]>()
    for (const item of bestemmelse.scope) {
      const key = item.fieldName ?? `Felt ${item.fieldId}`
      if (item.plotId === null) {
        fieldMap.set(key, [])
      } else if (!fieldMap.has(key)) {
        fieldMap.set(key, [item.plotName ?? `Tomt #${item.plotId}`])
      } else {
        fieldMap.get(key)?.push(item.plotName ?? `Tomt #${item.plotId}`)
      }
    }

    return Array.from(fieldMap.entries()).map(([fieldName, plots]) =>
      plots.length === 0 ? fieldName : `${fieldName}: ${plots.join(', ')}`,
    )
  }

  return (
    <article className="bec-card">
      <div className="bec-view">
        <div className="bec-header">
          {!readOnly && (
            <span
              className="bec-grip"
              draggable="true"
              onDragStart={onGripDragStart}
            >
              <GripVertical size={16} />
            </span>
          )}

          <div className="bec-actions">
            <button
              type="button"
              className="bec-action-btn"
              onClick={() => setCollapsed(previous => !previous)}
              title={collapsed ? 'Utvid' : 'Trekk sammen'}
            >
              {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
            {!readOnly && (
              <button type="button" className="bec-action-btn" onClick={() => setModalOpen(true)} title="Rediger">
                <Pencil size={15} />
              </button>
            )}
            {!readOnly && (
              <button
                type="button"
                className="bec-action-btn bec-action-btn--danger"
                onClick={() => setDeleteModalOpen(true)}
                title="Slett"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="bec-content-section">
          <p className="bec-content">
            {bestemmelse.content || <em className="bec-muted">Ingen innhold</em>}
          </p>
        </div>

        {!collapsed && (
          <>
            {readOnly && bestemmelse.galleriItems.length > 0 && (
              <div className="bec-gallery-section">
                {bestemmelse.galleriItems.map(item => {
                  const hasImage = item.bildefilnavn?.trim()
                  const hasText = item.forklaringstekst?.trim()
                  
                  if (!hasImage && !hasText) return null
                  
                  return (
                    <div key={item.id} className="bec-gallery-item">
                      <h4 className="bec-gallery-item-title">{item.overskrift}</h4>
                      <div className={`bec-gallery-item-content${hasImage && hasText ? ' bec-gallery-item-content--with-image' : ''}`}>
                        {hasImage && (
                          <div className="bec-gallery-item-image-wrapper">
                            <img
                              src={`${BASE_PATH}public/galleri/${item.bildefilnavn}`}
                              alt={item.overskrift}
                              className="bec-gallery-item-image"
                              onError={(e) => {
                                console.warn(`Kunne ikke laste bilde: ${BASE_PATH}public/galleri/${item.bildefilnavn}`)
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        {hasText && (
                          <p className="bec-gallery-item-text">{item.forklaringstekst}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="bec-tags-section">
            <div className="bec-tags">
              {bestemmelse.hensynssoneKode ? (
                <span className="bec-tag bec-tag--scope">
                  <Layers size={11} />
                  Hensynssone {bestemmelse.hensynssoneKode}
                  {bestemmelse.hensynssoneNavn ? ` · ${bestemmelse.hensynssoneNavn}` : ''}
                </span>
              ) : null}

              {scopeChips().map(chip => (
                <span key={chip} className="bec-tag bec-tag--scope">
                  <Layers size={11} />
                  {chip}
                </span>
              ))}

              {bestemmelse.buildingTypeCodes.length === 0 ? (
                <span className="bec-tag bec-tag--type">
                  <Hammer size={11} />
                  Alle tiltakstyper
                </span>
              ) : (
                bestemmelse.buildingTypeCodes.map(code => {
                  const buildingType = buildingTypes.find(item => item.code === code)
                  return (
                    <span key={code} className="bec-tag bec-tag--type">
                      <Hammer size={11} />
                      {buildingType?.name ?? code}
                    </span>
                  )
                })
              )}
            </div>
          </div>
          </>
        )}
      </div>

      {modalOpen && (
        <BestemmelseModal
          mode="edit"
          bestemmelse={bestemmelse}
          categories={categories}
          fields={fields}
          buildingTypes={buildingTypes}
          hensynssoneOptions={hensynssoneOptions}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {deleteModalOpen && (
        <DeleteBestemmelseModal
          title={bestemmelse.titleLabel ?? 'Uten tittel'}
          onConfirm={() => onDelete(bestemmelse.id)}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
    </article>
  )
}
