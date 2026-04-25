import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerApi } from '../api/auth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerApi(form.email, form.password, form.full_name)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.message ?? 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex size-14 items-center justify-center rounded-2xl bg-indigo-600 text-3xl shadow-lg">
            🤖
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Irvinbot</h1>
          <p className="mt-1 text-sm text-slate-500">Tu asistente para la tesis</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
        >
          <h2 className="mb-6 text-lg font-semibold text-slate-800">Crear cuenta</h2>

          <div className="flex flex-col gap-4">
            <Input
              label="Nombre completo"
              type="text"
              placeholder="María González"
              value={form.full_name}
              onChange={set('full_name')}
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
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" loading={loading} className="mt-6 w-full">
            Crear cuenta
          </Button>

          <p className="mt-4 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
