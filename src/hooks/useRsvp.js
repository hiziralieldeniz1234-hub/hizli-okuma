import { useCallback, useEffect, useRef, useState } from 'react'
import { frameDelay } from '../lib/tokenize'

/**
 * RSVP oynatma motoru.
 *
 * Zamanlama zincirleme setTimeout ile yürür; her kare kendi süresini
 * hesaplayıp bir sonrakini planlar. Böylece hız (wpm) okuma sırasında
 * değiştiğinde zincir yeniden kurulmadan bir sonraki karede etkili olur.
 *
 * Süre ölçümü duraklamaları saymaz: yalnızca "running" durumunda geçen
 * zaman biriktirilir, istatistikler bu yüzden gerçekçi çıkar.
 *
 * @param {Array} frames  buildFrames() çıktısı
 * @param {{wpm:number, naturalRhythm:boolean, countdown:boolean}} options
 */
export function useRsvp(frames, options) {
  const [index, setIndex] = useState(0)
  /** idle | countdown | running | paused | done */
  const [status, setStatus] = useState('idle')
  const [countdownValue, setCountdownValue] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)

  const frameTimer = useRef(null)
  const countdownTimer = useRef(null)
  const indexRef = useRef(0)
  const framesRef = useRef(frames)
  const optionsRef = useRef(options)
  const statusRef = useRef(status)
  /** Duraklamalar hariç biriken okuma süresi */
  const accumulatedRef = useRef(0)
  /** Ekranda duran karenin başlangıç anı (performance.now) */
  const frameStartRef = useRef(null)
  /** O karenin planlanan süresi — askıya alınmayı yakalamak için */
  const frameExpectedRef = useRef(0)

  framesRef.current = frames
  optionsRef.current = options
  statusRef.current = status

  /* --------------------------- yardımcılar --------------------------- */

  const clearTimers = useCallback(() => {
    if (frameTimer.current) {
      clearTimeout(frameTimer.current)
      frameTimer.current = null
    }
    if (countdownTimer.current) {
      clearTimeout(countdownTimer.current)
      countdownTimer.current = null
    }
  }, [])

  /**
   * Bir karede gerçekten geçen süre.
   *
   * Duvar saatini olduğu gibi almıyoruz: tarayıcı sekmeyi arka plana attığında
   * ya da Android uygulamayı dondurduğunda zamanlayıcı susar, saat işlemeye
   * devam eder. Böyle bir durumda 200 ms'lik bir kare 30 saniye "sürmüş" gibi
   * görünür ve istatistikleri bozar. Bu yüzden kareye planlanan sürenin
   * belirgin biçimde üstüne çıkan farkları saymıyoruz.
   */
  const frameElapsed = useCallback(() => {
    if (frameStartRef.current == null) return 0
    const real = performance.now() - frameStartRef.current
    const cap = frameExpectedRef.current * 3 + 250
    return Math.min(real, cap)
  }, [])

  /** Ekrandaki karenin süresini biriktirip sayacı kapat. */
  const settleElapsed = useCallback(() => {
    accumulatedRef.current += frameElapsed()
    frameStartRef.current = null
    setElapsedMs(accumulatedRef.current)
    return accumulatedRef.current
  }, [frameElapsed])

  const scheduleNext = useCallback(() => {
    if (frameTimer.current) clearTimeout(frameTimer.current)

    const list = framesRef.current
    const i = indexRef.current
    if (i >= list.length) return

    const { wpm, naturalRhythm } = optionsRef.current
    const delay = frameDelay(list[i], wpm, naturalRhythm)

    frameStartRef.current = performance.now()
    frameExpectedRef.current = delay

    frameTimer.current = setTimeout(() => {
      // Biten karenin süresini hesaba kat.
      accumulatedRef.current += frameElapsed()
      frameStartRef.current = null

      const next = indexRef.current + 1

      if (next >= framesRef.current.length) {
        // Son kare de gösterildi — okuma bitti.
        clearTimers()
        setElapsedMs(accumulatedRef.current)
        indexRef.current = framesRef.current.length
        setIndex(framesRef.current.length)
        setStatus('done')
        return
      }

      indexRef.current = next
      setIndex(next)
      scheduleNext()
    }, delay)
  }, [clearTimers, frameElapsed])

  const beginRunning = useCallback(() => {
    setStatus('running')
    scheduleNext()
  }, [scheduleNext])

  /* ------------------------------ eylemler ---------------------------- */

  const play = useCallback(() => {
    if (!framesRef.current.length) return
    if (indexRef.current >= framesRef.current.length) return

    clearTimers()

    if (!optionsRef.current.countdown) {
      beginRunning()
      return
    }

    let remaining = 3
    setCountdownValue(remaining)
    setStatus('countdown')

    const step = () => {
      remaining -= 1
      if (remaining <= 0) {
        setCountdownValue(0)
        beginRunning()
        return
      }
      setCountdownValue(remaining)
      countdownTimer.current = setTimeout(step, 600)
    }

    countdownTimer.current = setTimeout(step, 600)
  }, [beginRunning, clearTimers])

  const pause = useCallback(() => {
    clearTimers()
    setCountdownValue(0)
    settleElapsed()
    setStatus((prev) => (prev === 'done' ? prev : 'paused'))
  }, [clearTimers, settleElapsed])

  /** Okumayı erken bitirir (Durdur). İstatistikler kaydedilebilir hâle gelir. */
  const finish = useCallback(() => {
    clearTimers()
    setCountdownValue(0)
    settleElapsed()
    setStatus('done')
  }, [clearTimers, settleElapsed])

  /** delta kadar kare ileri/geri. Okuma sürüyorsa zincir yeniden kurulur. */
  const seek = useCallback(
    (delta) => {
      const list = framesRef.current
      if (!list.length) return

      const target = Math.max(0, Math.min(list.length - 1, indexRef.current + delta))
      indexRef.current = target
      setIndex(target)

      // Bitmiş okumada geri sarınca duraklatılmış hâle dön.
      if (statusRef.current === 'done') {
        settleElapsed()
        setStatus('paused')
      }

      if (frameTimer.current) scheduleNext()
    },
    [scheduleNext, settleElapsed],
  )

  /** Baştan başlat — sayaçlar dahil her şey sıfırlanır. */
  const restart = useCallback(() => {
    clearTimers()
    indexRef.current = 0
    accumulatedRef.current = 0
    frameStartRef.current = null
    frameExpectedRef.current = 0
    setIndex(0)
    setElapsedMs(0)
    setCountdownValue(0)
    setStatus('idle')
  }, [clearTimers])

  const toggle = useCallback(() => {
    if (status === 'running' || status === 'countdown') pause()
    else if (status !== 'done') play()
  }, [status, pause, play])

  /* ------------------------------ efektler ---------------------------- */

  // Sekme/uygulama arka plana alınırsa duraklat (telefonda zamanlayıcı kısılır).
  useEffect(() => {
    const onHidden = () => {
      if (document.hidden) pause()
    }
    document.addEventListener('visibilitychange', onHidden)
    return () => document.removeEventListener('visibilitychange', onHidden)
  }, [pause])

  // Okuma sürerken ekran kapanmasın (destekleyen tarayıcılarda).
  useEffect(() => {
    if (status !== 'running' || !('wakeLock' in navigator)) return

    let sentinel = null
    let released = false

    navigator.wakeLock
      .request('screen')
      .then((lock) => {
        if (released) lock.release().catch(() => {})
        else sentinel = lock
      })
      .catch(() => {})

    return () => {
      released = true
      if (sentinel) sentinel.release().catch(() => {})
    }
  }, [status])

  useEffect(() => clearTimers, [clearTimers])

  /* ------------------------------- türevler --------------------------- */

  const total = frames.length
  const currentFrame = index < total ? frames[index] : frames[total - 1]
  const wordsRead = currentFrame ? currentFrame.upto : 0
  const progress = total ? Math.min(1, (index >= total ? total : index + 1) / total) : 0

  /** Okuma sürerken de doğru toplam süreyi verir. */
  const getElapsedMs = useCallback(
    () => accumulatedRef.current + frameElapsed(),
    [frameElapsed],
  )

  return {
    index,
    status,
    countdownValue,
    elapsedMs,
    getElapsedMs,
    wordsRead,
    progress,
    total,
    frame: index < total ? frames[index] : null,
    isRunning: status === 'running',
    play,
    pause,
    toggle,
    seek,
    finish,
    restart,
  }
}
