import { Check } from 'lucide-react'
import { Button, Stat } from '../components/ui'
import { formatDuration, formatNumber } from '../lib/format'

/** Okuma bittiğinde (ya da erken durdurulduğunda) gösterilen özet. */
export function FinishScreen({
  title,
  words,
  totalWords,
  durationMs,
  wpm,
  completed,
  onRestart,
  onExit,
  onStats,
}) {
  const actualWpm = durationMs > 0 ? Math.round(words / (durationMs / 60000)) : 0
  const coverage = totalWords ? Math.round((words / totalWords) * 100) : 0

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12 lg:max-w-lg safe-top safe-bottom">
      <div className="rise-in text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft elev-1">
          <Check size={28} strokeWidth={2.4} className="text-accent" />
        </div>
        <h2 className="mt-5 text-[23px] font-bold tracking-[-0.028em] text-ink">
          {completed ? 'Okuma tamamlandı' : 'Okuma durduruldu'}
        </h2>
        <p className="mt-1.5 truncate text-[14px] text-ink-2">{title}</p>
      </div>

      <div
        className="rise-in mt-9 grid grid-cols-2 gap-3.5"
        style={{ animationDelay: '70ms' }}
      >
        <Stat
          value={formatNumber(words)}
          label="Okunan kelime"
          sub={completed ? null : `metnin %${coverage}'i`}
        />
        <Stat value={formatDuration(durationMs)} label="Süre" />
        <Stat value={formatNumber(actualWpm)} label="Gerçekleşen hız" sub="kelime/dk" />
        <Stat value={formatNumber(wpm)} label="Ayarlanan hız" sub="kelime/dk" />
      </div>

      <div className="rise-in mt-9 space-y-3" style={{ animationDelay: '140ms' }}>
        <Button onClick={onRestart} className="w-full">
          Tekrar oku
        </Button>
        <Button variant="secondary" onClick={onExit} className="w-full">
          Yeni metin
        </Button>
        <Button variant="ghost" onClick={onStats} className="w-full">
          İstatistiklerim
        </Button>
      </div>
    </div>
  )
}
