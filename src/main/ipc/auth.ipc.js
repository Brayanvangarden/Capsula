const { ipcMain } = require('electron')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const authRepo = require('../database/repositories/auth.repository')

function buildUserView(user) {
  const { password, failed_attempts, locked_until, reset_code, reset_expires, ...safeUser } = user
  return safeUser
}

function sendResetEmail(to, code, smtpConfig) {
  if (!smtpConfig) {
    console.info(`No SMTP config provided. Reset code for ${to}: ${code}`)
    return { success: false, message: 'SMTP no configurado. El código se muestra solo en logs.' }
  }

  const transporter = nodemailer.createTransport(smtpConfig)
  return transporter.sendMail({
    from: smtpConfig.from || smtpConfig.auth.user,
    to,
    subject: 'Recuperación de contraseña - Capsulas',
    text: `Tu código de recuperación es: ${code}\n\nUtilízalo en la aplicación para crear una nueva contraseña.`,
  })
    .then(() => ({ success: true }))
    .catch((error) => ({ success: false, message: error.message }))
}

function registerAuthIpc() {
  const LOCK_TIMEOUT_MS = 2 * 60 * 1000
  const MAX_FAILED_ATTEMPTS = 2

  // ── Login ──────────────────────────────────────────
  ipcMain.handle('auth:login', async (_, { usuario, password }) => {
    try {
      const user = authRepo.findByUsuario(usuario)
      if (!user) {
        return { ok: false, message: 'Usuario no encontrado' }
      }

      if (user.locked_until) {
        const lockedUntil = new Date(user.locked_until)
        if (lockedUntil > new Date()) {
          return {
            ok: false,
            message: `Cuenta bloqueada hasta ${lockedUntil.toLocaleTimeString()}`,
            lockedUntil: user.locked_until,
            attempts: user.failed_attempts,
          }
        }
      }

      const passwordMatch = bcrypt.compareSync(password, user.password)
      if (!passwordMatch) {
        const attempts = user.failed_attempts + 1
        const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCK_TIMEOUT_MS).toISOString()
          : null

        authRepo.updateFailedLogin(user.id, attempts, lockedUntil)

        return {
          ok: false,
          message: lockedUntil
            ? 'Contraseña incorrecta. La cuenta se bloqueó temporalmente.'
            : `Contraseña incorrecta. Te quedan ${MAX_FAILED_ATTEMPTS - attempts} intento(s).`,
          lockedUntil,
          attempts,
        }
      }

      authRepo.resetFailedLogin(user.id)
      const safeUser = buildUserView(user)
      return { ok: true, data: safeUser }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Solicitar recuperación de contraseña ───────────
  ipcMain.handle('auth:requestPasswordReset', async (_, { usuarioOrCorreo, smtpConfig }) => {
    try {
      const user = authRepo.findByUsuarioOrCorreo(usuarioOrCorreo)
      if (!user) {
        return { ok: false, message: 'Usuario o correo no encontrado' }
      }

      const code = String(Math.floor(100000 + Math.random() * 900000))
      const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      authRepo.setResetToken(user.id, code, expires)

      const emailResult = await sendResetEmail(user.correo, code, smtpConfig)
      return {
        ok: true,
        message: 'Se ha generado un código temporal para restablecer la contraseña.',
        emailSent: emailResult.success,
        debugCode: emailResult.success ? null : code,
      }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Restablecer contraseña con código temporal ──────
  ipcMain.handle('auth:resetPassword', async (_, { usuarioOrCorreo, code, newPassword }) => {
    try {
      const user = authRepo.findByUsuarioOrCorreo(usuarioOrCorreo)
      if (!user) {
        return { ok: false, message: 'Usuario o correo no encontrado' }
      }

      if (!user.reset_code || !user.reset_expires) {
        return { ok: false, message: 'No hay un código de recuperación activo para este usuario.' }
      }

      if (String(user.reset_code).trim() !== String(code).trim()) {
        return { ok: false, message: 'Código de recuperación incorrecto' }
      }

      if (new Date(user.reset_expires) < new Date()) {
        return { ok: false, message: 'El código de recuperación ha expirado' }
      }

      authRepo.updatePassword(user.id, newPassword)
      authRepo.clearResetToken(user.id)
      authRepo.resetFailedLogin(user.id)

      return { ok: true, message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })

  // ── Obtener usuario por ID ─────────────────────────
  ipcMain.handle('auth:getById', async (_, id) => {
    try {
      const user = authRepo.findById(id)
      return { ok: true, data: user }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  })
}

module.exports = { registerAuthIpc }
