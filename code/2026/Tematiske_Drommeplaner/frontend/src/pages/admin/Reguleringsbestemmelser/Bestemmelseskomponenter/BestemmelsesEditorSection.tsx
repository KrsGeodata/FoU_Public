import { useState } from 'react'
import { BestemmelseFilterPanel } from './BestemmelseFilterPanel'
import { BestemmelseList } from './BestemmelseList'
import {
  EMPTY_BESTEMMELSE_FILTER,
  type BestemmelseCategory,
  type BestemmelseField,
  type BestemmelseFilterState,
  type BestemmelseItem,
  type BestemmelseUpdate,
  type BuildingTypeOption,
  type HensynssoneOption,
} from './bestemmelse-types'
import './BestemmelsesEditorSection.css'

interface Props {
  bestemmelser?: BestemmelseItem[]
  categories?: BestemmelseCategory[]
  fields?: BestemmelseField[]
  buildingTypes?: BuildingTypeOption[]
  hensynssoneOptions?: HensynssoneOption[]
  initialFilter?: BestemmelseFilterState
  onAdd?: (data: BestemmelseUpdate) => void | Promise<void>
  onUpdate?: (id: number, updates: BestemmelseUpdate) => void | Promise<void>
  onDelete?: (id: number) => void | Promise<void>
  readOnly?: boolean
}

export function BestemmelsesEditorSection({
  bestemmelser = [],
  categories = [],
  fields = [],
  buildingTypes = [],
  hensynssoneOptions = [],
  initialFilter = EMPTY_BESTEMMELSE_FILTER,
  onAdd,
  onUpdate,
  onDelete,
  readOnly = false,
}: Props) {
  const [filter, setFilter] = useState<BestemmelseFilterState>(initialFilter)

  return (
    <section className="bes-root" aria-label="Bestemmelser editor">
      <div className="bes-grid">
        <div className="bes-main">
          <BestemmelseList
            bestemmelser={bestemmelser}
            categories={categories}
            fields={fields}
            buildingTypes={buildingTypes}
            hensynssoneOptions={hensynssoneOptions}
            filter={filter}
            onAdd={onAdd}
            onUpdate={onUpdate}
            onDelete={onDelete}
            readOnly={readOnly}
          />
        </div>

        <div className="bes-sidebar">
          <BestemmelseFilterPanel
            fields={fields}
            buildingTypes={buildingTypes}
            filter={filter}
            onChange={setFilter}
          />
        </div>
      </div>
    </section>
  )
}
