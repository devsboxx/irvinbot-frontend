import { useState, useEffect, useRef, useCallback } from 'react'
import { X, GraduationCap, Wand2, Download, RotateCw, AlertTriangle, Check, Pencil } from 'lucide-react'
import Spinner from '../ui/Spinner'
import { extractObjeto, streamThesisSection } from '../../api/thesis'
import { mdToHtml } from '../../lib/markdown'
import { downloadThesisPdf } from '../../lib/thesisPdf'

// Debe coincidir con el orden del backend (GET /thesis/sections).
const SECTIONS = [
  { key: 'resumen',      titulo: 'Resumen' },
  { key: 'introduccion', titulo: 'Introducción' },
  { key: 'capitulo_1',   titulo: 'Capítulo I — El Problema' },
  { key: 'capitulo_2',   titulo: 'Capítulo II — Marco Teórico' },
  { key: 'capitulo_3',   titulo: 'Capítulo III — Marco Metodológico' },
]

const OBJETO_FIELDS = [
  { name: 'titulo',                label: 'Título (Paso 10)',                          type: 'text' },
  { name: 'coordenadas',          label: 'Coordenadas — dónde y cuándo (Paso 1)',     type: 'text' },
  { name: 'tematicas',            label: 'Temáticas (Paso 2)',                        type: 'list' },
  { name: 'hechos',               label: 'Hechos (Paso 3)',                           type: 'list' },
  { name: 'sintomas',             label: 'Síntomas (Paso 4)',                         type: 'list' },
  { name: 'causas',               label: 'Causas (Paso 5)',                           type: 'list' },
  { name: 'consecuencias',        label: 'Consecuencias (Paso 6)',                    type: 'list' },
  { name: 'pronostico',           label: 'Pronóstico (Paso 7)',                       type: 'text' },
  { name: 'control_pronostico',   label: 'Control al pronóstico / propuesta (Paso 8)', type: 'text' },
  { name: 'pregunta_general',     label: 'Pregunta general (Paso 9)',                 type: 'text' },
  { name: 'preguntas_especificas', label: 'Preguntas específicas (Paso 9)',           type: 'list' },
]

const cleanList = (a) => (a || []).map((s) => s.trim()).filter(Boolean)

export default function ThesisGenerator({ sessionId, user, onClose }) {
  const [phase, setPhase] = useState('extracting') // extracting|extract_error|review|generating|done
  const [error, setError] = useState('')
  const [objeto, setObjeto] = useState(null)
  const [datos, setDatos] = useState({
    autores: user?.full_name ? [user.full_name] : [],
    tutor: '',
    mes: '',
    anio: String(new Date().getFullYear()),
  })
  const [sections, setSections] = useState([])
  const mounted = useRef(true)

  // Importante: bajo React StrictMode (dev) el componente se monta, desmonta y
  // remonta. Hay que volver a poner mounted=true en CADA montaje, si no el
  // cleanup deja la ref en false y los guards `if (!mounted.current) return`
  // bloquean la transición de fase (se quedaría en "Polaris está leyendo…").
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const runExtract = useCallback(async () => {
    setPhase('extracting'); setError('')
    try {
      const obj = await extractObjeto(sessionId)
      if (!mounted.current) return
      setObjeto(obj)
      setPhase('review')
    } catch (err) {
      if (!mounted.current) return
      setError(err.message || 'No se pudo extraer el objeto de estudio.')
      setPhase('extract_error')
    }
  }, [sessionId])

  useEffect(() => { runExtract() }, [runExtract])

  const setField = (name, value) => setObjeto((p) => ({ ...p, [name]: value }))

  const buildPayload = () => {
    const o = { ...objeto }
    for (const f of OBJETO_FIELDS) if (f.type === 'list') o[f.name] = cleanList(o[f.name])
    return {
      objeto_de_estudio: o,
      datos: {
        autores: cleanList(datos.autores),
        tutor: datos.tutor || null,
        mes: datos.mes || null,
        anio: datos.anio || null,
      },
      opciones: {},
    }
  }

  const handleGenerate = async () => {
    const payload = buildPayload()
    setSections(SECTIONS.map((s) => ({ ...s, contenido: '', status: 'pending' })))
    setPhase('generating'); setError('')

    for (let i = 0; i < SECTIONS.length; i++) {
      if (!mounted.current) return
      setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'streaming' } : s)))
      try {
        await streamThesisSection(SECTIONS[i].key, payload, (chunk) => {
          if (!mounted.current) return
          setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, contenido: s.contenido + chunk } : s)))
        })
        if (!mounted.current) return
        setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'done' } : s)))
      } catch (err) {
        if (!mounted.current) return
        setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: 'error' } : s)))
        setError(`No se pudo generar "${SECTIONS[i].titulo}". ${err.message || ''}`)
        setPhase('done')
        return
      }
    }
    if (mounted.current) setPhase('done')
  }

  const handleDownload = () => {
    const ok = downloadThesisPdf({ titulo: objeto?.titulo || 'Trabajo de Grado', secciones: sections, datos })
    if (!ok) setError('Tu navegador bloqueó la ventana emergente. Habilítala para descargar el PDF.')
  }

  const doneCount = sections.filter((s) => s.status === 'done').length
  const allDone = sections.length > 0 && doneCount === sections.length

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0">
        <div className="flex size-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <GraduationCap className="size-5" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-slate-800 leading-tight">Generar tesis</h2>
          <p className="truncate text-[11px] text-slate-500">Resumen, Introducción y Capítulos I, II y III (formato UNEG)</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <X className="size-5" />
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6">

          {phase === 'extracting' && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <Spinner size="lg" />
              <p className="text-sm text-slate-600">Polaris está leyendo tu conversación y extrayendo tu objeto de estudio…</p>
            </div>
          )}

          {phase === 'extract_error' && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <AlertTriangle className="size-10 text-amber-500" />
              <p className="text-sm text-slate-600 max-w-md">{error}</p>
              <p className="text-xs text-slate-400 max-w-md">Asegúrate de haber avanzado en los 10 pasos dentro del chat antes de generar la tesis.</p>
              <button onClick={runExtract} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
                <RotateCw className="size-4" /> Reintentar
              </button>
            </div>
          )}

          {phase === 'review' && objeto && (
            <ReviewForm
              objeto={objeto}
              datos={datos}
              setField={setField}
              setDatos={setDatos}
              onGenerate={handleGenerate}
            />
          )}

          {(phase === 'generating' || phase === 'done') && (
            <GenerationView sections={sections} error={error} />
          )}
        </div>
      </div>

      {/* Footer actions */}
      {(phase === 'generating' || phase === 'done') && (
        <footer className="flex items-center gap-2 border-t border-slate-200 px-4 sm:px-6 py-3 shrink-0">
          <span className="text-xs text-slate-500">
            {allDone ? 'Tesis generada' : `Generando ${Math.min(doneCount + 1, sections.length)}/${sections.length}…`}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {phase === 'done' && (
              <button onClick={() => setPhase('review')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                <Pencil className="size-4" /> Editar datos
              </button>
            )}
            <button
              onClick={handleDownload}
              disabled={!allDone}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="size-4" /> Descargar PDF
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}

// ── Subcomponentes ──────────────────────────────────────────────────────────

function ReviewForm({ objeto, datos, setField, setDatos, onGenerate }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-violet-50/70 border border-violet-100 px-4 py-3">
        <p className="text-sm text-slate-700">
          Polaris extrajo esto de tu conversación. <strong>Revísalo y corrige</strong> lo que haga falta antes de generar la tesis.
        </p>
      </div>

      {/* Datos del trabajo */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Datos del trabajo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Autores (uno por línea)" className="sm:col-span-2">
            <textarea
              rows={2}
              value={(datos.autores || []).join('\n')}
              onChange={(e) => setDatos((p) => ({ ...p, autores: e.target.value.split('\n') }))}
              className={inputCls}
            />
          </Field>
          <Field label="Tutor(a)">
            <input value={datos.tutor} onChange={(e) => setDatos((p) => ({ ...p, tutor: e.target.value }))} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mes"><input value={datos.mes} onChange={(e) => setDatos((p) => ({ ...p, mes: e.target.value }))} className={inputCls} placeholder="junio" /></Field>
            <Field label="Año"><input value={datos.anio} onChange={(e) => setDatos((p) => ({ ...p, anio: e.target.value }))} className={inputCls} /></Field>
          </div>
        </div>
      </section>

      {/* Objeto de estudio */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Objeto de estudio (10 pasos)</h3>
        <div className="space-y-3">
          {OBJETO_FIELDS.map((f) => (
            <Field key={f.name} label={f.label}>
              <textarea
                rows={f.type === 'list' ? 3 : 2}
                value={Array.isArray(objeto[f.name]) ? objeto[f.name].join('\n') : (objeto[f.name] || '')}
                onChange={(e) => setField(f.name, f.type === 'list' ? e.target.value.split('\n') : e.target.value)}
                className={inputCls}
                placeholder={f.type === 'list' ? 'Un elemento por línea' : ''}
              />
            </Field>
          ))}
        </div>
      </section>

      <div className="flex justify-end pb-2">
        <button onClick={onGenerate} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition-colors">
          <Wand2 className="size-4" /> Generar tesis
        </button>
      </div>
    </div>
  )
}

function GenerationView({ sections, error }) {
  const tailRef = useRef(null)
  // Auto-scroll mientras llega contenido, para que nunca parezca congelado.
  const streamedChars = sections.reduce((n, s) => n + (s.contenido ? s.contenido.length : 0), 0)
  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [streamedChars])

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}
      {sections.map((s) => (
        <section key={s.key} className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 bg-slate-50 border-b border-slate-200 px-4 py-2">
            <SectionStatus status={s.status} />
            <h4 className="text-sm font-semibold text-slate-700">{s.titulo}</h4>
          </div>
          <div className="px-4 sm:px-5 py-4">
            {s.contenido
              ? (
                <div className="thesis-prose">
                  <span dangerouslySetInnerHTML={{ __html: mdToHtml(s.contenido) }} />
                  {s.status === 'streaming' && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent align-middle rounded-full" />
                  )}
                </div>
              )
              : <p className="text-sm text-slate-400 italic">{s.status === 'streaming' ? 'Generando…' : 'En espera'}</p>}
          </div>
        </section>
      ))}
      <div ref={tailRef} />
    </div>
  )
}

function SectionStatus({ status }) {
  if (status === 'done') return <Check className="size-4 text-emerald-500" />
  if (status === 'streaming') return <Spinner size="sm" />
  if (status === 'error') return <AlertTriangle className="size-4 text-amber-500" />
  return <span className="size-2 rounded-full bg-slate-300" />
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ' +
  'focus:border-violet-300 focus:ring-2 focus:ring-violet-100 resize-y'
