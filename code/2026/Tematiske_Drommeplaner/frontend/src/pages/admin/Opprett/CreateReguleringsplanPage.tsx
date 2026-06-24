import { Navbar } from '../../../layout/Navbar'
import './CreateReguleringsplanPage.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, CircleHelp } from 'lucide-react'
import { PlanInfoSection } from './Components/PlanInfoSection'
import { FieldAreasSection } from './Components/FieldAreasSection'
import { useCreateReguleringsplanWorkflow } from './Components/useCreateReguleringsplanWorkflow'

export function CreateReguleringsplanPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'planInfo' | 'fields'>('planInfo')
  const [showHelp, setShowHelp] = useState(false)
  const {
    values,
    setValues,
    fields,
    setFields,
    planSuggestions,
    saving,
    error,
    primaryActionLabel,
    submit,
  } = useCreateReguleringsplanWorkflow()

  return (
    <div className="create-page">
      <Navbar />
      <div className="create-content">
        <nav className="create-breadcrumb">
          <button className="create-breadcrumb__link" onClick={() => navigate('/reguleringsplaner')}>
            Reguleringsplaner
          </button>
          <ChevronRight size={16} className="create-breadcrumb__sep" />
          <span>Ny reguleringsplan</span>
        </nav>

        <header className="create-hero">
          <div className="create-hero__title-row">
            <h1 className="create-hero__title">Opprett ny reguleringsplan</h1>
            <div className="create-hero__help-wrap">
              <button
                type="button"
                className="create-hero__help-btn"
                aria-label={showHelp ? 'Skjul hjelp' : 'Vis hjelp'}
                aria-expanded={showHelp}
                onClick={() => setShowHelp(prev => !prev)}
              >
                <CircleHelp size={20} />
              </button>

              {showHelp && (
                <div className="create-help-popover" role="note">
                  Her kan du opprette en ny reguleringsplan ved å fylle ut nødvendig informasjon og eventuelt legge til felt og delområder. Du kan alltid redigere planen senere for å legge til flere detaljer eller gjøre endringer.
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="create-sections">
          {error && <p style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</p>}
          {step === 'planInfo' ? (
            <section className="create-panel" aria-label="Steg 1 av 2">
              <span className="create-step-chip">Steg 1 av 2 · Planinformasjon</span>
              <PlanInfoSection
                values={values}
                onChange={setValues}
                suggestions={planSuggestions}
                onShowFields={() => setStep('fields')}
                primaryAction={
                  <button type="button" className="create-submit-btn" onClick={submit} disabled={saving}>
                    {primaryActionLabel}
                  </button>
                }
              />
            </section>
          ) : (
            <section className="create-panel" aria-label="Steg 2 av 2">
              <span className="create-step-chip">Steg 2 av 2 · Felt og delområder</span>
              <FieldAreasSection fields={fields} onChange={setFields} />
              <div className="create-actions">
                <button type="button" className="create-back-btn" onClick={() => setStep('planInfo')}>
                  Tilbake til planinformasjon
                </button>
                <button type="button" className="create-submit-btn" onClick={submit} disabled={saving}>
                  {primaryActionLabel}
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}


