import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

const parseDate = (date) => {
  if (
    typeof date === 'string' &&
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(date) &&
    !/(Z|[+-]\d{2}:?\d{2})$/i.test(date)
  ) {
    return dayjs(`${date.replace(' ', 'T')}Z`)
  }
  return dayjs(date)
}

export const formatDate = (date) =>
  date ? parseDate(date).format('DD/MM/YYYY') : '—'

export const formatDateTime = (date) =>
  date ? parseDate(date).format('DD/MM/YYYY HH:mm') : '—'

export const formatDateInput = (date) =>
  date ? parseDate(date).format('YYYY-MM-DD') : ''

export const diasParaVencer = (fecha) =>
  fecha ? parseDate(fecha).diff(dayjs(), 'day') : null

export const estaVencido = (fecha) =>
  fecha ? parseDate(fecha).isBefore(dayjs()) : false
