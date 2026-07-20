import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import './Navbar.css'

export default function Navbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)

  async function onLogout() {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        Fit Counter
      </Link>
      {user && (
        <nav className="navbar__links">
          <Link to="/">Dziennik</Link>
          <Link to="/products">Produkty</Link>
          <button className="navbar__logout" onClick={onLogout}>
            Wyloguj
          </button>
        </nav>
      )}
    </header>
  )
}
