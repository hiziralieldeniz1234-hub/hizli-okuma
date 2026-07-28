import { useMemo, useState } from 'react'
import { ArrowLeft, History, Trash2 } from 'lucide-react'
import { Button, Card, EmptyState, IconButton, Stat } from '../components/ui'
import { dayLabel, formatDuration, formatDurationLong, formatNumber, formatTime } from '../lib/format'

export function StatsScreen({ sessions, stats, onClear, onBack }) {
  const [confirming, setConfirming] = useState(false)

  /** Seansları güne göre grupla — uzun liste böylece okunabilir kalır. */
  const groups = useMemo(() => {
    const map = new Map()
    for (const s of sessions) {
      const key = dayLabel(s.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(s)
    }
    return [...map.entries()]
  }, [sessions])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 pb-12 lg:px-8 safe-top safe-bottom">
      <header className="flex items-center gap-2 py-5 lg:py-7">
        <IconButton size="sm" label="Geri" onClick={onBack} className="-ml-2">
          <ArrowLeft size={20} strokeWidth={1.9} />
        </IconButton>
        <h1 className="text-[19px] font-bold tracking-[-0.025em] text-ink lg:text-[24px] lg:tracking-[-0.03em]">
          İstatistikler
        </h1>
      </header>

      <main className="flex-1 space-y-8 lg:space-y-10">
        {/* Masaüstünde dört kutu tek sırada */}
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4 lg:gap-4">
          <Stat value={formatNumber(stats.totalWords)} label="Toplam okunan kelime" />
          <Stat value={formatNumber(stats.avgWpm)} label="Ortalama hız" sub="kelime/dk" />
          <Stat value={formatDurationLong(stats.totalMs)} label="Toplam okuma süresi" />
          <Stat
            value={formatNumber(stats.count)}
            label="Okuma seansı"
            sub={stats.bestWpm ? `en yüksek ${formatNumber(stats.bestWpm)} k/dk` : null}
          />
        </div>

        <section className="space-y-3">
          <h2 className="px-1 text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
            Geçmiş
          </h2>

          {sessions.length === 0 ? (
            <EmptyState
              icon={History}
              title="Henüz okuma yapmadın"
              description="İlk seansını bitirdiğinde burada tarih, süre ve hızınla birlikte görünecek."
            />
          ) : (
            <div className="space-y-6">
              {groups.map(([label, items]) => (
                <div key={label}>
                  <p className="mb-2.5 px-1 text-[13px] font-medium text-ink-2">{label}</p>
                  <Card className="divide-y divide-line/70 p-0">
                    {items.map((s) => (
                      <SessionRow key={s.id} session={s} />
                    ))}
                  </Card>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {sessions.length > 0 ? (
        <footer className="mt-10 lg:mx-auto lg:w-full lg:max-w-sm">
          {confirming ? (
            <Card>
              <p className="text-[14px] leading-relaxed text-ink">
                Tüm okuma geçmişin silinecek. Bu işlem geri alınamaz.
              </p>
              <div className="mt-4 flex gap-3">
                <Button variant="secondary" onClick={() => setConfirming(false)} className="flex-1">
                  Vazgeç
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    onClear()
                    setConfirming(false)
                  }}
                  className="flex-1"
                >
                  Sil
                </Button>
              </div>
            </Card>
          ) : (
            <Button variant="ghost" onClick={() => setConfirming(true)} className="w-full">
              <Trash2 size={17} strokeWidth={1.9} />
              Geçmişi temizle
            </Button>
          )}
        </footer>
      ) : null}
    </div>
  )
}

function SessionRow({ session }) {
  const { title, words, durationMs, wpm, actualWpm, completed, date } = session

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-ink">{title}</p>
        <p className="mt-1 text-[13px] text-ink-2 tabular-nums">
          {formatTime(date)} · {formatNumber(words)} kelime · {formatDuration(durationMs)}
          {completed ? '' : ' · yarım'}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[16px] font-semibold tracking-[-0.02em] text-ink tabular-nums">
          {formatNumber(actualWpm || wpm)}
        </p>
        <p className="text-[12px] text-ink-3">k/dk</p>
      </div>
    </div>
  )
}
