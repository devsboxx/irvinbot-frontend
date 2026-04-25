/** User-facing copy keyed by err.code from the API (and fallbacks by HTTP status). */

export function loginErrorMessage(err) {
  const byCode = {
    invalid_credentials: 'Correo electrónico o contraseña incorrectos.',
    account_deactivated: 'Tu cuenta está desactivada. Contacta al administrador.',
    invalid_token:
      'No se pudo validar la sesión. Asegúrate de que el gateway y el servicio de auth usan el mismo SECRET_KEY.',
    missing_bearer: 'Error de autenticación con el servidor.',
  }
  if (err?.code && byCode[err.code]) return byCode[err.code]

  const byStatus = {
    401: 'Correo electrónico o contraseña incorrectos.',
    403: 'Tu cuenta está desactivada. Contacta al administrador.',
    422: 'Verifica los datos ingresados.',
    503: 'Servicio no disponible. Intenta más tarde.',
  }
  return byStatus[err?.status] ?? err?.message ?? 'Error al iniciar sesión.'
}

export function registerErrorMessage(err) {
  const byCode = {
    email_already_registered: 'Este correo ya está registrado. ¿Quieres iniciar sesión?',
    invalid_credentials: 'Correo electrónico o contraseña incorrectos.',
  }
  if (err?.code && byCode[err.code]) return byCode[err.code]

  const byStatus = {
    409: 'Este correo ya está registrado. ¿Quieres iniciar sesión?',
    422: 'Verifica los datos ingresados.',
    503: 'Servicio no disponible. Intenta más tarde.',
  }
  return byStatus[err?.status] ?? err?.message ?? 'Error al crear la cuenta.'
}
