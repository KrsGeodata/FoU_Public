import { useEffect } from 'react'
import { X } from 'lucide-react'
import './DeleteBestemmelseModal.css'

interface Props {
  title: string
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

export function DeleteBestemmelseModal({ title, onConfirm, onClose }: Props) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="bdm-overlay" onClick={onClose}>
      <div className="bdm-panel" onClick={event => event.stopPropagation()}>
        <button type="button" className="bdm-close" onClick={onClose} aria-label="Lukk">
          <X size={22} />
        </button>

        <h2 className="bdm-title">Slette bestemmelse?</h2>
        <p className="bdm-text">
          Er du sikker på at du vil slette bestemmelsen «{title}»? Handlingen kan ikke angres.
        </p>

        <div className="bdm-actions">
          <button
            type="button"
            className="bdm-btn bdm-btn--danger"
            onClick={() => {
              void Promise.resolve(onConfirm()).finally(onClose)
            }}
          >
            Slett
          </button>
          <button type="button" className="bdm-btn bdm-btn--secondary" onClick={onClose}>
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}
