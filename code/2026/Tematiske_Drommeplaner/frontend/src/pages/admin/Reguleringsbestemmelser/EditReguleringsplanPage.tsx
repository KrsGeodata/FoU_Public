import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPlan } from '../../../api/adminApi'
import { Navbar } from '../../../layout/Navbar'
import './EditReguleringsplanPage.css'
import { EditorTopSection, type EditorTab } from './Layout/EditorTopSection'
import { BestemmelsesEditorSection } from './Bestemmelseskomponenter/BestemmelsesEditorSection'
import { PlaninformasjonEditorSection } from './Planinfokomponenter/PlaninformasjonEditorSection'
import type { LocalField, PlanInfoValues } from './Planinfokomponenter/planinfo-types'
import { useAuth } from '../../../auth/AuthContext'

export function EditReguleringsplanPage() {
  const navigate = useNavigate()
  const { planId } = useParams<{ planId: string }>()
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<EditorTab>('bestemmelser')
  const [planValues, setPlanValues] = useState<PlanInfoValues | undefined>()
  const [planFields, setPlanFields] = useState<LocalField[]>([])

  useEffect(() => {
    const numericPlanId = Number(planId)
    if (!numericPlanId || Number.isNaN(numericPlanId)) return

    getPlan(numericPlanId)
      .then(data => {
        setPlanValues({
          planId: data.planId,
          name: data.name,
          adoptedDate: data.adoptedDate ?? '',
          mapUrl: data.mapUrl ?? '',
          regulationsUrl: data.regulationsUrl ?? '',
          descriptionUrl: data.descriptionUrl ?? '',
        })
        setPlanFields(
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
  }, [planId])

  return (
    <div className="adm-page">
      <Navbar />

      <div className="editor-wrap">
        <EditorTopSection
          planId={planId}
          activeTab={activeTab}
          onBackToPlans={() => navigate('/reguleringsplaner')}
          onTabChange={setActiveTab}
        />

        {activeTab === 'bestemmelser' ? (
          <section className="editor-layout" aria-label="Bestemmelser">
            <BestemmelsesEditorSection readOnly={!isAuthenticated} />
          </section>
        ) : (
          <section className="editor-layout" aria-label="Planinformasjon">
            <PlaninformasjonEditorSection initialValues={planValues} initialFields={planFields} readOnly={!isAuthenticated} />
          </section>
        )}
      </div>
    </div>
  )
}
