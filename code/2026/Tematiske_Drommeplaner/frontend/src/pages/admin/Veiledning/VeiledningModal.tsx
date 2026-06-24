import { useEffect } from 'react'
import { Download, X } from 'lucide-react'
import './VeiledningModal.css'

interface Props {
  open: boolean
  onClose: () => void
  pdfUrl?: string
}

export function VeiledningModal({
  open,
  onClose,
  pdfUrl = '/mikro-drommeplan/drommeplan-steg-for-steg.pdf',
}: Props) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="guide-modal__backdrop" onClick={onClose}>
      <div
        className="guide-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Veiledning"
        onClick={event => event.stopPropagation()}
      >
        <header className="guide-modal__header">
          <h2 className="guide-modal__title">Veiledning</h2>
          <button type="button" className="guide-modal__icon-btn" onClick={onClose} aria-label="Lukk veiledning">
            <X size={22} />
          </button>
        </header>

        <div className="guide-modal__viewer">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
            className="guide-modal__iframe"
            title="Drømmeplan – steg for steg"
          />
        </div>

        <footer className="guide-modal__footer">
          <a className="guide-modal__download" href={pdfUrl} download>
            <Download size={16} />
            Last ned PDF
          </a>
          <button type="button" className="guide-modal__close" onClick={onClose}>
            Lukk
          </button>
        </footer>
      </div>
    </div>
  )
}
