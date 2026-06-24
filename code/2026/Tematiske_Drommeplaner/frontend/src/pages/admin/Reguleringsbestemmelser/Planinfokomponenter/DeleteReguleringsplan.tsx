import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2, X } from 'lucide-react'
import { deletePlan } from '../../../../api/adminApi'
import './DeleteReguleringsplan.css'

interface DeleteReguleringsplanButtonProps {
  planName: string
  onConfirmDelete?: () => void
}

interface DeletePlanConfirmModalProps {
  onConfirm: () => void
  onClose: () => void
}


export function DeleteReguleringsplanButton({
  planName,
  onConfirmDelete,
}: DeleteReguleringsplanButtonProps) {
  void planName
  const navigate = useNavigate()
  const { planId } = useParams<{ planId: string }>()
  const [open, setOpen] = useState(false)

  const handleConfirm = async () => {
    if (onConfirmDelete) {
      onConfirmDelete()
      setOpen(false)
      return
    }

    const numericPlanId = Number(planId)
    if (!numericPlanId || Number.isNaN(numericPlanId)) {
      setOpen(false)
      return
    }

    await deletePlan(numericPlanId)
    navigate('/reguleringsplaner')
    setOpen(false)
  }

  return (
    <>
      <button type="button" className="edp-btn" onClick={() => setOpen(true)}>
        <Trash2 size={15} aria-hidden="true" />
        Slett Reguleringsplan
      </button>

      {open && (
        <DeletePlanConfirmModal
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}

function DeletePlanConfirmModal({ onConfirm, onClose }: DeletePlanConfirmModalProps) {
  return (
    <div className="edm-overlay" role="dialog" aria-modal="true" aria-label="Slett reguleringsplan">
      <div className="edm-modal">
        <div className="edm-header">
          <h3 className="edm-title">Slette reguleringsplan?</h3>
          <button type="button" className="edm-close" aria-label="Lukk" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <p className="edm-text">
          Er du sikker på at du vil slette reguleringsplanen? 
          <br />
          Handlingen kan ikke angres.
        </p>

        <div className="edm-actions">
          <button type="button" className="edm-btn edm-btn--primary" onClick={onConfirm}>
            Slett
          </button>
          <button type="button" className="edm-btn edm-btn--secondary" onClick={onClose}>
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}


