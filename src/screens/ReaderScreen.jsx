import { useEffect, useMemo, useRef } from 'react'
import { ArrowLeft, FastForward, Pause, Play, Rewind, RotateCcw, Square } from 'lucide-react'
import { useRsvp } from '../hooks/useRsvp'
import { SPEED_LEVELS, levelForWpm } from '../lib/levels'
import { buildFrames, tokenize } from '../lib/tokenize'
import { FocusGuides, WordDisplay } from '../components/WordDisplay'
import { IconButton, Slider } from '../components/ui'
import { formatDuration } from '../lib/format'
import { FinishScreen } from './FinishScreen'

/** Geri/ileri sarmada atlanacak kelime sayısı */
const SEEK_WORDS = 10

/** Klavye tuşu rozeti */
function Key({ children }) {
  return (
    <kbd className="rounded-[5px] bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] font-medium text-ink-2">
      {children}
    </kbd>
  )
}

export function ReaderScreen({ source, settings, updateSettings, onExit, onComplete, onStats }) {
  const tokens = useMemo(() => tokenize(source.content), [source.content])
  const frames = useMemo(() => buildFrames(tokens, settings.chunkSize), [tokens, settings.chunkSize])

  const rsvp = useRsvp(frames, {
    wpm: settings.wpm,
    naturalRhythm: settings.naturalRhythm,
    countdown: settings.countdown,
  })

  const {
    status,
    index,
    frame,
    progress,
    wordsRead,
    total,
    elapsedMs,
    getElapsedMs,
    countdownValue,
    play,
    toggle,
    seek,
    finish,
    restart,
  } = rsvp

  /**
   * Kalan süre için sonek toplamı: suffix[i] = i'den sona kadarki toplam
   * "birim". Hız ayrı bir çarpan olduğu için wpm değişince yeniden
   * hesaplanması gerekmez.
   */
  const suffix = useMemo(() => {
    const arr = new Float64Array(frames.length + 1)
    for (let i = frames.length - 1; i >= 0; i--) {
      const unit = settings.naturalRhythm ? frames[i].mult : frames[i].words.length
      arr[i] = arr[i + 1] + unit
    }
    return arr
  }, [frames, settings.naturalRhythm])

  const remainingMs = (60000 / settings.wpm) * (suffix[Math.min(index, frames.length)] || 0)
  const level = levelForWpm(settings.wpm)

  /* Seans yalnızca bir kez kaydedilsin. */
  const savedRef = useRef(false)

  useEffect(() => {
    if (status !== 'done' || savedRef.current) return
    savedRef.current = true

    const durationMs = getElapsedMs()
    const words = wordsRead
    const completed = index >= total

    // Çok kısa denemeleri geçmişe yazma — istatistikleri bozarlar.
    if (words < 5 || durationMs < 1000) return

    onComplete({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      title: source.title,
      words,
      totalWords: tokens.length,
      durationMs,
      wpm: settings.wpm,
      actualWpm: Math.round(words / (durationMs / 60000)),
      completed,
    })
  }, [
    status,
    index,
    total,
    wordsRead,
    tokens.length,
    settings.wpm,
    source.title,
    onComplete,
    getElapsedMs,
  ])

  /* Klavye kısayolları (masaüstü) */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      if (e.code === 'Space') {
        e.preventDefault()
        toggle()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        seek(-Math.ceil(SEEK_WORDS / settings.chunkSize))
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        seek(Math.ceil(SEEK_WORDS / settings.chunkSize))
      } else if (e.code === 'Escape') {
        e.preventDefault()
        onExit()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, seek, onExit, settings.chunkSize])

  /*
   * İlk açılışta otomatik başlat. Bayrakla korumaya çalışma: motorun temizliği
   * efektler yeniden kurulduğunda zamanlayıcıları siliyor, bayrak ikinci
   * kurulumda başlatmayı atlar ve okuma hiç ilerlemez. play referansı sabit,
   * ayrıca play() kendi zamanlayıcılarını temizliyor.
   */
  useEffect(() => {
    play()
  }, [play])

  if (status === 'done') {
    return (
      <FinishScreen
        title={source.title}
        words={wordsRead}
        totalWords={tokens.length}
        durationMs={elapsedMs}
        wpm={settings.wpm}
        completed={index >= total}
        onRestart={() => {
          savedRef.current = false
          restart()
          play()
        }}
        onExit={onExit}
        onStats={onStats}
      />
    )
  }

  const seekStep = Math.max(1, Math.ceil(SEEK_WORDS / settings.chunkSize))
  const isPlaying = status === 'running' || status === 'countdown'

  return (
    <div className="screen-enter flex min-h-dvh flex-col safe-top safe-bottom">
      {/* Üst çubuk */}
      <header className="flex items-center gap-2 px-3 py-3">
        <IconButton size="sm" label="Çık" onClick={onExit}>
          <ArrowLeft size={21} strokeWidth={1.9} />
        </IconButton>
        <p className="min-w-0 flex-1 truncate text-center text-[13px] font-medium text-ink-2">
          {source.title}
        </p>
        <div className="h-11 w-11 shrink-0" />
      </header>

      {/* Kelime alanı — ekranın ortası */}
      <main className="relative flex flex-1 items-center justify-center px-3">
        <div className="relative w-full max-w-3xl">
          <FocusGuides visible={settings.showFocusLetter && settings.chunkSize === 1} />
          <div className="flex min-h-[1.35em] items-center py-8">
            {status === 'countdown' ? (
              <div
                key={countdownValue}
                className="word-in w-full text-center text-[clamp(3.5rem,15vw,5.5rem)] font-light text-ink-3 tabular-nums"
              >
                {countdownValue}
              </div>
            ) : (
              <WordDisplay frame={frame} showFocusLetter={settings.showFocusLetter} />
            )}
          </div>
        </div>
      </main>

      {/* İlerleme */}
      <div className="mx-auto w-full max-w-3xl px-6">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-hi))] transition-[width] duration-150 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px] font-medium text-ink-3 tabular-nums">
          <span>
            {wordsRead} / {tokens.length}
          </span>
          <span>~{formatDuration(remainingMs)} kaldı</span>
        </div>
      </div>

      {/* Kontroller */}
      <footer className="px-6 pt-7 pb-5">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          <IconButton
            label="Baştan başlat"
            onClick={() => {
              restart()
              // Okuma sürüyorken başa dönülüyorsa akış kesilmesin.
              if (isPlaying) play()
            }}
          >
            <RotateCcw size={19} strokeWidth={1.9} />
          </IconButton>

          <IconButton
            label={`${SEEK_WORDS} kelime geri`}
            size="lg"
            tone="surface"
            onClick={() => seek(-seekStep)}
            disabled={index === 0}
          >
            <Rewind size={22} strokeWidth={1.9} />
          </IconButton>

          <IconButton
            label={isPlaying ? 'Duraklat' : 'Başlat'}
            size="xl"
            tone="accent"
            onClick={toggle}
          >
            {isPlaying ? (
              <Pause size={28} strokeWidth={2} fill="currentColor" />
            ) : (
              <Play size={28} strokeWidth={2} fill="currentColor" className="ml-0.5" />
            )}
          </IconButton>

          <IconButton
            label={`${SEEK_WORDS} kelime ileri`}
            size="lg"
            tone="surface"
            onClick={() => seek(seekStep)}
            disabled={index >= total - 1}
          >
            <FastForward size={22} strokeWidth={1.9} />
          </IconButton>

          <IconButton label="Durdur ve bitir" onClick={finish}>
            <Square size={16} strokeWidth={2} fill="currentColor" />
          </IconButton>
        </div>

        {/* Okurken hız ayarı. Seçili olmayan seviyeler zeminsiz — okuma ekranında
            tek vurgu aktif seviyede kalsın. */}
        <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-1">
          {SPEED_LEVELS.map((l) => {
            const active = l.id === level.id
            return (
              <button
                key={l.id}
                onClick={() => updateSettings({ wpm: l.wpm })}
                aria-pressed={active}
                className={`min-h-8 rounded-full px-3 text-[12px] font-medium transition-[background-color,box-shadow,transform,color] duration-150 ease-out-soft active:scale-[0.96] ${
                  active
                    ? 'bg-[linear-gradient(180deg,var(--accent-hi),var(--accent))] text-accent-ink elev-accent'
                    : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                {l.label}
              </button>
            )
          })}
        </div>

        <div className="mx-auto mt-4 flex max-w-md items-center gap-4">
          <span className="w-12 shrink-0 text-[12px] font-semibold text-ink-2 tabular-nums">
            {settings.wpm}
          </span>
          <Slider
            min={100}
            max={1000}
            step={10}
            value={settings.wpm}
            onChange={(wpm) => updateSettings({ wpm })}
            label="Okuma hızı (dakikada kelime)"
            className="flex-1"
          />
          <span className="w-12 shrink-0 text-right text-[12px] font-medium text-ink-3">k/dk</span>
        </div>

        {/* Klavye ipuçları — yalnızca masaüstünde, dokunmatikte anlamsız */}
        <p className="mt-6 hidden text-center text-[12px] text-ink-3 lg:block">
          <Key>Boşluk</Key> başlat/duraklat · <Key>←</Key> <Key>→</Key> 10 kelime ·{' '}
          <Key>Esc</Key> çık
        </p>
      </footer>
    </div>
  )
}
