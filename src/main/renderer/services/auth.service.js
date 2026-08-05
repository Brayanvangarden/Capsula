/**
 * Servicio de autenticación
 * Se comunica con el IPC a través de window.api.auth
 */

export const authService = {

  /**
   * Iniciar sesión
   * @param {string} usuario
   * @param {string} password
   */
  login: async (usuario, password) => {
    const res = await window.api.auth.login({ usuario, password })
    if (!res.ok) {
      const error = new Error(res.message)
      error.lockedUntil = res.lockedUntil
      error.attempts = res.attempts
      throw error
    }
    return res.data
  },

  /**
   * Obtener usuario por ID
   * @param {number} id
   */
  getById: async (id) => {
    const res = await window.api.auth.getById(id)
    if (!res.ok) throw new Error(res.message)
    return res.data
  },

  /**
   * Solicitar código de recuperación de contraseña
   * @param {string} usuarioOrCorreo
   * @param {object|null} smtpConfig
   */
  requestPasswordReset: async (usuarioOrCorreo, smtpConfig = null) => {
    const res = await window.api.auth.requestPasswordReset({ usuarioOrCorreo, smtpConfig })
    if (!res.ok) {
      const error = new Error(res.message)
      error.emailSent = res.emailSent
      error.debugCode = res.debugCode
      throw error
    }
    return res
  },

  /**
   * Restablecer contraseña con código temporal
   * @param {object} payload
   */
  resetPassword: async ({ usuarioOrCorreo, code, password }) => {
    const res = await window.api.auth.resetPassword({ usuarioOrCorreo, code, newPassword: password })
    if (!res.ok) throw new Error(res.message)
    return res
  },

}
