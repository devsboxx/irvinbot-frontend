import { mdToHtml } from './markdown'

// Exporta la tesis a PDF vía ventana de impresión (Guarda como PDF).
// Formato académico UNEG: carta, márgenes, Times, portada + índice.

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const CSS = `
  @page {
    size: Letter;
    margin: 2.5cm 2.8cm 2.5cm 3.5cm;
    @bottom-center {
      content: counter(page);
      font-family: "Times New Roman", Times, serif;
      font-size: 10pt;
      color: #444;
    }
  }
  @page :first {
    margin: 2cm 2.5cm 2cm 2.5cm;
    @bottom-center { content: none; }
  }

  * { box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, Georgia, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #111;
    margin: 0;
    text-align: justify;
    hyphens: auto;
  }

  h1 {
    font-size: 14pt;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    margin: 0 0 6pt;
    letter-spacing: 0.02em;
  }
  h2 {
    font-size: 13pt;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    margin: 6pt 0 14pt;
  }
  h3 {
    font-size: 12pt;
    font-weight: bold;
    margin: 16pt 0 8pt;
    text-align: left;
  }
  h4 {
    font-size: 12pt;
    font-weight: bold;
    font-style: italic;
    margin: 12pt 0 6pt;
  }
  p { margin: 0 0 9pt; text-indent: 1.25cm; }
  ul, ol { margin: 0 0 10pt 1.4cm; padding: 0; }
  li { margin: 0 0 4pt; text-indent: 0; }
  blockquote {
    margin: 10pt 0 10pt 1.2cm;
    padding: 6pt 0 6pt 12pt;
    border-left: 2.5pt solid #555;
    color: #333;
    font-size: 11pt;
    font-style: italic;
    text-indent: 0;
  }
  code {
    font-family: "Courier New", monospace;
    font-size: 10.5pt;
    background: #f4f4f4;
    padding: 0 3pt;
  }
  hr { border: none; border-top: 1px solid #bbb; margin: 12pt 0; }
  strong { font-weight: bold; }

  /* ── Portada ── */
  .portada {
    min-height: 24cm;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    page-break-after: always;
  }
  .portada .emblem {
    width: 52pt;
    height: 52pt;
    border: 1.5pt solid #1a1a2e;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9pt;
    font-weight: bold;
    letter-spacing: 0.04em;
    margin: 0.4cm 0 0.8cm;
    color: #1a1a2e;
  }
  .portada .top {
    text-transform: uppercase;
    font-weight: bold;
    line-height: 1.55;
    font-size: 11.5pt;
  }
  .portada .divider {
    width: 4cm;
    height: 1.2pt;
    background: #1a1a2e;
    margin: 1.1cm auto 1.1cm;
  }
  .portada .tipo {
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #333;
    margin-bottom: 0.6cm;
  }
  .portada .titulo {
    font-weight: bold;
    font-style: italic;
    font-size: 13.5pt;
    line-height: 1.45;
    max-width: 14cm;
    margin: 0 auto 1.4cm;
  }
  .portada .meta {
    text-align: left;
    align-self: flex-end;
    margin-right: 0.3cm;
    margin-top: auto;
    line-height: 1.55;
    font-size: 11.5pt;
  }
  .portada .meta strong { display: block; margin-bottom: 2pt; }
  .portada .ciudad {
    margin-top: 1.6cm;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 11.5pt;
    letter-spacing: 0.04em;
  }

  /* ── Índice ── */
  .indice {
    page-break-after: always;
  }
  .indice h1 {
    margin-bottom: 18pt;
  }
  .indice-item {
    display: flex;
    align-items: baseline;
    gap: 6pt;
    margin: 0 0 10pt;
    text-indent: 0;
    font-size: 12pt;
  }
  .indice-item .dots {
    flex: 1;
    border-bottom: 1px dotted #999;
    margin: 0 4pt 3pt;
    min-width: 1cm;
  }
  .indice-item .num {
    font-variant-numeric: tabular-nums;
    color: #444;
  }

  .page-break { page-break-before: always; }
  .section { orphans: 3; widows: 3; }
  .section > h1:first-child,
  .section > h2:first-child { margin-top: 0; }
  .section p:first-of-type { text-indent: 0; }

  @media print {
    .no-print { display: none !important; }
  }
`

function portada(titulo, datos) {
  const d = datos || {}
  const autores = (d.autores || []).filter(Boolean)
  const fecha = [d.mes, d.anio].filter(Boolean).join(' de ')
  const uni = d.universidad || 'Universidad Nacional Experimental de Guayana'
  const initials = uni
    .split(/\s+/)
    .filter((w) => w.length > 2 && w[0] === w[0].toUpperCase())
    .slice(0, 4)
    .map((w) => w[0])
    .join('')

  return `
  <section class="portada">
    <div class="emblem">${esc(initials || 'UNEG')}</div>
    <div class="top">
      República Bolivariana de Venezuela<br/>
      ${esc(uni)}<br/>
      ${esc(d.vicerrectorado || 'Vicerrectorado Académico')}<br/>
      ${esc(d.coordinacion || 'Coordinación General de Pregrado')}<br/>
      Proyecto de Carrera: ${esc(d.carrera || 'Ingeniería en Informática')}
    </div>
    <div class="divider"></div>
    <div class="tipo">Trabajo especial de grado</div>
    <div class="titulo">${esc(titulo)}</div>
    <div class="meta">
      ${autores.length ? `<strong>Autor${autores.length > 1 ? 'es' : ''}:</strong>${autores.map(esc).join('<br/>')}<br/><br/>` : ''}
      ${d.tutor ? `<strong>Tutor(a):</strong>${esc(d.tutor)}` : ''}
    </div>
    <div class="ciudad">${esc(d.ciudad || 'Ciudad Guayana')}${fecha ? `<br/>${esc(fecha)}` : ''}</div>
  </section>`
}

function indice(secciones) {
  const items = (secciones || [])
    .filter((s) => s?.contenido)
    .map((s, i) => `
      <p class="indice-item">
        <span>${esc(s.titulo || `Sección ${i + 1}`)}</span>
        <span class="dots"></span>
        <span class="num">${i + 2}</span>
      </p>`)
    .join('')

  return `
  <section class="indice">
    <h1>Índice</h1>
    <p class="indice-item"><span>Portada</span><span class="dots"></span><span class="num">i</span></p>
    <p class="indice-item"><span>Índice</span><span class="dots"></span><span class="num">ii</span></p>
    ${items}
  </section>`
}

const BREAK_BEFORE = new Set(['introduccion', 'capitulo_1', 'capitulo_2', 'capitulo_3'])

export function buildThesisHtml({ titulo, secciones, datos }) {
  const body = [portada(titulo, datos), indice(secciones)]
  for (const s of secciones || []) {
    if (!s?.contenido) continue
    const cls = BREAK_BEFORE.has(s.key) ? 'section page-break' : 'section'
    body.push(`<section class="${cls}">${mdToHtml(s.contenido)}</section>`)
  }
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>${esc(titulo)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="no-print" style="font-family:system-ui,sans-serif;padding:12px 16px;background:#f5f3ff;border-bottom:1px solid #ddd6fe;color:#5b21b6;font-size:13px;">
    Usa <strong>Guardar como PDF</strong> o <strong>Save as PDF</strong> en el diálogo de impresión.
  </div>
  ${body.join('\n')}
</body>
</html>`
}

export function downloadThesisPdf(doc) {
  const html = buildThesisHtml(doc)
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  setTimeout(() => {
    try { w.focus(); w.print() } catch { /* noop */ }
  }, 450)
  return true
}
