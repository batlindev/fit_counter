import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { register } from '../../store/slices/authSlice'
import './Auth.css'

export default function Register() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error } = useAppSelector((s) => s.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [info, setInfo] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setInfo(null)
    const res = await dispatch(register({ email, password }))
    if (register.fulfilled.match(res)) {
      if (res.payload) navigate('/')
      else setInfo('Sprawdź email — wymagane potwierdzenie rejestracji.')
    }
  }

  return (
    <main className="auth">
      <h1 className="auth__title">Załóż konto</h1>
      <p className="auth__sub">Zacznij liczyć kalorie.</p>

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
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="auth__submit" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Rejestracja…' : 'Zarejestruj się'}
        </button>
        {error && <p className="auth__err">{error}</p>}
        {info && <p>{info}</p>}
      </form>

      <p className="auth__alt">
        Masz już konto? <Link to="/login">Zaloguj się</Link>
      </p>
    </main>
  )
}
