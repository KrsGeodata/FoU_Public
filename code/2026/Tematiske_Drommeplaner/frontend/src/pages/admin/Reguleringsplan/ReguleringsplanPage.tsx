import { useState, useEffect } from 'react'
import './ReguleringsplanPage.css'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../../../layout/Navbar'
import { listPlans, type PlanListItem } from '../../../api/adminApi'
import { useAuth } from '../../../auth/AuthContext'

export function ReguleringsplanPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [plans, setPlans] = useState<PlanListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await listPlans()
        setPlans(data)
      } catch (err: any) {
        console.error(err)
        setError('Kunne ikke hente reguleringsplaner')
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [])

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('nb-NO') : '—'

  return (
    <div className="adm-page">
      <Navbar />
      <div className="adm-content">
        <h1 className="adm-title">Reguleringsplaner</h1>

        <table className="adm-table">
          <thead>
            <tr>
              <th>Plan-ID</th>
              <th>Navn</th>
              <th>Felt / Delområder</th>
              <th>Tomter</th>
              <th>Vedtatt dato</th>
              <th>Sist oppdatert</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af' }}>
                  Laster...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'red' }}>
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && plans.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af' }}>
                  Ingen reguleringsplaner funnet.
                </td>
              </tr>
            )}

            {plans.map(plan => (
              <tr
                key={plan.id}
                className="adm-table__row--clickable"
                onClick={() => navigate(`/reguleringsplaner/plan/${plan.id}/bestemmelser`)}
              >
                <td>{plan.plan_id}</td>
                <td>{plan.name}</td>
                <td>{plan.field_count}</td>
                <td>{plan.plot_count}</td>
                <td>{formatDate(plan.adopted_date)}</td>
                <td>{formatDate(plan.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {isAuthenticated && (
          <button
            className="adm-create-btn"
            onClick={() => navigate('/reguleringsplaner/opprett')}
          >
            Opprett ny reguleringsplan
          </button>
        )}
      </div>
    </div>
  )
}