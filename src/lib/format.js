/** Görüntüleme biçimlendiricileri (hepsi Türkçe yerel ayarla). */

/** 125000 -> "2:05", 3725000 -> "1:02:05" */
export function formatDuration(ms) {
  const total = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/** Uzun süreler için okunabilir biçim: "12 dk", "1 sa 5 dk", "48 sn" */
export function formatDurationLong(ms) {
  const total = Math.round(ms / 1000)
  if (total < 60) return `${total} sn`
  const minutes = Math.round(total / 60)
  if (minutes < 60) return `${minutes} dk`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} sa ${m} dk` : `${h} sa`
}

const numberFormatter = new Intl.NumberFormat('tr-TR')

export function formatNumber(n) {
  return numberFormatter.format(Math.round(n || 0))
}

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(iso) {
  try {
    return dateFormatter.format(new Date(iso))
  } catch {
    return ''
  }
}

/** Seans listesini "Bugün / Dün / 14 Mart" gruplarına ayırır. */
export function dayLabel(iso) {
  const d = new Date(iso)
  const today = new Date()
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOf(today) - startOf(d)) / 86400000)

  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Dün'

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  }).format(d)
}

/** Saat:dakika — seans satırlarında */
const timeFormatter = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' })

export function formatTime(iso) {
  try {
    return timeFormatter.format(new Date(iso))
  } catch {
    return ''
  }
}
