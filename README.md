# irvinbot-frontend

Aplicación web de Irvinbot. Interfaz de chat para que estudiantes universitarios interactúen con el bot de tesis, gestionen sus sesiones de conversación y suban documentos PDF para análisis. Construida con **React 19**, **Tailwind CSS v4** y **Vite 6**.

---

## Qué hace

- Login y registro de usuarios
- Chat en tiempo real con streaming SSE (los tokens del LLM aparecen mientras se generan)
- Gestión de múltiples sesiones de conversación
- Upload de PDFs que alimentan el contexto del bot
- Lista y eliminación de documentos subidos

Toda la comunicación va a través del gateway en `VITE_API_URL` (default: `http://localhost:8000/api`).

---

## Stack

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19 | UI con hooks (useState, useEffect, useCallback, useContext) |
| React Router | 7 | Routing client-side |
| Tailwind CSS | 4 | Estilos utilitarios (sin tailwind.config.js) |
| Vite | 6 | Dev server y bundler |

### Setup de Tailwind v4

Tailwind v4 no requiere archivo de configuración. La integración es vía plugin de Vite:

```js
// vite.config.js
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [react(), tailwindcss()] })
```

```css
/* src/index.css */
@import "tailwindcss";
```

Para customizar el tema (colores, fuentes, etc.), usar la directiva `@theme` en el CSS:
```css
@import "tailwindcss";
@theme {
  --color-brand: oklch(60% 0.2 260);
  --font-sans: "Inter", system-ui, sans-serif;
}
```

---

## Estructura de archivos

```
irvinbot-frontend/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── src/
    ├── main.jsx              ← createRoot, monta <App>
    ├── App.jsx               ← BrowserRouter + Routes
    ├── index.css             ← @import "tailwindcss"
    │
    ├── api/                  ← capa de comunicación con el backend
    │   ├── client.js         ← fetch wrapper (inyecta token, maneja errores, SSE)
    │   ├── auth.js           ← login(), register(), getMe()
    │   ├── chat.js           ← sessions CRUD, sendMessage(), streamMessage()
    │   └── docs.js           ← uploadDocument(), listDocuments(), deleteDocument()
    │
    ├── context/
    │   └── AuthContext.jsx   ← user state global, login(), logout(), token en localStorage
    │
    ├── router/
    │   └── ProtectedRoute.jsx ← redirige a /login si no hay usuario autenticado
    │
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   └── ChatPage.jsx      ← página principal con sidebar + chat
    │
    └── components/
        ├── chat/
        │   ├── SessionList.jsx    ← lista de conversaciones + botón nueva sesión
        │   ├── ChatWindow.jsx     ← lista de mensajes + pantalla de bienvenida
        │   ├── MessageBubble.jsx  ← burbuja usuario (derecha) o asistente (izquierda)
        │   └── MessageInput.jsx   ← textarea auto-expandible, Enter para enviar
        ├── docs/
        │   ├── UploadButton.jsx   ← input file oculto, solo acepta PDF
        │   └── DocumentList.jsx   ← lista de PDFs con estado (ready/processing/error)
        └── ui/
            ├── Button.jsx    ← variantes: primary, ghost, danger + estado loading
            ├── Input.jsx     ← input con label y mensaje de error
            └── Spinner.jsx   ← spinner animado, tamaños sm/md/lg
```

---

## Flujo de autenticación

```
1. Usuario entra a cualquier ruta
2. AuthContext (useEffect) lee localStorage["access_token"]
3. Si existe → llama GET /auth/me para validar
   - Éxito → usuario autenticado, carga la app
   - Falla → borra token, redirige a /login
4. Login exitoso → guarda access_token + refresh_token en localStorage
5. Logout → borra tokens, setUser(null) → ProtectedRoute redirige a /login
```

El token se inyecta automáticamente en cada request via `api/client.js`:
```js
const token = localStorage.getItem('access_token')
headers: { Authorization: `Bearer ${token}` }
```

---

## Flujo de streaming SSE

El endpoint `/chat/sessions/{id}/stream` devuelve Server-Sent Events. Como es un `POST`, no se puede usar `EventSource` (solo soporta `GET`). Se usa `fetch` + `ReadableStream`:

```js
// api/client.js - streamRequest()
const res = await fetch(url, { method: 'POST', ... })
const reader = res.body.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  // parsear líneas "data: {"chunk": "..."}\n\n"
  onChunk(data.chunk)
}
```

En `ChatPage.jsx`, cada chunk actualiza `streamingContent` que se pasa a `ChatWindow` → `MessageBubble` con `streaming=true` (muestra cursor parpadeante).

---

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del gateway | `http://localhost:8000/api` |

---

## Cómo correr localmente

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env si el gateway no está en localhost:8000

# Iniciar servidor de desarrollo
npm run dev
# → http://localhost:5173
```

El gateway debe estar corriendo para que la app funcione.

```bash
# Build de producción
npm run build
# → genera dist/ listo para Vercel, Netlify, etc.

# Preview del build de producción localmente
npm run preview
```

---

## Deploy en Vercel

```bash
npm i -g vercel
vercel --prod
```

Configurar en el dashboard de Vercel:
- Variable de entorno: `VITE_API_URL=https://tu-gateway.onrender.com/api`

---

## Rutas de la app

| Ruta | Componente | Protegida |
|------|------------|-----------|
| `/login` | `LoginPage` | No |
| `/register` | `RegisterPage` | No |
| `/chat` | `ChatPage` | Sí (redirige a `/login`) |
| `/*` | → redirect a `/chat` | — |

---

## Cómo extender este proyecto

**Añadir una nueva página:**
1. Crear `src/pages/NuevaPagina.jsx`
2. Añadir la ruta en `App.jsx`:
   ```jsx
   <Route path="/nueva" element={<ProtectedRoute><NuevaPagina /></ProtectedRoute>} />
   ```

**Añadir llamadas a un nuevo endpoint:**
1. Crear `src/api/nuevo_servicio.js` usando `client.get()`, `client.post()`, etc.
2. Importar y usar en el componente que lo necesite

**Cambiar el URL del backend:**
Solo modificar `VITE_API_URL` en `.env`. El cliente (`api/client.js`) lee esta variable automáticamente.

**Añadir más temas de Tailwind:**
En `src/index.css`, extender `@theme`:
```css
@import "tailwindcss";
@theme {
  --color-primary-500: oklch(62% 0.2 260);
  --radius-card: 1rem;
}
```
Luego usar con clases como `bg-primary-500` o `rounded-[--radius-card]`.
