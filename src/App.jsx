import { Navigate, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Dashboard from '@/pages/Dashboard'
import History from '@/pages/History'
import Leaderboard from '@/pages/Leaderboard'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const protectedPaths = ['/', '/dashboard', '/history', '/leaderboard', '/settings']

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {protectedPaths.map((p) => (
        <Route
          key={p}
          path={p}
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
      ))}

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
