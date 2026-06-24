import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getPlan } from '../../../../api/adminApi'
import './EditorTopSection.css'

export type EditorTab = 'bestemmelser' | 'planinformasjon'

interface Props {
  planId?: string
  activeTab: EditorTab
  onBackToPlans: () => void
  onTabChange: (tab: EditorTab) => void
}

export function EditorTopSection({ planId: providedPlanId, activeTab, onBackToPlans, onTabChange }: Props) {
  const { planId: routePlanId } = useParams<{ planId: string }>()
  const [planName, setPlanName] = useState<string | null>(null)
  const [planId, setPlanId] = useState<string | null>(null)

  const requestPlanId = providedPlanId || routePlanId

  useEffect(() => {
    const id = Number(requestPlanId)
    if (!id || Number.isNaN(id)) return

    getPlan(id)
      .then(data => {
        setPlanName(data.name)
        setPlanId(data.planId)
      })
      .catch(() => {
        setPlanName(null)
        setPlanId(null)
      })
  }, [requestPlanId])
  return (
    <>
      <nav className="editor-breadcrumb">
        <button onClick={onBackToPlans}>Reguleringsplaner</button>
        <ChevronRight size={14} />
        <span>{planName ?? '—'}</span>
        <ChevronRight size={14} />
        <span>{activeTab === 'bestemmelser' ? 'Bestemmelser' : 'Planinformasjon'}</span>
      </nav>

      <div className="editor-heading-row">
        <h1 className="editor-heading">{planName ?? '—'}</h1>
        <span className="editor-plan-id">(Plan-ID: {planId ?? '—'})</span>
      </div>

      <div className="editor-tabs" role="tablist" aria-label="Redigeringsseksjoner">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'bestemmelser'}
          className={`editor-tab${activeTab === 'bestemmelser' ? ' editor-tab--active' : ''}`}
          onClick={() => onTabChange('bestemmelser')}
        >
          Bestemmelser
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'planinformasjon'}
          className={`editor-tab${activeTab === 'planinformasjon' ? ' editor-tab--active' : ''}`}
          onClick={() => onTabChange('planinformasjon')}
        >
          Planinformasjon
        </button>
      </div>
    </>
  )
}
