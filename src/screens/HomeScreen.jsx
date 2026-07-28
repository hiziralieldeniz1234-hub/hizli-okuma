import { useEffect, useMemo, useRef, useState } from 'react'
import { BarChart3, BookOpen, Moon, Plus, Sun } from 'lucide-react'
import {
  Button,
  Card,
  Collapsible,
  Field,
  IconButton,
  Segmented,
  Slider,
  Toggle,
} from '../components/ui'
import { countWords } from '../lib/tokenize'
import { formatDurationLong, formatNumber } from '../lib/format'
import { SPEED_LEVELS, levelForWpm } from '../lib/levels'

/** Kendi metni için kullanılan sözde kimlik. */
const OWN = '__own__'

/**
 * Ana sayfa. İki yerleşim:
 *  - <1024px: tek sütun, başlat butonu ekranın altına yapışık.
 *  - ≥1024px: solda metin ızgarası, sağda sticky hız/ayar paneli ve başlat.
 */
export function HomeScreen({
  theme,
  onToggleTheme,
  onOpenStats,
  onStart,
  settings,
  updateSettings,
  library,
  libraryError,
}) {
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState('')
  const [ownOpen, setOwnOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!selectedId && library.length) setSelectedId(library[0].id)
  }, [library, selectedId])

  const selected = useMemo(
    () => library.find((t) => t.id === selectedId) || null,
    [library, selectedId],
  )

  const isOwn = selectedId === OWN
  const content = isOwn ? draft : selected?.content
  const wordCount = countWords(content)
  const canStart = wordCount > 0

  const estimateMs = wordCount ? (wordCount / settings.wpm) * 60000 : 0
  const level = levelForWpm(settings.wpm)

  const handleStart = () => {
    if (!canStart) return
    onStart({ title: isOwn ? 'Kendi metnim' : selected.title, content })
  }

  const summary = canStart
    ? `${formatNumber(wordCount)} kelime · yaklaşık ${formatDurationLong(estimateMs)}`
    : 'Başlamak için bir metin seç'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pb-10 lg:px-8 lg:pb-12 safe-top safe-bottom">
      <header className="flex items-center justify-between py-5 lg:py-7">
        <h1 className="text-[19px] font-bold tracking-[-0.025em] text-ink lg:text-[24px] lg:tracking-[-0.03em]">
          Hızlı Okuma Pratik Yap
        </h1>
        <div className="flex items-center gap-1">
          <IconButton size="sm" label="İstatistikler" onClick={onOpenStats}>
            <BarChart3 size={20} strokeWidth={1.9} />
          </IconButton>
          <IconButton
            size="sm"
            label={theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}
            onClick={onToggleTheme}
          >
            {theme === 'dark' ? (
              <Sun size={20} strokeWidth={1.9} />
            ) : (
              <Moon size={20} strokeWidth={1.9} />
            )}
          </IconButton>
        </div>
      </header>

      <div className="flex-1 lg:flex lg:items-start lg:gap-8">
        {/* Yan panel — masaüstünde sağda ve sabit, telefonda en üstte */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:order-2 lg:w-[336px] lg:shrink-0">
          <Card>
            <Field label="Okuma hızı" hint={`${settings.wpm} kelime/dk`}>
              <div className="flex flex-wrap gap-2">
                {SPEED_LEVELS.map((l) => {
                  const active = l.id === level.id
                  return (
                    <button
                      key={l.id}
                      onClick={() => updateSettings({ wpm: l.wpm })}
                      aria-pressed={active}
                      className={`min-h-9 rounded-full px-4 text-[13px] font-medium transition-[background-color,box-shadow,transform,color] duration-150 ease-out-soft active:scale-[0.97] ${
                        active
                          ? 'bg-[linear-gradient(180deg,var(--accent-hi),var(--accent))] text-accent-ink elev-accent'
                          : 'bg-surface-2 text-ink-2 hover:text-ink'
                      }`}
                    >
                      {l.label}
                    </button>
                  )
                })}
              </div>

              <div className="pt-1">
                <Slider
                  min={100}
                  max={1000}
                  step={10}
                  value={settings.wpm}
                  onChange={(wpm) => updateSettings({ wpm })}
                  label="Okuma hızı (dakikada kelime)"
                />
                <div className="flex justify-between text-[12px] font-medium text-ink-3 tabular-nums">
                  <span>100</span>
                  <span>1000</span>
                </div>
              </div>

              <p className="text-[13px] leading-relaxed text-ink-2">{level.hint}</p>
            </Field>
          </Card>

          <Collapsible
            title="Gelişmiş ayarlar"
            open={advancedOpen}
            onToggle={() => setAdvancedOpen((o) => !o)}
          >
            <div className="space-y-5 pt-4">
              <Field label="Kelime grubu" hint={`${settings.chunkSize} kelime`}>
                <Segmented
                  options={[
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                  ]}
                  value={settings.chunkSize}
                  onChange={(v) => updateSettings({ chunkSize: v })}
                />
                <p className="text-[13px] leading-relaxed text-ink-2">
                  Ekranda aynı anda kaç kelime görüneceği. Yeni başlıyorsan 1'de kal.
                </p>
              </Field>

              <div className="divide-y divide-line/70 border-t border-line/70">
                <Toggle
                  label="Odak harfi"
                  description="Her kelimede bir harf renklenir ve hep aynı noktada durur; göz sabitlenir."
                  checked={settings.showFocusLetter}
                  onChange={(v) => updateSettings({ showFocusLetter: v })}
                />
                <Toggle
                  label="Doğal ritim"
                  description="Noktalama ve uzun kelimelerde biraz daha uzun bekler."
                  checked={settings.naturalRhythm}
                  onChange={(v) => updateSettings({ naturalRhythm: v })}
                />
                <Toggle
                  label="Geri sayım"
                  description="Okumaya başlarken 3-2-1 sayar."
                  checked={settings.countdown}
                  onChange={(v) => updateSettings({ countdown: v })}
                />
              </div>
            </div>
          </Collapsible>

          {/* Masaüstünde başlat butonu panelin içinde durur */}
          <div className="hidden lg:block">
            <Button onClick={handleStart} disabled={!canStart} className="w-full">
              Okumaya Başla
            </Button>
            <p className="mt-3 text-center text-[13px] font-medium text-ink-2">{summary}</p>
            <p className="mt-4 text-center text-[12px] leading-relaxed text-ink-3">
              Okurken <Key>Boşluk</Key> duraklatır, <Key>←</Key> <Key>→</Key> 10 kelime sarar.
            </p>
          </div>
        </aside>

        {/* Metin listesi */}
        <main className="mt-7 space-y-3 lg:mt-0 lg:min-w-0 lg:flex-1 lg:space-y-4">
          <h2 className="px-1 text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
            Metinler
          </h2>

          {libraryError ? (
            <Card className="text-[14px] leading-relaxed text-ink-2">
              <p className="mb-1.5 font-semibold text-ink">Hazır metinler yüklenemedi</p>
              <p>{libraryError}</p>
              <p className="mt-2.5">
                Metinler{' '}
                <code className="rounded-[6px] bg-surface-2 px-1.5 py-0.5 text-[13px]">
                  public/texts.json
                </code>{' '}
                dosyasından okunuyor.
              </p>
            </Card>
          ) : null}

          {/* Geniş ekranda kartlar iki sütuna yayılır */}
          <div className="space-y-3 xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0">
            {library.map((text) => (
              <TextCard
                key={text.id}
                text={text}
                active={text.id === selectedId}
                onSelect={() => setSelectedId(text.id)}
              />
            ))}
          </div>

          {/* Kendi metni — listenin sonunda, isteyenin açtığı bir seçenek. */}
          <OwnText
            open={ownOpen}
            selected={isOwn}
            draft={draft}
            textareaRef={textareaRef}
            onOpen={() => {
              setOwnOpen(true)
              setSelectedId(OWN)
            }}
            onSelect={() => setSelectedId(OWN)}
            onChange={setDraft}
            onClear={() => {
              setDraft('')
              textareaRef.current?.focus()
            }}
          />
        </main>
      </div>

      {/* Telefonda başlat butonu ekranın altına yapışır */}
      <footer className="sticky bottom-0 -mx-5 mt-8 px-5 pt-4 pb-2 lg:hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-t from-bg via-bg/95 to-transparent" />
        <div className="relative">
          <Button onClick={handleStart} disabled={!canStart} className="w-full">
            Okumaya Başla
          </Button>
          <p className="mt-3 min-h-5 text-center text-[13px] font-medium text-ink-2">{summary}</p>
        </div>
      </footer>
    </div>
  )
}

/** Klavye tuşu rozeti — yalnızca masaüstü ipuçlarında kullanılıyor. */
function Key({ children }) {
  return (
    <kbd className="rounded-[5px] bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] font-medium text-ink-2">
      {children}
    </kbd>
  )
}

function TextCard({ text, active, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-start gap-4 rounded-card p-5 text-left transition-[background-color,box-shadow,transform] duration-150 ease-out-soft active:scale-[0.99] xl:h-full ${
        active
          ? 'bg-accent-soft elev-2 ring-1 ring-[var(--accent-ring)]'
          : 'bg-surface elev-1 hover:elev-2'
      }`}
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-150 ${
          active ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-2'
        }`}
      >
        <BookOpen size={17} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-semibold tracking-[-0.012em] text-ink">
          {text.title}
        </span>
        <span className="mt-1 block text-[13px] text-ink-2">
          {[text.author, text.category].filter(Boolean).join(' · ')}
          {(text.author || text.category) && ' · '}
          {formatNumber(countWords(text.content))} kelime
        </span>
      </span>
    </button>
  )
}

/**
 * "Kendi metnim" seçeneği. Kapalıyken listenin sonunda ince bir satır;
 * açılınca yapıştırma alanına dönüşüp diğer metinler gibi seçilebilir olur.
 */
function OwnText({ open, selected, draft, textareaRef, onOpen, onSelect, onChange, onClear }) {
  if (!open) {
    return (
      <button
        onClick={onOpen}
        className="flex w-full items-center gap-4 rounded-card border border-dashed border-line px-5 py-5 text-left transition-[background-color,border-color,transform] duration-150 ease-out-soft hover:border-ink-3/50 hover:bg-surface/60 active:scale-[0.99]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-ink-2">
          <Plus size={17} strokeWidth={2} />
        </span>
        <span className="text-[15px] font-medium text-ink-2">Kendi metnimi yapıştır</span>
      </button>
    )
  }

  const words = countWords(draft)

  return (
    // Kutunun herhangi bir yerine dokunmak da bu metni seçili yapar.
    <div
      onClick={onSelect}
      className={`rounded-card p-4 transition-[background-color,box-shadow] duration-150 ease-out-soft ${
        selected ? 'bg-accent-soft elev-2 ring-1 ring-[var(--accent-ring)]' : 'bg-surface elev-1'
      }`}
    >
      <textarea
        ref={textareaRef}
        autoFocus
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onSelect}
        placeholder="Okumak istediğin metni buraya yapıştır…"
        rows={7}
        className="w-full resize-none rounded-input bg-transparent p-2 text-[15px] leading-relaxed text-ink placeholder:text-ink-3 focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3 px-2 pt-1">
        <span className="text-[13px] font-medium text-ink-2">
          {words ? `${formatNumber(words)} kelime` : 'Kendi metnim'}
        </span>
        {draft ? (
          <button
            onClick={onClear}
            className="text-[13px] font-medium text-ink-2 underline underline-offset-4 transition-colors hover:text-ink"
          >
            Temizle
          </button>
        ) : null}
      </div>
    </div>
  )
}
