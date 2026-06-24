import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import {
  createBestemmelse,
  deleteBestemmelse,
  getPlan,
  updateBestemmelse,
  type PlanDetail,
} from '../../../../api/adminApi'
import './BestemmelseList.css'
import { BestemmelseCard } from './BestemmelseCard'
import { BestemmelseModal } from './BestemmelseModal'
import type {
  BestemmelseCategory,
  BestemmelseField,
  BestemmelseFilterState,
  BestemmelseItem,
  BestemmelseUpdate,
  BuildingTypeOption,
  HensynssoneOption,
} from './bestemmelse-types'

interface Props {
  bestemmelser: BestemmelseItem[]
  categories: BestemmelseCategory[]
  fields: BestemmelseField[]
  buildingTypes: BuildingTypeOption[]
  hensynssoneOptions?: HensynssoneOption[]
  filter: BestemmelseFilterState
  onAdd?: (data: BestemmelseUpdate) => void | Promise<void>
  onUpdate?: (id: number, updates: BestemmelseUpdate) => void | Promise<void>
  onDelete?: (id: number) => void | Promise<void>
  readOnly?: boolean
}

interface BestemmelseGroup {
  titleId: number | null
  titleLabel: string | null
  items: BestemmelseItem[]
}

function passesFilter(bestemmelse: BestemmelseItem, filter: BestemmelseFilterState, fields: BestemmelseField[]) {
  // Check building type filter
  if (
    filter.buildingTypes.length > 0 &&
    bestemmelse.buildingTypeCodes.length > 0 &&
    !bestemmelse.buildingTypeCodes.some(code => filter.buildingTypes.includes(code))
  ) {
    return false
  }

  // Check formal1 filter (formål 1)
  if (filter.formal1Values.length > 0 && bestemmelse.scope.length > 0) {
    const hasMatchingFormal1 = bestemmelse.scope.some(scopeItem => {
      const field = fields.find(f => f.id === scopeItem.fieldId)
      return field && field.formal_1 && filter.formal1Values.includes(field.formal_1)
    })
    if (!hasMatchingFormal1) return false
  }

  // If no field/plot filters, pass
  if (filter.fieldIds.length === 0) {
    return true
  }

  // If bestemmelse has no scope, pass
  if (bestemmelse.scope.length === 0) {
    return true
  }

  // Check field/plot filter
  return bestemmelse.scope.some(scopeItem => {
    const fieldMatches = filter.fieldIds.includes(scopeItem.fieldId)
    const plotMatches =
      scopeItem.plotId === null ||
      filter.plotIds.length === 0 ||
      filter.plotIds.includes(scopeItem.plotId)

    return fieldMatches && plotMatches
  })
}

function groupBestemmelser(items: BestemmelseItem[]): BestemmelseGroup[] {
  const grouped = new Map<number | string, BestemmelseGroup>()

  for (const item of items) {
    const key = item.titleId ?? 'null'
    if (!grouped.has(key)) {
      grouped.set(key, {
        titleId: item.titleId,
        titleLabel: item.titleLabel ?? null,
        items: [],
      })
    }
    grouped.get(key)!.items.push(item)
  }

  return Array.from(grouped.values())
}

export function BestemmelseList({
  bestemmelser,
  categories,
  fields,
  buildingTypes,
  hensynssoneOptions = [],
  filter,
  onAdd,
  onUpdate,
  onDelete,
  readOnly = false,
}: Props) {
  const { planId } = useParams<{ planId: string }>()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [loaded, setLoaded] = useState<PlanDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)

  const isUncontrolled = !onAdd && !onUpdate && !onDelete

  useEffect(() => {
    if (!isUncontrolled) return

    const numericPlanId = Number(planId)
    if (!numericPlanId || Number.isNaN(numericPlanId)) return

    setLoading(true)
    setFetchError(null)
    getPlan(numericPlanId)
      .then(plan => {
        setLoaded(plan)
      })
      .catch(e => {

        setFetchError(e instanceof Error ? e.message : 'Kunne ikke laste bestemmelser')
      })
      .finally(() => setLoading(false))
  }, [isUncontrolled, planId])

  const resolvedBestemmelser = isUncontrolled ? (loaded?.bestemmelser ?? bestemmelser) : bestemmelser
  const resolvedCategories = isUncontrolled ? (loaded?.categories ?? categories) : categories
  const resolvedFields = isUncontrolled ? (loaded?.fields ?? fields) : fields
  const resolvedBuildingTypes = isUncontrolled ? (loaded?.buildingTypes ?? buildingTypes) : buildingTypes
  const resolvedHensynssoner = isUncontrolled ? (loaded?.hensynssoner ?? hensynssoneOptions) : hensynssoneOptions

  const handleAdd = async (data: BestemmelseUpdate) => {
    if (onAdd) {
      await onAdd(data)
      return
    }

    const numericPlanId = Number(planId)
    if (!numericPlanId || Number.isNaN(numericPlanId)) return
    
    // Beregn riktig sortering basert på eksisterende bestemmelser med samme titleId
    const sameTitleItems = resolvedBestemmelser.filter(b => b.titleId === data.titleId)
    const maxSortering = sameTitleItems.length > 0 ? Math.max(...sameTitleItems.map(b => b.sortering)) : -1
    const nextSortering = maxSortering + 1
    

    
    const updated = { ...data, sortering: nextSortering }
    const created = await createBestemmelse(numericPlanId, updated)



    setLoaded(prev =>
      prev
        ? {
            ...prev,
            bestemmelser: [...prev.bestemmelser, created],
          }
        : prev,
    )
  }

  const handleUpdate = async (id: number, updates: BestemmelseUpdate) => {
    if (onUpdate) {
      await onUpdate(id, updates)
      return
    }



    const updated = await updateBestemmelse(id, updates)



    setLoaded(prev =>
      prev
        ? {
            ...prev,
            bestemmelser: prev.bestemmelser.map(item => (item.id === id ? updated : item)),
          }
        : prev,
    )
  }

  const handleDelete = async (id: number) => {
    if (onDelete) {
      await onDelete(id)
      return
    }

    await deleteBestemmelse(id)
    setLoaded(prev =>
      prev
        ? {
            ...prev,
            bestemmelser: prev.bestemmelser.filter(item => item.id !== id),
          }
        : prev,
    )
  }

  const sortBestemmelser = (items: BestemmelseItem[]): BestemmelseItem[] => {
    const sorted = [...items].sort((a, b) => {
      if ((a.titleId ?? -1) !== (b.titleId ?? -1)) {
        return (a.titleId ?? -1) - (b.titleId ?? -1)
      }
      if (a.sortering !== b.sortering) {
        return a.sortering - b.sortering
      }
      return a.id - b.id
    })

    return sorted
  }

  const handleDragStart = (e: React.DragEvent<HTMLSpanElement>, itemId: number) => {

    e.stopPropagation()
    e.dataTransfer!.effectAllowed = 'move'
    e.dataTransfer!.setData('text/plain', String(itemId))
    setDraggedItemId(itemId)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetId: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer!.dropEffect = 'move'
    setDropTargetId(targetId)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetId: number) => {

    e.preventDefault()
    e.stopPropagation()
    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null)
      setDropTargetId(null)
      return
    }

    const draggedItem = resolvedBestemmelser.find(b => b.id === draggedItemId)
    const targetItem = resolvedBestemmelser.find(b => b.id === targetId)

    if (draggedItem && targetItem) {
      const tempSortering = draggedItem.sortering
      

      
      // FIX: Don't send scope during drag-drop - preserve existing scope
      // Only update sortering to prevent empty scope arrays from overwriting database values
      await handleUpdate(draggedItemId, {
        titleId: draggedItem.titleId,
        hensynssoneKode: draggedItem.hensynssoneKode ?? null,
        content: draggedItem.content,
        sortering: targetItem.sortering,
        scope: (draggedItem.scope && draggedItem.scope.length > 0) 
          ? draggedItem.scope.map(s => ({ fieldId: s.fieldId, plotId: s.plotId }))
          : draggedItem.scope ?? [], // Preserve existing scope value
        buildingTypeCodes: draggedItem.buildingTypeCodes,
        galleriItemIds: draggedItem.galleriItems.map(item => item.tema_tittel_galleri_id),
      })
      await handleUpdate(targetId, {
        titleId: targetItem.titleId,
        hensynssoneKode: targetItem.hensynssoneKode ?? null,
        content: targetItem.content,
        sortering: tempSortering,
        scope: (targetItem.scope && targetItem.scope.length > 0)
          ? targetItem.scope.map(s => ({ fieldId: s.fieldId, plotId: s.plotId }))
          : targetItem.scope ?? [], // Preserve existing scope value
        buildingTypeCodes: targetItem.buildingTypeCodes,
        galleriItemIds: targetItem.galleriItems.map(item => item.tema_tittel_galleri_id),
      })

      // Re-sort the items after swap
      setLoaded(prev =>
        prev
          ? {
              ...prev,
              bestemmelser: sortBestemmelser(prev.bestemmelser),
            }
          : prev,
      )
    }

    setDraggedItemId(null)
    setDropTargetId(null)
  }

  const visible = resolvedBestemmelser.filter(item => passesFilter(item, filter, resolvedFields))
  const grouped = groupBestemmelser(visible)

  return (
    <section className="bel-root" aria-label="Bestemmelser">
      <div className="bel-header">
        <div></div>
        {!readOnly && (
          <button type="button" className="bel-add-btn" onClick={() => setAddModalOpen(true)}>
            <Plus size={16} />
            Legg til bestemmelse
          </button>
        )}
      </div>

      <div className="bel-list">
        {loading && <p className="bel-empty">Laster bestemmelser…</p>}
        {fetchError && <p className="bel-empty" style={{ color: '#b91c1c' }}>{fetchError}</p>}

        {!loading && !fetchError && visible.length === 0 && (
          <p className="bel-empty">
            {resolvedBestemmelser.length === 0
              ? 'Ingen bestemmelser lagt til ennå.'
              : 'Ingen bestemmelser matcher det valgte filteret.'}
          </p>
        )}

        {grouped.map(group => (
          <div key={group.titleId ?? 'ungrouped'} className="bel-group">
            {group.titleLabel && <h3 className="bel-group__title">{group.titleLabel}</h3>}
            <div className="bel-group__items" onDragOver={e => e.preventDefault()}>
              {group.items.map(bestemmelse => (
                <div
                  key={bestemmelse.id}
                  onDragOver={e => handleDragOver(e, bestemmelse.id)}
                  onDrop={e => handleDrop(e, bestemmelse.id)}
                  onDragLeave={() => {
                    setDropTargetId(null)
                  }}
                  className={`bel-group__item${draggedItemId === bestemmelse.id ? ' bel-group__item--dragging' : ''}${dropTargetId === bestemmelse.id ? ' bel-group__item--drop-target' : ''}`}
                >
                  <BestemmelseCard
                    bestemmelse={bestemmelse}
                    categories={resolvedCategories}
                    fields={resolvedFields}
                    buildingTypes={resolvedBuildingTypes}
                    hensynssoneOptions={resolvedHensynssoner}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onGripDragStart={e => handleDragStart(e, bestemmelse.id)}
                    readOnly={readOnly}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {addModalOpen && (
        <BestemmelseModal
          mode="add"
          categories={resolvedCategories}
          fields={resolvedFields}
          buildingTypes={resolvedBuildingTypes}
          hensynssoneOptions={resolvedHensynssoner}
          onSave={handleAdd}
          onClose={() => setAddModalOpen(false)}
        />
      )}
    </section>
  )
}
