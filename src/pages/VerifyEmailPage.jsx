import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { verifyEmail } from '../api/auth'
import Input from '../components/ui/Input'
import { GradCapIcon, Wordmark } from '../components/ui/Logo'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.')
      return
    }
    if (code.length < 6) {
      setError('El código debe tener al menos 6 caracteres.')
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await verifyEmail(email, code)
      setSuccess('¡Correo verificado con éxito! Redirigiendo al inicio de sesión...')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al verificar el código.')
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
            Verifica tu cuenta para comenzar a utilizar tu asistente académico.
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
              <h1 className="text-[22px] font-bold text-slate-900 leading-tight">Verifica tu correo</h1>
              <p className="mt-1.5 text-sm text-slate-500">Ingresa el código que enviamos a tu correo</p>
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
              <Input
                label="Código de verificación"
                type="text"
                placeholder="Ej. 123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 animate-fade-in">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all
                  bg-gradient-to-r from-brand to-accent hover:opacity-90 active:scale-[0.98]
                  shadow-lg shadow-brand/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando…' : 'Verificar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
