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
    if (!res.ok) throw new Error(res.message)
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

}
