import { useCallback, useMemo, useState } from 'react'
import { clearSessions, computeStats, loadSessions, saveSession } from '../lib/storage'

/** Okuma geçmişi + türetilmiş istatistikler. */
export function useSessions() {
  const [sessions, setSessions] = useState(loadSessions)

  const add = useCallback((session) => {
    setSessions(saveSession(session))
  }, [])

  const clear = useCallback(() => {
    setSessions(clearSessions())
  }, [])

  const stats = useMemo(() => computeStats(sessions), [sessions])

  return { sessions, stats, add, clear }
}
