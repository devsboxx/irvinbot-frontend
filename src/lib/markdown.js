// Conversor Markdown -> HTML minimalista y sin dependencias.
// Soporta: encabezados (#..######), negrita, cursiva, código en línea,
// listas (ordenadas y no), citas (>), regla horizontal y párrafos.
// Se usa tanto para mostrar la tesis en pantalla como para exportarla a PDF.

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inline(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+?)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

const SPECIAL = /^(#{1,6}\s|>|[-*]\s|\d+[.)]\s)/
const HR = /^(-{3,}|\*{3,}|_{3,})$/

export function mdToHtml(md) {
  const lines = (md || '').replace(/\r\n/g, '\n').split('\n')
  const out = []
  let i = 0
  let listType = null

  const closeList = () => {
    if (listType) { out.push(`</${listType}>`); listType = null }
  }

  while (i < lines.length) {
    const t = lines[i].trim()

    if (t === '') { closeList(); i++; continue }

    let m
    if ((m = t.match(/^(#{1,6})\s+(.*)$/))) {
      closeList()
      const lvl = m[1].length
      out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`)
      i++; continue
    }

    if (HR.test(t)) { closeList(); out.push('<hr/>'); i++; continue }

    if (/^>\s?/.test(t)) {
      closeList()
      const buf = []
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buf.push(inline(lines[i].trim().replace(/^>\s?/, '')))
        i++
      }
      out.push(`<blockquote>${buf.join('<br/>')}</blockquote>`)
      continue
    }

    if ((m = t.match(/^[-*]\s+(.*)$/))) {
      if (listType !== 'ul') { closeList(); out.push('<ul>'); listType = 'ul' }
      out.push(`<li>${inline(m[1])}</li>`)
      i++; continue
    }

    if ((m = t.match(/^\d+[.)]\s+(.*)$/))) {
      if (listType !== 'ol') { closeList(); out.push('<ol>'); listType = 'ol' }
      out.push(`<li>${inline(m[1])}</li>`)
      i++; continue
    }

    // Párrafo: agrupa líneas consecutivas no especiales.
    closeList()
    const buf = [inline(t)]
    i++
    while (i < lines.length) {
      const tt = lines[i].trim()
      if (tt === '' || SPECIAL.test(tt) || HR.test(tt)) break
      buf.push(inline(tt))
      i++
    }
    out.push(`<p>${buf.join(' ')}</p>`)
  }

  closeList()
  return out.join('\n')
}
