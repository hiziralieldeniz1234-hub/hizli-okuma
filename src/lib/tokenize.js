/**
 * Metni RSVP karelerine (frame) çevirir.
 *
 * Bir "kare" ekranda tek seferde gösterilen şeydir. Kelime grubu (chunk) 1 ise
 * kare = tek kelime. 2-3 ise kare = yan yana 2-3 kelime.
 */

/**
 * Odak harfi (ORP - Optimal Recognition Point) indeksi.
 * Göz bir kelimeyi tam ortasından değil, hafif solundan bir noktadan tanır.
 * Bu noktayı sabit tutmak gözün satır üstünde zıplamasını engeller.
 */
const PIVOT_BY_LENGTH = [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]

export function pivotIndex(word) {
  return word.length < PIVOT_BY_LENGTH.length ? PIVOT_BY_LENGTH[word.length] : 4
}

/** Cümle sonu noktalaması (uzun duraklama) */
const SENTENCE_END = /[.!?…]["'»”’)\]]*$/
/** Cümle içi noktalama (kısa duraklama) */
const CLAUSE_END = /[,;:—–)]["'»”’]*$/

/**
 * Kelime başına bekleme çarpanı. 1 = normal süre.
 * Uzun kelimeler ve noktalama, okumaya doğal bir nefes payı bırakır.
 */
function multiplierFor(word, isParagraphEnd) {
  const letters = word.replace(/[^\p{L}\p{N}]/gu, '')
  let m = 1

  if (letters.length >= 9) m += 0.25
  if (letters.length >= 13) m += 0.25

  if (SENTENCE_END.test(word)) m += 1.1
  else if (CLAUSE_END.test(word)) m += 0.45

  if (isParagraphEnd) m += 0.7

  return m
}

/**
 * Ham metni kelime nesnelerine ayırır.
 * @returns {{ text: string, pivot: number, mult: number }[]}
 */
export function tokenize(raw) {
  if (!raw) return []

  const paragraphs = String(raw)
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const tokens = []

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    words.forEach((text, i) => {
      const isParagraphEnd = i === words.length - 1
      tokens.push({
        text,
        pivot: pivotIndex(text),
        mult: multiplierFor(text, isParagraphEnd),
      })
    })
  }

  return tokens
}

/**
 * Kelimeleri gösterim karelerine böler.
 * @param {ReturnType<typeof tokenize>} tokens
 * @param {number} chunkSize Kare başına kelime sayısı (1-3)
 * @returns {{ words: typeof tokens, mult: number, upto: number }[]}
 *          `upto` = bu kare bittiğinde okunmuş toplam kelime sayısı.
 */
export function buildFrames(tokens, chunkSize = 1) {
  const size = Math.max(1, Math.min(3, Math.round(chunkSize) || 1))
  const frames = []

  /*
   * Çarpanları metin genelinde normalize et: ortalama 1'e sabitlenince doğal
   * ritim toplam süreyi değiştirmez, sadece zamanı kelimeler arasında yeniden
   * dağıtır. Normalize edilmezse 300 k/dk ayarı fiilen ~250 k/dk olur.
   */
  const totalMult = tokens.reduce((sum, t) => sum + t.mult, 0)
  const norm = totalMult > 0 ? tokens.length / totalMult : 1

  for (let i = 0; i < tokens.length; i += size) {
    const words = tokens.slice(i, i + size)
    frames.push({
      words,
      mult: words.reduce((sum, w) => sum + w.mult, 0) * norm,
      upto: i + words.length,
    })
  }

  return frames
}

/**
 * Bir karenin ekranda kalma süresi (ms).
 * `natural` kapalıysa her kelime tam olarak 60000/wpm sürer.
 */
export function frameDelay(frame, wpm, natural = true) {
  const base = 60000 / Math.max(60, wpm)
  return natural ? base * frame.mult : base * frame.words.length
}

/**
 * Kalan karelerin tahmini süresi (ms). İlerleme ekranındaki "~kalan" için.
 */
export function estimateDuration(frames, fromIndex, wpm, natural = true) {
  let total = 0
  for (let i = fromIndex; i < frames.length; i++) {
    total += frameDelay(frames[i], wpm, natural)
  }
  return total
}

/** Hızlı kelime sayımı (metni tam tokenize etmeden). */
export function countWords(raw) {
  if (!raw) return 0
  const trimmed = String(raw).trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}
