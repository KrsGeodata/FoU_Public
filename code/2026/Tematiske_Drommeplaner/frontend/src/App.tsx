import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LoginPage } from './pages/admin/Login/LoginPage'
import { ReguleringsplanPage } from './pages/admin/Reguleringsplan/ReguleringsplanPage'
import { CreateReguleringsplanPage } from './pages/admin/Opprett/CreateReguleringsplanPage'
import { EditReguleringsplanPage } from './pages/admin/Reguleringsbestemmelser/EditReguleringsplanPage'
import { UserPage } from './pages/user/UserPage'
import { Footer } from './layout/Footer'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'

function App() {
	const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

	return (
		<AuthProvider>
			<Router basename={basename}>
				<Routes>
					<Route path="/" element={<UserPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/reguleringsplaner" element={<ReguleringsplanPage />} />
					<Route
						path="/reguleringsplaner/opprett"
						element={
							<ProtectedRoute>
								<CreateReguleringsplanPage />
							</ProtectedRoute>
						}
					/>
					<Route path="/reguleringsplaner/plan/:planId/bestemmelser" element={<EditReguleringsplanPage />} />
				</Routes>
				<Footer />
			</Router>
		</AuthProvider>
	)
}

export default App