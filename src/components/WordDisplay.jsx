/**
 * RSVP kelime gösterimi.
 *
 * Odak harfi (ORP) her zaman ekranın tam ortasında durur — böylece göz
 * kelimeden kelimeye zıplamaz, tek bir noktaya sabitlenir. Hizalama
 * `minmax(0,1fr) auto minmax(0,1fr)` gridiyle yapılıyor: yan sütunlar her
 * zaman eşit genişlikte olduğu için ortadaki harf tam merkezde kalır.
 */

/**
 * Kelime uzadıkça punto küçülsün ki dar ekranda taşmasın.
 * Üst sınırlar masaüstünde daha yüksek: geniş ekranda kelime uzaktan da
 * rahat okunacak kadar büyük olmalı.
 */
function sizeClass(length) {
  if (length <= 10) return 'text-[clamp(2.25rem,11vw,5rem)]'
  if (length <= 14) return 'text-[clamp(1.9rem,8.5vw,4.25rem)]'
  if (length <= 20) return 'text-[clamp(1.5rem,6.5vw,3.25rem)]'
  return 'text-[clamp(1.15rem,5vw,2.5rem)]'
}

export function WordDisplay({ frame, showFocusLetter }) {
  if (!frame) {
    return <div className="h-[1.35em] text-[clamp(2.25rem,11vw,4rem)]" />
  }

  const words = frame.words
  const multiWord = words.length > 1
  const joined = words.map((w) => w.text).join(' ')

  // Birden fazla kelime aynı anda gösteriliyorsa odak harfi anlamını yitirir;
  // grubu olduğu gibi ortalayarak veririz.
  if (multiWord || !showFocusLetter) {
    return (
      <div
        key={joined}
        className={`word-in no-select flex items-center justify-center px-4 text-center leading-[1.35] font-medium tracking-[-0.02em] text-ink ${sizeClass(joined.length)}`}
      >
        {joined}
      </div>
    )
  }

  const { text, pivot } = words[0]
  const before = text.slice(0, pivot)
  const letter = text.slice(pivot, pivot + 1)
  const after = text.slice(pivot + 1)

  return (
    <div
      key={text}
      className={`word-in no-select relative grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-baseline leading-[1.35] font-medium tracking-[-0.02em] text-ink ${sizeClass(text.length)}`}
    >
      <span className="justify-self-end whitespace-pre">{before}</span>
      <span className="text-focus">{letter}</span>
      <span className="justify-self-start whitespace-pre">{after}</span>
    </div>
  )
}

/**
 * Odak noktasını işaretleyen ince çizgiler. Kelimenin üstünde ve altında
 * durur, gözün sabitleneceği yeri gösterir.
 */
export function FocusGuides({ visible }) {
  if (!visible) return null

  return (
    <>
      <div
        aria-hidden
        className="absolute top-0 left-1/2 h-3.5 w-px -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent to-ink-3/45"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/2 h-3.5 w-px -translate-x-1/2 rounded-full bg-gradient-to-t from-transparent to-ink-3/45"
      />
    </>
  )
}
