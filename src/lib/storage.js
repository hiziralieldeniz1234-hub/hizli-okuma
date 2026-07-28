/**
 * localStorage sarmalayıcısı.
 * Tüm anahtarlar sürümlü — ileride veri şeması değişirse eski kayıtlar
 * çakışmadan bir kenarda durur.
 */

const SESSIONS_KEY = 'hizliokuma.sessions.v1'
const SETTINGS_KEY = 'hizliokuma.settings.v1'
export const THEME_KEY = 'hizliokuma.theme.v1'

/** Geçmişte tutulacak en fazla seans sayısı (localStorage şişmesin). */
const MAX_SESSIONS = 500

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    // Kota dolu ya da gizli sekme — sessizce geç, uygulama çalışmaya devam etsin.
    return false
  }
}

/* ------------------------------- Ayarlar -------------------------------- */

export const DEFAULT_SETTINGS = {
  wpm: 300,
  chunkSize: 1,
  naturalRhythm: true,
  showFocusLetter: true,
  countdown: true,
}

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...read(SETTINGS_KEY, {}) }
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings)
}

/* ------------------------------- Seanslar ------------------------------- */

/**
 * @typedef {Object} Session
 * @property {string}  id
 * @property {string}  date       ISO tarih
 * @property {string}  title      Metin adı
 * @property {number}  words      Okunan kelime sayısı
 * @property {number}  totalWords Metnin toplam kelime sayısı
 * @property {number}  durationMs Gerçek okuma süresi (duraklamalar hariç)
 * @property {number}  wpm        Ayarlanan hız
 * @property {number}  actualWpm  Gerçekleşen hız
 * @property {boolean} completed  Metin sonuna kadar okundu mu
 */

export function loadSessions() {
  const list = read(SESSIONS_KEY, [])
  return Array.isArray(list) ? list : []
}

export function saveSession(session) {
  const list = loadSessions()
  list.unshift(session)
  const trimmed = list.slice(0, MAX_SESSIONS)
  write(SESSIONS_KEY, trimmed)
  return trimmed
}

export function clearSessions() {
  try {
    localStorage.removeItem(SESSIONS_KEY)
  } catch {
    /* yok say */
  }
  return []
}

/** Seans listesinden genel istatistikleri hesaplar. */
export function computeStats(sessions) {
  const totalWords = sessions.reduce((sum, s) => sum + (s.words || 0), 0)
  const totalMs = sessions.reduce((sum, s) => sum + (s.durationMs || 0), 0)
  const avgWpm = totalMs > 0 ? Math.round(totalWords / (totalMs / 60000)) : 0
  const bestWpm = sessions.reduce((max, s) => Math.max(max, s.actualWpm || 0), 0)

  return {
    totalWords,
    totalMs,
    avgWpm,
    bestWpm: Math.round(bestWpm),
    count: sessions.length,
  }
}
