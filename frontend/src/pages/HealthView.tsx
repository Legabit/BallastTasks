import React, { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw, Database, Server, Cpu, ShieldCheck } from 'lucide-react'
import { apiClient } from '../api/client'
import axios from 'axios'

interface HealthResponse {
  status: string
  database: string
  cache: string
}

export const HealthView: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get<HealthResponse>('/api/health/')
      setHealth(response.data)
      setLastChecked(new Date())
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
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Health</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time diagnostics for Backend, PostgreSQL, and Redis
          </p>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-4 py-2 rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Backend Offline or Unreachable</p>
            <p className="text-xs mt-1 text-red-600">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Backend Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Server className="w-6 h-6" />
              </div>
              <span className={`inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                health?.status === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {health?.status === 'ok' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Operational</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Degraded</span>
                  </>
                )}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Django REST API</h3>
              <p className="text-xs text-slate-500 mt-1">Gunicorn / Django 5.2 Python 3.12</p>
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <span className={`inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                health?.database === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {health?.database === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Disconnected</span>
                  </>
                )}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">PostgreSQL 15</h3>
              <p className="text-xs text-slate-500 mt-1">Primary relational storage & transactions</p>
            </div>
          </div>

          {/* Cache & Broker Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Cpu className="w-6 h-6" />
              </div>
              <span className={`inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                health?.cache === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {health?.cache === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Disconnected</span>
                  </>
                )}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Redis 7</h3>
              <p className="text-xs text-slate-500 mt-1">Celery Broker & in-memory cache</p>
            </div>
          </div>
        </div>
      )}

      {/* Security & Verification Callout */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start space-x-4">
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Security & Token Rotation Active</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            JWT session authorization headers are actively verified on all requests.
            Automatic refresh token rotation and blacklisting are enforced.
          </p>
          {lastChecked && (
            <p className="text-[10px] text-slate-400 mt-2">
              Last health ping: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
