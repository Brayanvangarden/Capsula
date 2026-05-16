import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

export const formatDate = (date) =>
  date ? dayjs(date).format('DD/MM/YYYY') : '—'

export const formatDateTime = (date) =>
  date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '—'

export const formatDateInput = (date) =>
  date ? dayjs(date).format('YYYY-MM-DD') : ''

export const diasParaVencer = (fecha) =>
  fecha ? dayjs(fecha).diff(dayjs(), 'day') : null

export const estaVencido = (fecha) =>
  fecha ? dayjs(fecha).isBefore(dayjs()) : false
