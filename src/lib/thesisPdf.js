import { mdToHtml } from './markdown'

// Exporta la tesis a PDF abriendo una ventana de impresión con formato
// académico (papel carta, márgenes, fuente serif). El usuario "Guarda como PDF".
// Es vector (texto nítido) y no requiere dependencias.

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const CSS = `
  @page { size: Letter; margin: 2.54cm 3cm 2.54cm 4cm; }
  * { box-sizing: border-box; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; color: #000; margin: 0; text-align: justify; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; font-weight: bold; margin: 0 0 4pt; }
  h2 { font-size: 13pt; text-align: center; text-transform: uppercase; font-weight: bold; margin: 4pt 0 12pt; }
  h3 { font-size: 12pt; font-weight: bold; margin: 14pt 0 6pt; }
  h4 { font-size: 12pt; font-weight: bold; font-style: italic; margin: 10pt 0 4pt; }
  p { margin: 0 0 8pt; text-indent: 1.25cm; }
  ul, ol { margin: 0 0 8pt 1.25cm; }
  li { margin: 0 0 3pt; }
  blockquote { margin: 8pt 0 8pt 1.25cm; padding-left: 10pt; border-left: 2pt solid #999; color: #444; font-size: 11pt; font-style: italic; text-indent: 0; }
  code { font-family: "Courier New", monospace; font-size: 10.5pt; background: #f2f2f2; padding: 0 2pt; }
  hr { border: none; border-top: 1px solid #ccc; margin: 10pt 0; }
  .portada { text-align: center; height: 23cm; display: flex; flex-direction: column; align-items: center; page-break-after: always; }
  .portada .top { text-transform: uppercase; font-weight: bold; line-height: 1.4; margin-top: 1cm; }
  .portada .titulo { font-weight: bold; font-style: italic; margin: auto 0; padding: 0 1cm; font-size: 13pt; }
  .portada .meta { text-align: right; width: 100%; padding-right: 0.5cm; line-height: 1.5; }
  .portada .ciudad { margin: 1.2cm 0 0; text-transform: uppercase; }
  .page-break { page-break-before: always; }
  .section p:first-of-type { text-indent: 0; }
`

function portada(titulo, datos) {
  const d = datos || {}
  const autores = (d.autores || []).filter(Boolean)
  const fecha = [d.mes, d.anio].filter(Boolean).join(' ')
  return `
  <section class="portada">
    <div class="top">
      REPÚBLICA BOLIVARIANA DE VENEZUELA<br/>
      ${esc(d.universidad || 'Universidad Nacional Experimental de Guayana')}<br/>
      ${esc(d.vicerrectorado || 'Vicerrectorado Académico')}<br/>
      ${esc(d.coordinacion || 'Coordinación General de Pregrado')}<br/>
      PROYECTO DE CARRERA: ${esc(d.carrera || 'Ingeniería en Informática')}
    </div>
    <div class="titulo">${esc(titulo)}</div>
    <div class="meta">
      ${autores.length ? `<strong>Autores:</strong><br/>${autores.map(esc).join('<br/>')}<br/><br/>` : ''}
      ${d.tutor ? `<strong>Tutor(a):</strong> ${esc(d.tutor)}` : ''}
    </div>
    <div class="ciudad">${esc(d.ciudad || 'Ciudad Guayana')}${fecha ? `, ${esc(fecha)}` : ''}</div>
  </section>`
}

const BREAK_BEFORE = new Set(['introduccion', 'capitulo_1', 'capitulo_2', 'capitulo_3'])

export function buildThesisHtml({ titulo, secciones, datos }) {
  const body = [portada(titulo, datos)]
  for (const s of secciones) {
    if (!s || !s.contenido) continue
    const cls = BREAK_BEFORE.has(s.key) ? 'section page-break' : 'section'
    body.push(`<section class="${cls}">${mdToHtml(s.contenido)}</section>`)
  }
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"/><title>${esc(titulo)}</title><style>${CSS}</style></head><body>${body.join('\n')}</body></html>`
}

// Abre la ventana de impresión. Devuelve false si el navegador bloqueó el popup.
export function downloadThesisPdf(doc) {
  const html = buildThesisHtml(doc)
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  setTimeout(() => { try { w.focus(); w.print() } catch { /* noop */ } }, 400)
  return true
}
