import { useCallback, useEffect, useState } from 'react'
import { HomeScreen } from './screens/HomeScreen'
import { ReaderScreen } from './screens/ReaderScreen'
import { StatsScreen } from './screens/StatsScreen'
import { useTheme } from './hooks/useTheme'
import { useSettings } from './hooks/useSettings'
import { useSessions } from './hooks/useSessions'

/**
 * Hazır metinler public/texts.json'dan çalışma anında okunur, koda gömülü
 * değil. Metin eklemek için yalnızca o dosya düzenlenir.
 */
function useLibrary() {
  const [library, setLibrary] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch(`${import.meta.env.BASE_URL}texts.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`texts.json okunamadı (HTTP ${res.status})`)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return

        const raw = Array.isArray(data) ? data : Array.isArray(data?.texts) ? data.texts : null
        if (!raw) throw new Error('Beklenen biçim: { "texts": [ ... ] }')

        setLibrary(
          raw
            .filter((t) => t && typeof t.content === 'string' && t.content.trim())
            .map((t, i) => ({
              id: String(t.id ?? `metin-${i + 1}`),
              title: String(t.title ?? `Metin ${i + 1}`),
              author: t.author ? String(t.author) : '',
              category: t.category ? String(t.category) : '',
              content: t.content,
            })),
        )
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { library, error }
}

export default function App() {
  /** 'home' | 'reader' | 'stats' */
  const [view, setView] = useState('home')
  const [source, setSource] = useState(null)

  const { theme, toggleTheme } = useTheme()
  const [settings, updateSettings] = useSettings()
  const { sessions, stats, add, clear } = useSessions()
  const { library, error: libraryError } = useLibrary()

  const startReading = useCallback((next) => {
    setSource(next)
    setView('reader')
  }, [])

  const goHome = useCallback(() => {
    setView('home')
    setSource(null)
  }, [])

  if (view === 'reader' && source) {
    return (
      <ReaderScreen
        /* Kaynak değişince motor tamamen sıfırlansın */
        key={source.content.length + '|' + source.title}
        source={source}
        settings={settings}
        updateSettings={updateSettings}
        onExit={goHome}
        onComplete={add}
        /* Bitiş ekranından istatistiklere geçince okuma oturumu kapanır;
           geri tuşu kullanıcıyı yarım kalmış bir okumaya değil ana sayfaya döndürür. */
        onStats={() => {
          setSource(null)
          setView('stats')
        }}
      />
    )
  }

  if (view === 'stats') {
    return (
      <div className="screen-enter">
        <StatsScreen sessions={sessions} stats={stats} onClear={clear} onBack={goHome} />
      </div>
    )
  }

  return (
    <div className="screen-enter">
      <HomeScreen
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenStats={() => setView('stats')}
        onStart={startReading}
        settings={settings}
        updateSettings={updateSettings}
        library={library}
        libraryError={libraryError}
      />
    </div>
  )
}
