import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

export const parseStoredDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value

  const text = String(value)
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    )
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(text)) {
    return new Date(`${text.replace(' ', 'T')}Z`)
  }

  if (/^\d{4}-\d{2}-\d{2}T.*$/.test(text) && !/(Z|[+-]\d{2}:?\d{2})$/i.test(text)) {
    return new Date(`${text}Z`)
  }

  return new Date(text)
}

export const localDateString = (value = new Date()) => {
  const date = value instanceof Date ? value : parseStoredDate(value)
  if (!date || Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const localMonthString = (value = new Date()) =>
  localDateString(value).slice(0, 7)

export const formatDate = (date) =>
  date ? dayjs(parseStoredDate(date)).format('DD/MM/YYYY') : '—'

export const formatDateTime = (date) =>
  date ? dayjs(parseStoredDate(date)).format('DD/MM/YYYY HH:mm') : '—'

export const formatDateInput = (date) =>
  date ? dayjs(parseStoredDate(date)).format('YYYY-MM-DD') : ''

export const diasParaVencer = (fecha) =>
  fecha ? dayjs(parseStoredDate(fecha)).diff(dayjs(), 'day') : null

export const estaVencido = (fecha) =>
  fecha ? dayjs(parseStoredDate(fecha)).isBefore(dayjs()) : false
