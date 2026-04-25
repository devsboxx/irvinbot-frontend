// ─── Storage keys ─────────────────────────────────────────────────────────────
const KEY = {
  USERS: 'irvinbot_users',
  ME: 'irvinbot_me',
  SESSIONS: 'irvinbot_sessions',
  msgs: (id) => `irvinbot_msgs_${id}`,
}

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)) }

// ─── Auth ──────────────────────────────────────────────────────────────────────
export function mockRegister(email, fullName, password) {
  const users = load(KEY.USERS) ?? []
  if (users.some(u => u.email === email)) throw new Error('Este correo ya está registrado.')
  const user = { id: crypto.randomUUID(), email, fullName, password }
  save(KEY.USERS, [...users, user])
  const me = { id: user.id, email, fullName }
  save(KEY.ME, me)
  return me
}

export function mockLogin(email, password) {
  const users = load(KEY.USERS) ?? []
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) throw new Error('Correo o contraseña incorrectos.')
  const me = { id: user.id, email: user.email, fullName: user.fullName }
  save(KEY.ME, me)
  return me
}

export function mockLogout() {
  localStorage.removeItem(KEY.ME)
}

export function mockGetCurrentUser() {
  return load(KEY.ME)
}

// ─── Sessions ─────────────────────────────────────────────────────────────────
export function mockListSessions() {
  return load(KEY.SESSIONS) ?? []
}

export function mockCreateSession() {
  const sessions = mockListSessions()
  const session = { id: crypto.randomUUID(), title: 'Nueva conversación', createdAt: new Date().toISOString() }
  save(KEY.SESSIONS, [session, ...sessions])
  return session
}

export function mockDeleteSession(id) {
  save(KEY.SESSIONS, mockListSessions().filter(s => s.id !== id))
  localStorage.removeItem(KEY.msgs(id))
}

export function mockUpdateSessionTitle(id, title) {
  save(KEY.SESSIONS, mockListSessions().map(s => s.id === id ? { ...s, title } : s))
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export function mockGetMessages(sessionId) {
  return load(KEY.msgs(sessionId)) ?? []
}

function saveMessages(sessionId, msgs) {
  save(KEY.msgs(sessionId), msgs)
}

export async function mockStreamMessage(sessionId, text, onChunk) {
  const existing = mockGetMessages(sessionId)
  const userMsg = { id: crypto.randomUUID(), role: 'user', content: text }
  saveMessages(sessionId, [...existing, userMsg])

  const response = generateResponse(text)

  // Simulate initial thinking latency
  await new Promise(r => setTimeout(r, 400 + Math.random() * 400))

  // Stream character by character
  let i = 0
  await new Promise(resolve => {
    const interval = setInterval(() => {
      i = Math.min(i + Math.floor(Math.random() * 7) + 4, response.length)
      onChunk(response.slice(0, i))
      if (i >= response.length) {
        clearInterval(interval)
        resolve()
      }
    }, 18)
  })

  const fresh = mockGetMessages(sessionId)
  const aiMsg = { id: crypto.randomUUID(), role: 'assistant', content: response }
  saveMessages(sessionId, [...fresh, aiMsg])
}

// ─── Response generation ──────────────────────────────────────────────────────
const RESPONSES = [
  {
    keys: ['hipótesis', 'hipotesis'],
    text: `Una hipótesis es una afirmación provisional que propones antes de realizar tu investigación. Para plantearla correctamente:

**1. Identifica tus variables**
Distingue la variable independiente (causa) de la dependiente (efecto).

**2. Usa una estructura clara**
"Existe una relación significativa entre [Variable A] y [Variable B] en [población]."

**3. Verifica que sea falsable**
Debe poder probarse o refutarse con datos empíricos.

**Ejemplo:** "El uso de técnicas de aprendizaje activo mejora significativamente el rendimiento académico en estudiantes universitarios de primer año."

¿Te ayudo a formular la hipótesis específica de tu tesis?`,
  },
  {
    keys: ['metodología', 'metodologia', 'método', 'metodo'],
    text: `La metodología define cómo recopilarás y analizarás tus datos. Las principales opciones:

**Investigación Cuantitativa**
Datos numéricos y estadísticos. Encuestas, experimentos. Ideal para probar hipótesis con muestras grandes.

**Investigación Cualitativa**
Datos descriptivos: entrevistas, observaciones. Busca entender significados y patrones en fenómenos sociales.

**Investigación Mixta**
Combina ambos enfoques. Más completa pero requiere más tiempo y recursos.

Para elegir la tuya, considera: ¿qué quieres demostrar?, ¿con qué recursos cuentas?, ¿cuál es el tiempo disponible?

¿Cuál es el tema de tu tesis para orientarte mejor?`,
  },
  {
    keys: ['apa', 'citar', 'citas', 'referencia', 'referencias'],
    text: `El formato APA 7ª edición es el estándar en ciencias sociales y educación.

**Libro:**
Apellido, N. (Año). *Título del libro*. Editorial.

**Artículo de revista:**
Apellido, N. (Año). Título. *Nombre de la Revista*, *Vol*(Núm), pp. https://doi.org/...

**Página web:**
Apellido, N. (Año, día mes). *Título*. Nombre del sitio. URL

**Citas en el texto:**
- Un autor: (García, 2021)
- Dos autores: (García y López, 2021)
- Tres o más: (García et al., 2021)
- Cita directa: (García, 2021, p. 45)

¿Tienes alguna fuente específica que necesites formatear?`,
  },
  {
    keys: ['marco teórico', 'marco teorico', 'teórico', 'teorico'],
    text: `El marco teórico es la base conceptual de tu tesis. Se estructura así:

**1. Antecedentes de investigación**
Estudios previos relacionados con tu tema (preferentemente últimos 5 años).

**2. Bases teóricas**
Teorías y modelos que fundamentan tu investigación. Sintetiza y relaciona, no copies.

**3. Definición de términos**
Define los conceptos clave que usarás a lo largo del trabajo.

**Consejos:**
- Organiza por temas, no por autores
- Usa fuentes primarias cuando sea posible
- Muestra cómo cada teoría sustenta TU investigación

¿Cuál es el tema de tu tesis para ayudarte con fuentes?`,
  },
  {
    keys: ['triangulación', 'triangulacion'],
    text: `La triangulación es una técnica para verificar y validar resultados usando múltiples perspectivas.

**Tipos de triangulación:**

*De datos:* Múltiples fuentes (encuestas + entrevistas + documentos)
*De investigadores:* Varios investigadores analizan los mismos datos independientemente
*De teorías:* Interpretar datos desde diferentes marcos teóricos
*Metodológica:* Combinar métodos cuantitativos y cualitativos

**¿Por qué usarla?**
Aumenta la credibilidad y validez de tus conclusiones. Si diferentes métodos llegan a la misma conclusión, el resultado es más robusto.

Es especialmente útil en investigaciones mixtas o cualitativas.`,
  },
  {
    keys: ['objetivo', 'objetivos'],
    text: `Los objetivos guían toda tu investigación. Deben ser claros, medibles y alcanzables.

**Objetivo General**
Describe el propósito principal. Usa verbos en infinitivo: analizar, evaluar, determinar, describir, establecer.

*Ejemplo:* "Analizar la relación entre el uso de tecnología educativa y el rendimiento académico en estudiantes universitarios."

**Objetivos Específicos**
Son los pasos para lograr el objetivo general. Normalmente 3-5.

*Ejemplo:*
1. Identificar las herramientas tecnológicas más utilizadas
2. Evaluar el nivel de rendimiento académico de la muestra
3. Determinar la correlación estadística entre ambas variables

**Regla clave:** Cada objetivo específico debe contribuir directamente al general.

¿Cuál es tu tema de investigación?`,
  },
  {
    keys: ['cualitativo', 'cuantitativo', 'diferencia'],
    text: `La diferencia fundamental está en el tipo de datos que manejas:

**Cuantitativo**
- Datos numéricos y estadísticos
- Muestra representativa, generalmente grande
- Instrumentos: encuestas, tests estandarizados
- Resultados: porcentajes, correlaciones, gráficos
- Pregunta típica: "¿Cuántos? ¿Qué tan frecuente?"

**Cualitativo**
- Datos descriptivos y narrativos
- Muestra pequeña, profundidad sobre amplitud
- Instrumentos: entrevistas, grupos focales, observación
- Resultados: categorías, patrones, interpretaciones
- Pregunta típica: "¿Cómo? ¿Por qué?"

Si buscas medir y generalizar → cuantitativo.
Si buscas comprender y explorar → cualitativo.

¿Cuál es la pregunta central de tu tesis?`,
  },
  {
    keys: ['planteamiento', 'problema'],
    text: `El planteamiento del problema es uno de los elementos más críticos de tu tesis. Debe responder:

**¿Qué existe actualmente?**
Describe el contexto y antecedentes del problema.

**¿Qué debería existir?**
Señala cómo debería ser la situación en condiciones óptimas.

**¿Cuál es la brecha?**
La diferencia entre lo actual y lo ideal es tu problema de investigación.

**Pregunta de investigación**
Formula el problema como pregunta: "¿Cómo influye [X] en [Y] en [contexto]?"

**Justificación**
¿Por qué es importante resolverlo? Considera: relevancia teórica, práctica e impacto social.

¿Tienes identificado el fenómeno que quieres investigar?`,
  },
]

const DEFAULT = [
  `Entiendo tu consulta. Para darte la orientación más precisa, necesito un poco más de contexto.

¿Podrías indicarme:
- ¿Cuál es el área de tu investigación?
- ¿En qué etapa del proceso te encuentras?
- ¿Qué aspecto específico necesitas desarrollar?

Con esa información podré guiarte de manera mucho más efectiva.`,

  `Esa es una pregunta relevante para tu investigación.

En el contexto académico, suele abordarse desde dos perspectivas: el marco teórico que sustenta tu trabajo y la metodología que vas a aplicar.

Te recomiendo revisar investigaciones recientes (últimos 5 años) en tu área para ver cómo otros autores han abordado preguntas similares.

¿Hay algún aspecto específico en el que quieras profundizar?`,

  `Para tu tesis, este es un punto importante a considerar.

Lo que describes se relaciona con la solidez metodológica de tu investigación. Los evaluadores revisan especialmente la coherencia entre tu pregunta de investigación, los objetivos y la metodología elegida.

Asegúrate de tener muy clara tu pregunta central. Todo lo demás —hipótesis, metodología, marco teórico— debe responder a esa pregunta.

¿Ya tienes definida tu pregunta principal?`,
]

function generateResponse(text) {
  const lower = text.toLowerCase()
  for (const r of RESPONSES) {
    if (r.keys.some(k => lower.includes(k))) return r.text
  }
  return DEFAULT[Math.floor(Math.random() * DEFAULT.length)]
}
