import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { login } from '../../store/slices/authSlice'
import './Auth.css'

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error } = useAppSelector((s) => s.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const res = await dispatch(login({ email, password }))
    if (login.fulfilled.match(res)) navigate('/')
  }

  return (
    <main className="auth">
      <h1 className="auth__title">Zaloguj się</h1>
      <p className="auth__sub">Wróć do liczenia kalorii.</p>

      <form className="auth__form" onSubmit={onSubmit}>
        <label className="auth__field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="auth__field">
          <span>Hasło</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="auth__submit" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logowanie…' : 'Zaloguj się'}
        </button>
        {error && <p className="auth__err">{error}</p>}
      </form>

      <p className="auth__alt">
        Nie masz konta? <Link to="/register">Zarejestruj się</Link>
      </p>
    </main>
  )
}
