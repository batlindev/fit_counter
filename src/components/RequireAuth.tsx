import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAppSelector((s) => s.auth.user)
  const status = useAppSelector((s) => s.auth.status)
  if (!user && status === 'loading') return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
