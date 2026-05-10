import { useState, useRef, useCallback, useEffect } from 'react'
import { computeBaseline, computeScore } from '@/utils/scoring'
import { saveSession } from '@/services/storageService'
import { WARN_THRESHOLD, BAD_THRESHOLD, DEFAULT_SETTINGS } from '@/data/constants'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export function usePosture() {
  const [landmarks, setLandmarks]       = useState(null)
  const [baseline, setBaseline]         = useState(null)
  const [isCalibrated, setIsCalibrated] = useState(false)
  const [score, setScore]               = useState(null)
  const [isTracking, setIsTracking]     = useState(false)
  const [sessionDuration, setDuration]  = useState(0)
  const [alert, setAlert]               = useState(null)

  const timerRef      = useRef(null)
  const sessionStart  = useRef(null)
  const scores        = useRef([])
  const baselineRef   = useRef(null)   // mirror for use inside callbacks
  const isTrackingRef = useRef(false)

  const alertRef      = useRef(null)
  const audioCtxRef   = useRef(null)
  const [settings]    = useLocalStorage('posturepal_settings', DEFAULT_SETTINGS)
  const badRef        = useRef(false)

  const dismissAlert = useCallback(() => setAlert(null), [])

  // Keep refs in sync so pose callbacks always have the latest values
  useEffect(() => { baselineRef.current = baseline }, [baseline])
  useEffect(() => { isTrackingRef.current = isTracking }, [isTracking])
  useEffect(() => { alertRef.current = alert }, [alert])

  function playBeep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      o.connect(g)
      g.connect(ctx.destination)
      const now = ctx.currentTime
      g.gain.setValueAtTime(0.001, now)
      g.gain.exponentialRampToValueAtTime(0.25, now + 0.01)
      o.start(now)
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
      o.stop(now + 0.3)
    } catch (e) {
      // ignore audio errors
    }
  }

  /** Called every frame by CameraView with raw MediaPipe landmarks (or null). */
  const handlePoseResults = useCallback((rawLandmarks) => {
    setLandmarks(rawLandmarks)
    if (!rawLandmarks || !baselineRef.current || !isTrackingRef.current) return

    const s = computeScore(rawLandmarks, baselineRef.current)
    if (s === null) return // key points not visible

    setScore(s)
    scores.current.push(s)

    // Visual warning for warn threshold
    if (s < WARN_THRESHOLD) {
      if (!alertRef.current) {
        setAlert('Heads up — your posture needs attention!')
      }
    }

    // Play sound only when entering a BAD state
    if (s < BAD_THRESHOLD) {
      if (!badRef.current) {
        badRef.current = true
        if (settings?.soundAlerts) playBeep()
      }
    } else {
      badRef.current = false
    }
  }, [settings])

  /** Snapshot current landmarks as the "good posture" baseline. */
  const calibrate = useCallback(() => {
    if (!landmarks) return false
    const bl = computeBaseline(landmarks)
    setBaseline(bl)
    setIsCalibrated(true)
    setScore(100)
    setAlert(null)
    return true
  }, [landmarks])

  const startTracking = useCallback(() => {
    if (!isCalibrated) return
    scores.current = []
    sessionStart.current = Date.now()
    setDuration(0)
    setIsTracking(true)
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
  }, [isCalibrated])

  const stopTracking = useCallback(() => {
    clearInterval(timerRef.current)
    setIsTracking(false)
    const avgScore = scores.current.length
      ? Math.round(scores.current.reduce((a, b) => a + b, 0) / scores.current.length)
      : 0
    saveSession({
      id: crypto.randomUUID(),
      startedAt: sessionStart.current,
      endedAt: Date.now(),
      avgScore,
    }).catch(console.error)
  }, [])

  useEffect(() => () => clearInterval(timerRef.current), [])

  return {
    score,
    landmarks,
    isTracking,
    isCalibrated,
    sessionDuration,
    alert,
    dismissAlert,
    handlePoseResults,
    calibrate,
    startTracking,
    stopTracking,
  }
}
