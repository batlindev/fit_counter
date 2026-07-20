import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import RequireAuth from './components/RequireAuth'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import Dashboard from './features/dashboard/Dashboard'
import Products from './features/products/Products'
import { useAppDispatch } from './store/hooks'
import { loadSession } from './store/slices/authSlice'

export default function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(loadSession())
  }, [dispatch])

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/products"
          element={
            <RequireAuth>
              <Products />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  )
}
