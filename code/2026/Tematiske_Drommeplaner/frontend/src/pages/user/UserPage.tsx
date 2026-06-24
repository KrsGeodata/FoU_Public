import { Navbar } from '../../layout/Navbar'
import { UserPageShell } from './Components/UserPageShell'
import './UserPage.css'

export function UserPage() {
  return (
    <>
      <Navbar />
      <UserPageShell />
    </>
  )
}
