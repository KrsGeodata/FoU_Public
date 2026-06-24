import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../auth/AuthContext'
import './LoginPage.css'

export function LoginPage() {
	const navigate = useNavigate()
	const { login, isAuthenticated } = useAuth()
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (isAuthenticated) {
			navigate('/reguleringsplaner')
		}
	}, [isAuthenticated, navigate])

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setSubmitting(true)
		setError(null)
		try {
			await login(username, password)
			navigate('/reguleringsplaner')
		} catch {
			setError('Ugyldig brukernavn eller passord')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<main className="login-page">
			<section className="login-container" aria-labelledby="login-title">
				<div className="login-panel login-panel-brand">
					<p className="login-kicker">Kristiansand kommune</p>
					<h1 id="login-title" className="login-title">
						Tematiske drømmeplaner
					</h1>
					<p className="login-description">
						Innlogging for saksbehandlere.
					</p>
				</div>

				<form className="login-panel login-panel-form" onSubmit={handleSubmit}>
					<h2 className="login-form-title">Logg inn</h2>
					{error && <p style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</p>}

					<label className="login-field">
						<span>Brukernavn</span>
						<input
							type="text"
							name="username"
							autoComplete="username"
							placeholder="Skriv inn brukernavn"
							value={username}
							onChange={event => setUsername(event.target.value)}
							required
						/>
					</label>

					<label className="login-field">
						<span>Passord</span>
						<input
							type="password"
							name="password"
							autoComplete="current-password"
							placeholder="Skriv inn passord"
							value={password}
							onChange={event => setPassword(event.target.value)}
							required
						/>
					</label>

					<button type="submit" className="login-button" disabled={submitting}>
						Logg inn
					</button>
				</form>
			</section>
		</main>
	)
}
