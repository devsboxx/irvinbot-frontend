import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api/auth'
import Input from '../components/ui/Input'
import { GradCapIcon, Wordmark } from '../components/ui/Logo'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setSuccess(true)
      setTimeout(() => navigate('/reset-password', { state: { email } }), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ocurrió un error al procesar tu solicitud.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden items-center justify-center bg-[#0B0E27]">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#1E40AF]/30 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-[380px] h-[380px] rounded-full bg-[#7C3AED]/35 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[280px] h-[280px] rounded-full bg-[#4338CA]/20 blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="relative z-10 max-w-xs px-8 text-center animate-fade-in">
          <GradCapIcon className="size-20 mx-auto mb-6 drop-shadow-xl" />
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
            IrvinBot
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Recupera el acceso a tu cuenta fácilmente.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <GradCapIcon className="size-9" />
            <Wordmark className="text-2xl" />
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/70 ring-1 ring-slate-100">
            <div className="mb-7">
              <h1 className="text-[22px] font-bold text-slate-900 leading-tight">Recuperar Contraseña</h1>
              <p className="mt-1.5 text-sm text-slate-500">Ingresa tu correo para recibir un código de recuperación</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="tu@universidad.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 animate-fade-in">
                  Si el correo está registrado, te enviaremos un código. Redirigiendo...
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all
                  bg-gradient-to-r from-brand to-accent hover:opacity-90 active:scale-[0.98]
                  shadow-lg shadow-brand/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando…' : 'Enviar Código'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              <Link to="/login" className="font-semibold text-brand hover:text-accent transition-colors">
                Volver al inicio de sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
