import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Image, X } from 'lucide-react'
import './GalleriSelector.css'
import type { GalleriItemRef } from './bestemmelse-types'

const API_BASE = import.meta.env.VITE_API_BASE
  ?? (import.meta.env.DEV ? 'http://localhost:8000/api' : '/mikro-drommeplan/api')

const BASE_PATH = import.meta.env.VITE_BASE_PATH ?? (import.meta.env.DEV ? '/' : '/mikro-drommeplan/')

interface GalleriItem {
  id: number
  forklaring?: string | null
  overskrift: string
  bildefilnavn?: string | null
  sortering: number
}

interface Props {
  titleId: number | null
  selectedItems: GalleriItemRef[]
  onSelectionChange: (itemIds: number[]) => void
}

export function GalleriSelector({ titleId, selectedItems: initialItems, onSelectionChange }: Props) {
  const [allGalleriItems, setAllGalleriItems] = useState<GalleriItem[]>([])
  const [themGalleriItems, setThemGalleriItems] = useState<GalleriItem[]>([])
  const [selectedItems, setSelectedItems] = useState<GalleriItem[]>(() =>
    initialItems.map(ref => ({
      id: ref.tema_tittel_galleri_id,
      forklaring: ref.forklaring,
      overskrift: ref.overskrift,
      bildefilnavn: ref.bildefilnavn,
      sortering: 0,
    })),
  )
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)
  const [showAllDropdown, setShowAllDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const hasUserInteracted = useRef(false)

  useEffect(() => {
    if (hasUserInteracted.current) return

    setSelectedItems(
      initialItems.map(ref => ({
        id: ref.tema_tittel_galleri_id,
        forklaring: ref.forklaring,
        overskrift: ref.overskrift,
        bildefilnavn: ref.bildefilnavn,
        sortering: ref.sortering ?? 0,
      })),
    )
  }, [initialItems])

  // Fetch all gallery items on mount
  useEffect(() => {
    fetchAllGalleriItems()
  }, [])

  // Fetch theme-specific items when titleId changes
  useEffect(() => {
    if (titleId) {
      fetchThemeGalleriItems(titleId)
    } else {
      setThemGalleriItems([])
    }
  }, [titleId])

  const fetchAllGalleriItems = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/admin/galleri`)
      if (!res.ok) throw new Error('Kunne ikke hente alle galleri-elementer')
      
      const data = await res.json()
      setAllGalleriItems(data.items || [])
    } catch (error) {
      console.error('Feil ved henting av galleri-elementer:', error)
      setAllGalleriItems([])
    } finally {
      setLoading(false)
    }
  }

  const fetchThemeGalleriItems = async (temaId: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/galleri/tema-tittel/${temaId}`)
      if (!res.ok) throw new Error('Kunne ikke hente tema-forklaringer')
      
      const data = await res.json()
      setThemGalleriItems(data.items || [])
    } catch (error) {
      console.error('Feil ved henting av tema-forklaringer:', error)
      setThemGalleriItems([])
    }
  }

  const isItemSelected = (itemId: number) => {
    return selectedItems.some(si => si.id === itemId)
  }

  const getDropdownLabel = (item: GalleriItem) => {
    return item.forklaring?.trim() || item.overskrift
  }

  const handleSelectItem = (item: GalleriItem) => {
    hasUserInteracted.current = true
    // Check if already selected
    if (isItemSelected(item.id)) {
      return
    }
    const newSelected = [...selectedItems, item]
    setSelectedItems(newSelected)
    // Filter out any null/undefined IDs before sending
    const validIds = newSelected
      .map(i => i.id)
      .filter((id): id is number => id != null && typeof id === 'number')
    onSelectionChange(validIds)
    setShowThemeDropdown(false)
    setShowAllDropdown(false)
  }

  const handleRemoveItem = (itemId: number) => {
    hasUserInteracted.current = true
    const newSelected = selectedItems.filter(si => si.id !== itemId)
    setSelectedItems(newSelected)
    // Filter out any null/undefined IDs before sending
    const validIds = newSelected
      .map(i => i.id)
      .filter((id): id is number => id != null && typeof id === 'number')
    onSelectionChange(validIds)
  }

  return (
    <div className="gs-container">
      <div className="gs-header">
        <Image size={18} />
        <h3>Illustrasjoner og forklaringstekster</h3>
      </div>

      {/* Theme-specific gallery dropdown */}
      {titleId && (
        <div className="gs-dropdown-group">
          <button
            type="button"
            className="gs-dropdown-button"
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
          >
            <span>Forklaringer for utvalgt tema</span>
            <ChevronDown size={16} className={showThemeDropdown ? 'gs-chevron--open' : ''} />
          </button>

          {showThemeDropdown && (
            <div className="gs-dropdown-menu">
              {themGalleriItems.length === 0 ? (
                <div className="gs-empty">Ingen forklaringer for det utvalgte temaet</div>
              ) : (
                <ul className="gs-menu-list">
                  {themGalleriItems.map((item, idx) => (
                    <li key={`tema-${item.id}-${idx}`}>
                      <button
                        type="button"
                        className={`gs-menu-item ${isItemSelected(item.id) ? 'gs-menu-item--selected' : ''}`}
                        onClick={() => handleSelectItem(item)}
                      >
                        <span className="gs-menu-label">{getDropdownLabel(item)}</span>
                        {item.bildefilnavn && (
                          <span className="gs-menu-hint">{item.bildefilnavn}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* All gallery items dropdown */}
      <div className="gs-dropdown-group">
        <button
          type="button"
          className="gs-dropdown-button"
          onClick={() => setShowAllDropdown(!showAllDropdown)}
        >
          <span>Alle forklaringer</span>
          <ChevronDown size={16} className={showAllDropdown ? 'gs-chevron--open' : ''} />
        </button>

        {showAllDropdown && (
          <div className="gs-dropdown-menu">
            {loading ? (
              <div className="gs-loading">Laster forklaringer...</div>
            ) : allGalleriItems.length === 0 ? (
              <div className="gs-empty">Ingen forklaringer tilgjengelig</div>
            ) : (
              <ul className="gs-menu-list">
                {allGalleriItems.map((item, idx) => (
                  <li key={`all-${item.id}-${idx}`}>
                    <button
                      type="button"
                      className={`gs-menu-item ${isItemSelected(item.id) ? 'gs-menu-item--selected' : ''}`}
                      onClick={() => handleSelectItem(item)}
                    >
                      <span className="gs-menu-label">{getDropdownLabel(item)}</span>
                      {item.bildefilnavn && (
                        <span className="gs-menu-hint">{item.bildefilnavn}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Selected items chips */}
      {selectedItems.length > 0 && (
        <div className="gs-selected-items">
          <div className="gs-chips">
            {selectedItems.map((item, idx) => (
              <div key={`selected-${item.id}-${idx}`} className="gs-chip">
                <div className="gs-chip-content">
                  {item.bildefilnavn && (
                    <img 
                      src={`${BASE_PATH}public/galleri/${item.bildefilnavn}`}
                      alt={item.overskrift}
                      className="gs-chip-image"
                    />
                  )}
                  <span className="gs-chip-label">{item.overskrift}</span>
                </div>
                <button
                  type="button"
                  className="gs-chip-remove"
                  onClick={() => handleRemoveItem(item.id)}
                  title="Fjern"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
