import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck, Database, Server } from 'lucide-react'
import axios from 'axios'

interface HealthResponse {
  status: string
  database: string
  cache: string
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get<HealthResponse>('/api/health/')
      setHealth(response.data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.message)
      } else {
        setError('Failed to connect to backend service')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">TaskFlow</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Phase 1
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={checkHealth}
              disabled={loading}
              className="inline-flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Environment & Architecture Foundation
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Task Management System foundation powered by Django 5, Celery, PostgreSQL, Redis, and React.
          </p>
        </div>

        {/* System Health Status Banner */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-8">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-600" />
            Backend Services Health
          </h2>

          {loading ? (
            <div className="flex items-center space-x-3 text-slate-500 text-sm py-4">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Verifying service connectivity...</span>
            </div>
          ) : error ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800">Backend Offline or Unreachable</h3>
                <p className="text-xs text-amber-700 mt-1">
                  {error}. When running locally, ensure backend is running at <code className="bg-amber-100 px-1 py-0.5 rounded">http://localhost:8000</code> or via <code className="bg-amber-100 px-1 py-0.5 rounded">docker compose up</code>.
                </p>
              </div>
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-800 uppercase tracking-wider">API Server</p>
                  <p className="text-lg font-bold text-emerald-900 mt-0.5">{health.status.toUpperCase()}</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">PostgreSQL</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{health.database}</p>
                </div>
                <Database className="w-6 h-6 text-slate-500" />
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">Redis Broker</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{health.cache}</p>
                </div>
                <ShieldCheck className="w-6 h-6 text-slate-500" />
              </div>
            </div>
          ) : null}
        </section>

        {/* Architectural Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">
              PY
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Python 3.12 + Django</h3>
            <p className="text-xs text-slate-500 mt-1">
              Package management powered by uv, clean configuration, and DRF REST endpoints.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-3">
              TS
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">React + Vite Shell</h3>
            <p className="text-xs text-slate-500 mt-1">
              Strict TypeScript types, Tailwind utility styling, and zero console warnings.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3">
              DB
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">PostgreSQL + Redis</h3>
            <p className="text-xs text-slate-500 mt-1">
              Dedicated database layer and Redis caching/broker for Celery workers.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mb-3">
              DK
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Docker Compose</h3>
            <p className="text-xs text-slate-500 mt-1">
              Multi-container orchestration with non-root security and healthchecks.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>Task Management System — Clean Architecture Implementation</p>
          <p className="mt-2 sm:mt-0">Pre-commit • Pytest • Docker Compose v2</p>
        </div>
      </footer>
    </div>
  )
}
