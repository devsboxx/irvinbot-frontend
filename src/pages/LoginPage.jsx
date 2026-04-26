import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import { GradCapIcon, Wordmark } from '../components/ui/Logo'
import { loginErrorMessage } from '../lib/authMessages'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/chat" replace />

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/chat')
    } catch (err) {
      setError(loginErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden items-center justify-center
        bg-gradient-to-br from-violet-600 via-purple-500 to-pink-400">

        {/* Animated blobs */}
        <div className="animate-blob absolute -top-28 -left-28 w-[440px] h-[440px] rounded-full
          bg-indigo-400/50 blur-[90px] pointer-events-none" />
        <div className="animate-blob-slow absolute -bottom-20 -right-16 w-[360px] h-[360px] rounded-full
          bg-rose-300/50 blur-[80px] pointer-events-none" />
        <div className="animate-blob absolute top-1/2 left-1/4 w-[260px] h-[260px] rounded-full
          bg-fuchsia-300/30 blur-[70px] -translate-y-1/2 pointer-events-none"
          style={{ animationDelay: '3s' }} />

        {/* Dot texture */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '26px 26px' }} />

        <div className="relative z-10 max-w-[280px] px-6 text-center animate-fade-in">
          <div className="relative inline-flex mb-7">
            <div className="absolute inset-0 scale-[2] blur-2xl bg-white/25 rounded-full pointer-events-none" />
            <GradCapIcon className="size-24 relative drop-shadow-2xl" />
          </div>

          <h2 className="text-[28px] font-bold text-white tracking-tight mb-2">IrvinBot</h2>
          <p className="text-white/65 text-sm leading-relaxed mb-8">
            Tu asistente académico para metodología de investigación y redacción de tesis.
          </p>

          <blockquote className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-left">
            <p className="text-white/80 text-sm italic leading-relaxed">
              "La investigación es ver lo que todos han visto y pensar lo que nadie ha pensado."
            </p>
            <cite className="mt-3 block text-[11px] text-white/45 not-italic">— Albert Szent-Györgyi</cite>
          </blockquote>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12
        bg-gradient-to-br from-violet-50/60 via-white to-rose-50/40 relative">

        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #7C3AED 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative w-full max-w-sm animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <GradCapIcon className="size-11" />
            <Wordmark className="text-2xl" />
          </div>

          {/* Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden
            shadow-2xl shadow-violet-200/40 ring-1 ring-violet-100/70">

            <div className="h-1 bg-gradient-to-r from-indigo-400 via-violet-500 to-pink-400" />

            <div className="p-8">
              <div className="mb-7">
                <h1 className="text-[22px] font-bold leading-tight gradient-text">
                  Bienvenido de nuevo
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">Accede a tu asistente de tesis</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="tu@universidad.edu"
                  icon={Mail}
                  value={form.email}
                  onChange={set('email')}
                  required
                  autoFocus
                />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={form.password}
                  onChange={set('password')}
                  required
                />

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 animate-fade-in">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={2} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-shimmer mt-1 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white
                    active:scale-[0.98] shadow-lg shadow-violet-300/40
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Iniciando sesión…'
                  ) : (
                    <>
                      <LogIn className="size-4" strokeWidth={2} />
                      Iniciar sesión
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-xs text-slate-400">o</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <p className="mt-4 text-center text-sm text-slate-500">
                ¿No tienes cuenta?{' '}
                <Link to="/register"
                  className="font-semibold text-violet-600 hover:text-pink-500 transition-colors">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
