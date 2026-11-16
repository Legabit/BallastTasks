import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { PublicRoute } from './components/routing/PublicRoute'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { TaskDashboard } from './pages/TaskDashboard'
import { HealthView } from './pages/HealthView'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<TaskDashboard />} />
              <Route path="/health" element={<HealthView />} />
            </Route>
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
