import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Car, ChevronRight, Hammer, House, Layout, Layers, MapPin, X } from 'lucide-react'
import { getPlan, listPlans, type PlanDetail, type PlanListItem } from '../../../api/adminApi'
import './UserWizardModal.css'

const BASE_PATH = import.meta.env.VITE_BASE_PATH ?? (import.meta.env.DEV ? '/' : '/mikro-drommeplan/')

interface Props {
  open: boolean
  onClose: () => void
}

type Phase = 'plans' | 'fields' | 'plots' | 'types' | 'results'

function getBuildingTypeIcon(name: string) {
  const normalized = name.toLowerCase()
  if (normalized.includes('garasje')) return <Car size={18} />
  if (normalized.includes('tilbygg')) return <Hammer size={18} />
  return <House size={18} />
}

function includesScope(
  item: PlanDetail['bestemmelser'][number],
  fieldId: number,
  plotId: number,
  buildingTypeCode: string,
) {
  const matchesBuildingType =
    item.buildingTypeCodes.length === 0 || item.buildingTypeCodes.includes(buildingTypeCode)

  if (!matchesBuildingType) return false
  if (item.scope.length === 0) return true

  return item.scope.some(scopeItem => {
    if (scopeItem.plotId !== null) return scopeItem.plotId === plotId
    return scopeItem.fieldId === fieldId
  })
}

export function UserWizardModal({ open, onClose }: Props) {
  const [plans, setPlans] = useState<PlanListItem[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [plansError, setPlansError] = useState<string | null>(null)

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [planDetail, setPlanDetail] = useState<PlanDetail | null>(null)
  const [planLoading, setPlanLoading] = useState(false)

  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null)
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null)
  const [selectedBuildingType, setSelectedBuildingType] = useState<string | null>(null)

  const resetToStart = () => {
    setSelectedPlanId(null)
    setPlanDetail(null)
    setSelectedFieldId(null)
    setSelectedPlotId(null)
    setSelectedBuildingType(null)
  }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return

    setPlansLoading(true)
    setPlansError(null)

    listPlans()
      .then(setPlans)
      .catch(error => setPlansError(error instanceof Error ? error.message : 'Kunne ikke laste reguleringsplaner'))
      .finally(() => setPlansLoading(false))
  }, [open])

  useEffect(() => {
    if (!selectedPlanId) {
      setPlanDetail(null)
      return
    }

    setPlanLoading(true)
    getPlan(selectedPlanId)
      .then(plan => {
        setPlanDetail(plan)
        setSelectedFieldId(null)
        setSelectedPlotId(null)
        setSelectedBuildingType(null)
      })
      .finally(() => setPlanLoading(false))
  }, [selectedPlanId])

  const selectedField = useMemo(
    () => planDetail?.fields.find(field => field.id === selectedFieldId) ?? null,
    [planDetail, selectedFieldId],
  )

  const selectedPlot = useMemo(
    () => selectedField?.plots.find(plot => plot.id === selectedPlotId) ?? null,
    [selectedField, selectedPlotId],
  )

  const selectedType = useMemo(
    () => planDetail?.buildingTypes.find(type => type.code === selectedBuildingType) ?? null,
    [planDetail, selectedBuildingType],
  )

  const phase: Phase = useMemo(() => {
    if (!selectedPlanId) return 'plans'
    if (!selectedFieldId) return 'fields'
    if (!selectedPlotId) return 'plots'
    if (!selectedBuildingType) return 'types'
    return 'results'
  }, [selectedPlanId, selectedFieldId, selectedPlotId, selectedBuildingType])

  const filteredBestemmelser = useMemo(() => {
    if (!planDetail || !selectedFieldId || !selectedPlotId || !selectedBuildingType) return []
    return planDetail.bestemmelser.filter(item =>
      includesScope(item, selectedFieldId, selectedPlotId, selectedBuildingType),
    )
  }, [planDetail, selectedFieldId, selectedPlotId, selectedBuildingType])

  const currentStep = phase === 'plans' ? 1 : phase === 'fields' ? 2 : phase === 'plots' ? 3 : phase === 'types' ? 4 : 5
  const progressPercent = Math.round((currentStep / 5) * 100)

  const groupedBestemmelser = useMemo(() => {
    const grouped = new Map<
      number | string,
      {
        titleLabel: string | null
        entries: Array<{
          content: string
          galleriItems: PlanDetail['bestemmelser'][number]['galleriItems']
        }>
      }
    >()

    for (const item of filteredBestemmelser) {
      const key = item.titleId ?? 'null'
      if (!grouped.has(key)) {
        grouped.set(key, {
          titleLabel: item.titleLabel ?? 'Bestemmelse',
          entries: [],
        })
      }
      grouped.get(key)!.entries.push({
        content: item.content,
        galleriItems: item.galleriItems ?? [],
      })
    }

    return Array.from(grouped.values())
  }, [filteredBestemmelser])

  const plotLabel = (plotId: number, name?: string | null) => name ?? `Tomt #${plotId}`

  const goBack = () => {
    if (phase === 'results') {
      setSelectedBuildingType(null)
      return
    }
    if (phase === 'types') {
      setSelectedPlotId(null)
      return
    }
    if (phase === 'plots') {
      setSelectedFieldId(null)
      return
    }
    if (phase === 'fields') {
      resetToStart()
      return
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="uwm-backdrop" onClick={onClose}>
      <div className="uwm-panel" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true">
        <header className="uwm-header">
          <div>
            <p className="uwm-kicker">Veileder</p>
            <h2>Bestemmelser for din tomt basert på byggetiltak</h2>
          </div>
          <button type="button" className="uwm-close-btn" onClick={onClose} aria-label="Lukk veileder">
            <X size={20} />
          </button>
        </header>

        <div className="uwm-progress" aria-label="Fremdrift i veileder">
          <div className="uwm-progress__meta">
            <span>Steg {currentStep} av 5</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="uwm-progress__track">
            <span className="uwm-progress__fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <nav className="uwm-breadcrumb" aria-label="Valgsti">
          <button type="button" className="uwm-breadcrumb__link" onClick={resetToStart}>
            Reguleringsplaner
          </button>
          {planDetail && (
            <>
              <ChevronRight size={14} className="uwm-breadcrumb__sep" />
              <button type="button" className="uwm-breadcrumb__link" onClick={() => setSelectedFieldId(null)}>
                {planDetail.name}
              </button>
            </>
          )}
          {selectedField && (
            <>
              <ChevronRight size={14} className="uwm-breadcrumb__sep" />
              <button type="button" className="uwm-breadcrumb__link" onClick={() => setSelectedPlotId(null)}>
                {selectedField.fieldName}
              </button>
            </>
          )}
          {selectedPlot && (
            <>
              <ChevronRight size={14} className="uwm-breadcrumb__sep" />
              <span>{plotLabel(selectedPlot.id, selectedPlot.plotName)}</span>
            </>
          )}
          {selectedType && (
            <>
              <ChevronRight size={14} className="uwm-breadcrumb__sep" />
              <span>{selectedType.name}</span>
            </>
          )}
        </nav>

        <section className="uwm-content">
          {phase === 'plans' && (
            <div className="uwm-section">
              <h3>1. Velg reguleringsplan</h3>
              {plansLoading && <p className="uwm-muted">Laster planer…</p>}
              {plansError && <p className="uwm-error">{plansError}</p>}
              <ul className="uwm-card-list">
                {plans.map(plan => (
                  <li
                    key={plan.id}
                    className={`uwm-card${selectedPlanId === plan.id ? ' uwm-card--active' : ''}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <div className="uwm-card__icon"><Layers size={20} /></div>
                    <div className="uwm-card__info">
                      <span className="uwm-card__title">{plan.name}</span>
                      <span className="uwm-card__meta">Plan-ID: {plan.plan_id}</span>
                    </div>
                    <ChevronRight size={18} className="uwm-card__arrow" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase === 'fields' && (
            <div className="uwm-section">
              <h3>2. Velg felt</h3>
              {planLoading && <p className="uwm-muted">Laster felt…</p>}
              <ul className="uwm-card-list">
                {planDetail?.fields.map(field => (
                  <li
                    key={field.id}
                    className={`uwm-card${selectedFieldId === field.id ? ' uwm-card--active' : ''}`}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    <div className="uwm-card__icon"><Layout size={20} /></div>
                    <div className="uwm-card__info">
                      <span className="uwm-card__title">{field.fieldName}</span>
                      <span className="uwm-card__meta">{field.plots.length} tomter</span>
                    </div>
                    <ChevronRight size={18} className="uwm-card__arrow" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase === 'plots' && selectedField && (
            <div className="uwm-section">
              <h3>3. Velg tomt i {selectedField.fieldName}</h3>
              <ul className="uwm-card-list">
                {selectedField.plots.map(plot => (
                  <li
                    key={plot.id}
                    className={`uwm-card${selectedPlotId === plot.id ? ' uwm-card--active' : ''}`}
                    onClick={() => setSelectedPlotId(plot.id)}
                  >
                    <div className="uwm-card__icon"><MapPin size={20} /></div>
                    <div className="uwm-card__info">
                      <span className="uwm-card__title">{plotLabel(plot.id, plot.plotName)}</span>
                    </div>
                    <ChevronRight size={18} className="uwm-card__arrow" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase === 'types' && (
            <div className="uwm-section">
              <h3>4. Hva skal du bygge?</h3>
              <div className="uwm-list uwm-list--grid">
                {planDetail?.buildingTypes.map(type => (
                  <button
                    key={type.code}
                    type="button"
                    className={`uwm-option${selectedBuildingType === type.code ? ' uwm-option--active' : ''}`}
                    onClick={() => setSelectedBuildingType(type.code)}
                  >
                    <span className="uwm-option__icon">{getBuildingTypeIcon(type.name)}</span>
                    <strong>{type.name}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'results' && (
            <div className="uwm-section">
              <h3>5. Regler for din tomt</h3>
                {groupedBestemmelser.length === 0 ? (
                <p className="uwm-muted">Ingen bestemmelser funnet for valgene dine.</p>
              ) : (
                <div className="uwm-rules">
                    {groupedBestemmelser.map((group, index) => (
                      <article key={index} className="uwm-rule">
                        <h4>{group.titleLabel}</h4>
                        <div>
                          {group.entries.map((entry, entryIndex) => (
                            <div key={entryIndex} className="uwm-rule-entry">
                              {entry.content && entry.content.trim() && (
                                <p>{entry.content}</p>
                              )}
                                {entry.galleriItems.length > 0 && (
                                  <div className="uwm-gallery-stack">
                                    {entry.galleriItems.map(galleryItem => {
                                        const hasImage = galleryItem.bildefilnavn?.trim()
                                        const hasText = galleryItem.forklaringstekst?.trim()
                                        
                                        if (!hasImage && !hasText) return null
                                        
                                        return (
                                          <div key={`${galleryItem.id}-${galleryItem.tema_tittel_galleri_id}`} className="uwm-gallery-item">
                                            <h4 className="uwm-gallery-item-title">{galleryItem.overskrift}</h4>
                                            <div className={`uwm-gallery-item-content${hasImage && hasText ? ' uwm-gallery-item-content--with-image' : ''}`}>
                                              {hasImage && (
                                                <div className="uwm-gallery-item-image-wrapper">
                                                  <img
                                                    src={`${BASE_PATH}public/galleri/${galleryItem.bildefilnavn}`}
                                                    alt={galleryItem.overskrift}
                                                    className="uwm-gallery-item-image"
                                                    loading="lazy"
                                                  />
                                                </div>
                                              )}
                                              {hasText && (
                                                <p className="uwm-gallery-item-text">{galleryItem.forklaringstekst}</p>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      })}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <footer className="uwm-footer">
          <button type="button" className="uwm-nav-btn uwm-nav-btn--light" onClick={goBack}>
            <ArrowLeft size={16} />
            {phase === 'plans' ? 'Lukk' : 'Tilbake'}
          </button>
          {phase === 'results' ? (
            <button type="button" className="uwm-nav-btn" onClick={onClose}>
              Fullfør
            </button>
          ) : (
            <button type="button" className="uwm-nav-btn" onClick={onClose}>
              Avslutt
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
