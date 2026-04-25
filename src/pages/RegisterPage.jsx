import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import { GradCapIcon, Wordmark } from '../components/ui/Logo'
import { registerErrorMessage } from '../lib/authMessages'

const FEATURES = [
  { icon: '📐', label: 'Hipótesis y variables de investigación' },
  { icon: '📚', label: 'Marco teórico y citas APA 7' },
  { icon: '🔬', label: 'Metodología cuantitativa y cualitativa' },
  { icon: '✍️', label: 'Estructura y redacción académica' },
]

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/chat" replace />

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.fullName, form.password)
      navigate('/chat')
    } catch (err) {
      setError(registerErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden items-center justify-center
        bg-[#0B0E27]">

        {/* Ambient blob glows */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#1E40AF]/30 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-[380px] h-[380px] rounded-full bg-[#7C3AED]/35 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[280px] h-[280px] rounded-full bg-[#4338CA]/20 blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-xs px-8 text-center animate-fade-in">
          <GradCapIcon className="size-20 mx-auto mb-6 drop-shadow-xl" />

          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
            IrvinBot
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Tu asistente académico especializado en metodología de investigación y redacción de tesis.
          </p>

          <div className="mt-10 flex flex-col gap-3.5 text-left">
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className="flex items-center gap-3 animate-slide-in-left"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="size-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-sm shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm text-slate-400">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12
        bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20">

        <div className="w-full max-w-sm animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <GradCapIcon className="size-9" />
            <Wordmark className="text-2xl" />
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/70 ring-1 ring-slate-100">

            <div className="mb-7">
              <h1 className="text-[22px] font-bold text-slate-900 leading-tight">Crea tu cuenta</h1>
              <p className="mt-1.5 text-sm text-slate-500">Comienza a trabajar en tu tesis hoy</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Nombre completo"
                type="text"
                placeholder="María González"
                value={form.fullName}
                onChange={set('fullName')}
                required
                autoFocus
              />
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="tu@universidad.edu"
                value={form.email}
                onChange={set('email')}
                required
              />
              <Input
                label="Contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={set('password')}
                required
                minLength={8}
              />

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all
                  bg-gradient-to-r from-brand to-accent hover:opacity-90 active:scale-[0.98]
                  shadow-lg shadow-brand/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400">o</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <p className="mt-4 text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-semibold text-brand hover:text-accent transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
