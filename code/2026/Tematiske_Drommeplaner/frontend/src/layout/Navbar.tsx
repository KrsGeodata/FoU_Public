import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpenText, User, LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { VeiledningModal } from '../pages/admin/Veiledning/VeiledningModal'
import './Navbar.css'

export function Navbar() {
	const [guideOpen, setGuideOpen] = useState(false)
	const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
	const navigate = useNavigate()
	const { isAuthenticated, logout } = useAuth()

	async function handleLogout() {
		setLogoutConfirmOpen(false)
		await logout()
		navigate('/reguleringsplaner')
	}

	return (
		<>
			<header className="admin-navbar">
				<div className="admin-navbar__inner">
					<button
						type="button"
						className="admin-navbar__brand admin-navbar__brand--link"
						onClick={() => navigate('/')}
					>
						<h1 className="admin-navbar__title">Min drømmeplan</h1>
						<p className="admin-navbar__subtitle">Kristiansand kommune</p>
					</button>

					<div className="admin-navbar__actions">
						{isAuthenticated && (
							<button
								type="button"
								className="admin-navbar__button admin-navbar__button--ghost"
								onClick={() => setGuideOpen(true)}
							>
								<BookOpenText size={16} strokeWidth={2} aria-hidden="true" />
								Veiledning
							</button>
						)}
						{isAuthenticated ? (
							<button
								type="button"
								className="admin-navbar__button admin-navbar__button--outline"
								onClick={() => setLogoutConfirmOpen(true)}
							>
								<LogOut size={16} strokeWidth={2} aria-hidden="true" />
								Logg ut
							</button>
						) : (
							<button
								type="button"
								className="admin-navbar__button admin-navbar__button--outline"
								onClick={() => navigate('/login')}
							>
								<User size={16} strokeWidth={2} aria-hidden="true" />
								Logg inn
							</button>
						)}
					</div>
				</div>
			</header>

			<VeiledningModal open={guideOpen} onClose={() => setGuideOpen(false)} />

			{logoutConfirmOpen && (
				<div className="admin-navbar__confirm-overlay" onClick={() => setLogoutConfirmOpen(false)}>
					<div className="admin-navbar__confirm-dialog" onClick={e => e.stopPropagation()}>
						<p className="admin-navbar__confirm-text">Er du sikker på at du vil logge ut?</p>
						<div className="admin-navbar__confirm-actions">
							<button
								type="button"
								className="admin-navbar__button admin-navbar__button--ghost"
								onClick={() => setLogoutConfirmOpen(false)}
							>
								Avbryt
							</button>
							<button
								type="button"
								className="admin-navbar__button admin-navbar__button--outline"
								onClick={handleLogout}
							>
								<LogOut size={16} strokeWidth={2} aria-hidden="true" />
								Logg ut
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}