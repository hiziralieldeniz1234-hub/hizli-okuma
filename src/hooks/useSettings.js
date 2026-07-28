import { useCallback, useEffect, useState } from 'react'
import { loadSettings, saveSettings } from '../lib/storage'

/** Okuma ayarları — her değişiklikte localStorage'a yazılır. */
export function useSettings() {
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const update = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return [settings, update]
}
