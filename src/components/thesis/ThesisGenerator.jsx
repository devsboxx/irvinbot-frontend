import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X, GraduationCap, Wand2, Download, RotateCw, AlertTriangle,
  Check, Pencil, Sparkles, BookOpen, FileText, Loader2,
} from 'lucide-react'
import Spinner from '../ui/Spinner'
import { extractObjeto, streamThesisSection } from '../../api/thesis'
import { mdToHtml } from '../../lib/markdown'
import { downloadThesisPdf } from '../../lib/thesisPdf'

const SECTIONS = [
  { key: 'resumen',      titulo: 'Resumen',                              short: 'Resumen' },
  { key: 'introduccion', titulo: 'Introducción',                         short: 'Intro' },
  { key: 'capitulo_1',   titulo: 'Capítulo I — El Problema',             short: 'Cap. I' },
  { key: 'capitulo_2',   titulo: 'Capítulo II — Marco Teórico',          short: 'Cap. II' },
  { key: 'capitulo_3',   titulo: 'Capítulo III — Marco Metodológico',    short: 'Cap. III' },
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

const PHASE_STEPS = [
  { id: 'extract', label: 'Extraer' },
  { id: 'review',  label: 'Revisar' },
  { id: 'generate', label: 'Generar' },
  { id: 'done',    label: 'PDF' },
]

const cleanList = (a) => (a || []).map((s) => s.trim()).filter(Boolean)

function phaseIndex(phase) {
  if (phase === 'extracting' || phase === 'extract_error') return 0
  if (phase === 'review') return 1
  if (phase === 'generating') return 2
  if (phase === 'done') return 3
  return 0
}

export default function ThesisGenerator({ sessionId, user, onClose }) {
  const [phase, setPhase] = useState('extracting')
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
  const currentStep = phaseIndex(phase)
  const progressPct = sections.length
    ? Math.round((doneCount / sections.length) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 animate-fade-in">
      {/* Header */}
      <header className="relative shrink-0 border-b border-violet-100 bg-white/90 backdrop-blur-md">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 via-violet-500 to-pink-400" />
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-200/50">
            <GraduationCap className="size-5" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-800 leading-tight">Generar tesis</h2>
            <p className="truncate text-[11px] text-slate-500">Formato académico UNEG · Resumen e Introducción · Capítulos I–III</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-4 sm:px-6 pb-3">
          <ol className="flex items-center gap-1 sm:gap-2">
            {PHASE_STEPS.map((step, i) => {
              const done = i < currentStep || (phase === 'done' && i === 3)
              const active = i === currentStep && phase !== 'done'
              return (
                <li key={step.id} className="flex flex-1 items-center gap-1 sm:gap-2 min-w-0">
                  <div className={`
                    flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all
                    ${done ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
                      : active ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-300'
                      : 'bg-slate-100 text-slate-400'}
                  `}>
                    {done ? <Check className="size-3.5" strokeWidth={2.5} /> : i + 1}
                  </div>
                  <span className={`hidden sm:block truncate text-[11px] font-medium ${
                    done || active ? 'text-slate-700' : 'text-slate-400'
                  }`}>{step.label}</span>
                  {i < PHASE_STEPS.length - 1 && (
                    <div className={`mx-1 h-px flex-1 ${done ? 'bg-violet-300' : 'bg-slate-200'}`} />
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-8">

          {phase === 'extracting' && (
            <div className="flex flex-col items-center justify-center gap-5 py-20 text-center animate-slide-up">
              <div className="relative">
                <div className="absolute inset-0 scale-150 rounded-full bg-violet-300/30 blur-2xl animate-pulse" />
                <div className="relative flex size-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-violet-100 ring-1 ring-violet-100">
                  <Sparkles className="size-9 text-violet-500 animate-pulse" strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">Leyendo tu conversación</p>
                <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Estamos extrayendo tu objeto de estudio de los 10 pasos para armar la tesis.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-violet-600 font-medium">
                <Loader2 className="size-3.5 animate-spin" /> Esto puede tomar unos segundos…
              </div>
            </div>
          )}

          {phase === 'extract_error' && (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center animate-slide-up">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100">
                <AlertTriangle className="size-8 text-amber-500" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">No se pudo extraer el objeto</p>
                <p className="mt-1.5 text-sm text-slate-600 max-w-md mx-auto">{error}</p>
                <p className="mt-2 text-xs text-slate-400 max-w-md mx-auto">
                  Asegúrate de haber completado los 10 pasos en el chat antes de generar la tesis.
                </p>
              </div>
              <button
                onClick={runExtract}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700 transition-colors"
              >
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
            <GenerationView
              sections={sections}
              error={error}
              phase={phase}
              progressPct={progressPct}
              doneCount={doneCount}
              allDone={allDone}
              onDownload={handleDownload}
              onEdit={() => setPhase('review')}
            />
          )}
        </div>
      </div>

      {/* Footer — solo generating (done tiene CTA en el body) */}
      {phase === 'generating' && (
        <footer className="shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-3">
          <div className="mx-auto max-w-3xl flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                <span>Generando sección {Math.min(doneCount + 1, sections.length)} de {sections.length}</span>
                <span className="font-semibold text-violet-600">{progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

// ── Subcomponentes ──────────────────────────────────────────────────────────

function ReviewForm({ objeto, datos, setField, setDatos, onGenerate }) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-white to-pink-50 border border-violet-100 px-5 py-4">
        <div className="absolute -right-6 -top-6 size-24 rounded-full bg-violet-200/40 blur-2xl pointer-events-none" />
        <div className="relative flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <BookOpen className="size-4" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Revisa tu objeto de estudio</p>
            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
              Extrajimos esto de tu conversación. Corrige lo necesario — estos datos alimentan cada capítulo de la tesis.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <FileText className="size-3.5" /> Datos del trabajo
        </h3>
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
            <input value={datos.tutor} onChange={(e) => setDatos((p) => ({ ...p, tutor: e.target.value }))} className={inputCls} placeholder="Nombre del tutor" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mes">
              <input value={datos.mes} onChange={(e) => setDatos((p) => ({ ...p, mes: e.target.value }))} className={inputCls} placeholder="junio" />
            </Field>
            <Field label="Año">
              <input value={datos.anio} onChange={(e) => setDatos((p) => ({ ...p, anio: e.target.value }))} className={inputCls} />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Sparkles className="size-3.5" /> Objeto de estudio · 10 pasos
        </h3>
        <div className="space-y-3">
          {OBJETO_FIELDS.map((f, i) => (
            <Field key={f.name} label={f.label}>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 flex size-5 items-center justify-center rounded-md bg-violet-50 text-[10px] font-bold text-violet-500 pointer-events-none">
                  {i + 1}
                </span>
                <textarea
                  rows={f.type === 'list' ? 3 : 2}
                  value={Array.isArray(objeto[f.name]) ? objeto[f.name].join('\n') : (objeto[f.name] || '')}
                  onChange={(e) => setField(f.name, f.type === 'list' ? e.target.value.split('\n') : e.target.value)}
                  className={`${inputCls} pl-10`}
                  placeholder={f.type === 'list' ? 'Un elemento por línea' : ''}
                />
              </div>
            </Field>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent">
        <button
          onClick={onGenerate}
          className="btn-shimmer w-full sm:w-auto sm:ml-auto sm:flex inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200/60 active:scale-[0.98] transition-transform"
        >
          <Wand2 className="size-4" /> Generar tesis completa
        </button>
      </div>
    </div>
  )
}

function GenerationView({ sections, error, phase, progressPct, doneCount, allDone, onDownload, onEdit }) {
  const tailRef = useRef(null)
  const streamedChars = sections.reduce((n, s) => n + (s.contenido ? s.contenido.length : 0), 0)
  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [streamedChars])

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Progress summary */}
      <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {allDone ? '¡Tesis lista!' : 'Escribiendo tu tesis…'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {allDone
                ? 'Revisa las secciones y descarga el PDF académico.'
                : `${doneCount} de ${sections.length} secciones completadas`}
            </p>
          </div>
          <span className={`text-lg font-bold tabular-nums ${allDone ? 'text-emerald-500' : 'text-violet-600'}`}>
            {progressPct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-pink-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sections.map((s) => (
            <span
              key={s.key}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors
                ${s.status === 'done' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                  : s.status === 'streaming' ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                  : s.status === 'error' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                  : 'bg-slate-50 text-slate-400 ring-1 ring-slate-100'}`}
            >
              {s.status === 'done' && <Check className="size-2.5" strokeWidth={3} />}
              {s.status === 'streaming' && <Loader2 className="size-2.5 animate-spin" />}
              {s.short}
            </span>
          ))}
        </div>
      </div>

      {allDone && (
        <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 p-4 shadow-lg shadow-violet-200/40">
          <div className="flex-1 text-white">
            <p className="text-sm font-semibold">Tu documento está listo</p>
            <p className="text-xs text-white/75 mt-0.5">Portada, índice y capítulos en formato académico.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white hover:bg-white/25 transition-colors"
            >
              <Pencil className="size-3.5" /> Editar
            </button>
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm hover:bg-violet-50 transition-colors"
            >
              <Download className="size-4" /> Descargar PDF
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      {sections.map((s) => (
        <section
          key={s.key}
          className={`rounded-2xl border overflow-hidden bg-white shadow-sm transition-all
            ${s.status === 'streaming' ? 'border-violet-200 ring-2 ring-violet-100'
              : s.status === 'done' ? 'border-slate-200'
              : s.status === 'error' ? 'border-amber-200'
              : 'border-slate-100 opacity-70'}`}
        >
          <div className={`flex items-center gap-2.5 px-4 py-2.5 border-b
            ${s.status === 'streaming' ? 'bg-violet-50/80 border-violet-100'
              : s.status === 'done' ? 'bg-emerald-50/40 border-slate-100'
              : 'bg-slate-50/80 border-slate-100'}`}>
            <SectionStatus status={s.status} />
            <h4 className="flex-1 text-sm font-semibold text-slate-700">{s.titulo}</h4>
            {s.status === 'streaming' && (
              <span className="text-[10px] font-medium text-violet-500 animate-pulse">escribiendo…</span>
            )}
          </div>
          <div className="px-4 sm:px-5 py-4">
            {s.contenido ? (
              <div className="thesis-prose">
                <span dangerouslySetInnerHTML={{ __html: mdToHtml(s.contenido) }} />
                {s.status === 'streaming' && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent align-middle rounded-full" />
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic flex items-center gap-2">
                {s.status === 'streaming'
                  ? <><Spinner size="sm" /> Generando contenido…</>
                  : 'En espera'}
              </p>
            )}
          </div>
        </section>
      ))}
      <div ref={tailRef} />

      {phase === 'done' && !allDone && (
        <div className="flex justify-end gap-2 pb-2">
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Pencil className="size-4" /> Editar datos
          </button>
        </div>
      )}
    </div>
  )
}

function SectionStatus({ status }) {
  if (status === 'done') {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Check className="size-3.5" strokeWidth={2.5} />
      </span>
    )
  }
  if (status === 'streaming') return <Spinner size="sm" />
  if (status === 'error') {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <AlertTriangle className="size-3.5" />
      </span>
    )
  }
  return <span className="size-2.5 rounded-full bg-slate-300 mx-1.5" />
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none ' +
  'focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100 resize-y transition-colors'
