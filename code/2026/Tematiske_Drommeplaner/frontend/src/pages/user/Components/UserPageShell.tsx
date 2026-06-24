import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserWizardModal } from './UserWizardModal.tsx'
import './UserPageShell.css'

export function UserPageShell() {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="ups-page">
      <header className="ups-header">
        <div className="ups-header__inner">
          <h1>Hva gjelder for min eiendom?</h1>
          <p>
         På denne siden får du oversiktlig og forståelig informasjon om din eiendom på en digital plattform. Drømmeplan er et prosjekt fra Direktoratet for byggkvalitet, og er utviklet for å gjøre det enklere for deg å forstå hvilke regler og muligheter som gjelder for din eiendom. Du kan se alle bestemmelser som gjelder for din eiendom, eller bruke veilederen til å få tilpasset informasjon basert på hva du ønsker å bygge. 
          </p>
          <div className="ups-btn-group">
            <Link to="/reguleringsplaner" className="ups-start-btn">
              Se reguleringsbestemmelser for din eiendom
            </Link>
            <button type="button" className="ups-start-btn ups-start-btn--outline" onClick={() => setWizardOpen(true)}>
             Veileder basert på byggetiltak
            </button>
          </div>
        </div>
      </header>

      <UserWizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  )
}