import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { User, Mail, Lock, UserPlus, AlertCircle, Lightbulb, BookOpen, FlaskConical, PenLine } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import { GradCapIcon, Wordmark } from '../components/ui/Logo'
import { registerErrorMessage } from '../lib/authMessages'

const FEATURES = [
  { Icon: Lightbulb,    label: 'Hipótesis y variables de investigación', delay: '0ms' },
  { Icon: BookOpen,     label: 'Marco teórico y citas APA 7',            delay: '80ms' },
  { Icon: FlaskConical, label: 'Metodología cuantitativa y cualitativa',  delay: '160ms' },
  { Icon: PenLine,      label: 'Estructura y redacción académica',        delay: '240ms' },
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

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden items-center justify-center
        bg-gradient-to-br from-violet-600 via-purple-500 to-pink-400">

        {/* Animated blobs */}
        <div className="animate-blob absolute -top-28 -left-28 w-[440px] h-[440px] rounded-full
          bg-indigo-400/50 blur-[90px] pointer-events-none" />
        <div className="animate-blob-slow absolute -bottom-20 -right-16 w-[360px] h-[360px] rounded-full
          bg-rose-300/50 blur-[80px] pointer-events-none" />
        <div className="animate-blob absolute bottom-1/3 left-0 w-[220px] h-[220px] rounded-full
          bg-fuchsia-300/30 blur-[60px] pointer-events-none"
          style={{ animationDelay: '4s' }} />

        {/* Dot texture */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '26px 26px' }} />

        <div className="relative z-10 max-w-[280px] px-6 text-center animate-fade-in">
          <div className="relative inline-flex mb-7">
            <div className="absolute inset-0 scale-[2] blur-2xl bg-white/25 rounded-full pointer-events-none" />
            <GradCapIcon className="size-36 relative drop-shadow-2xl" />
          </div>

          <h2 className="text-[28px] font-bold text-white tracking-tight mb-2">IrvinBot</h2>
          <p className="text-white/65 text-sm leading-relaxed mb-8">
            Tu asistente académico especializado en metodología de investigación y redacción de tesis.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-3 text-left">
            {FEATURES.map(({ Icon, label, delay }) => (
              <div
                key={label}
                className="flex items-center gap-3 animate-slide-in-left"
                style={{ animationDelay: delay }}
              >
                <div className="size-9 rounded-xl bg-white/15 border border-white/20
                  flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <Icon className="size-4 text-white/90" strokeWidth={1.8} />
                </div>
                <span className="text-sm text-white/75 leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12
        bg-gradient-to-br from-violet-50/60 via-white to-rose-50/40 relative overflow-y-auto">

        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #7C3AED 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative w-full max-w-sm animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <GradCapIcon className="size-16" />
            <Wordmark className="text-2xl" />
          </div>

          {/* Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden
            shadow-2xl shadow-violet-200/40 ring-1 ring-violet-100/70">

            <div className="h-1 bg-gradient-to-r from-indigo-400 via-violet-500 to-pink-400" />

            <div className="p-6 sm:p-8">
              <div className="mb-7">
                <h1 className="text-[22px] font-bold leading-tight gradient-text">
                  Crea tu cuenta
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">Comienza a trabajar en tu tesis hoy</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Nombre completo"
                  type="text"
                  placeholder="María González"
                  icon={User}
                  value={form.fullName}
                  onChange={set('fullName')}
                  required
                  autoFocus
                />
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="tu@universidad.edu"
                  icon={Mail}
                  value={form.email}
                  onChange={set('email')}
                  required
                />
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  icon={Lock}
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={8}
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
                    'Creando cuenta…'
                  ) : (
                    <>
                      <UserPlus className="size-4" strokeWidth={2} />
                      Crear cuenta
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
                ¿Ya tienes cuenta?{' '}
                <Link to="/login"
                  className="font-semibold text-violet-600 hover:text-pink-500 transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
