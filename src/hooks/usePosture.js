import { useState, useRef, useCallback, useEffect } from 'react'
import { computeBaseline, computeScore } from '@/utils/scoring'
import { saveSession } from '@/services/storageService'
import { DEFAULT_SETTINGS } from '@/data/constants'
import { useLocalStorage } from '@/hooks/useLocalStorage'

function playBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
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
  } catch { /* ignore audio errors */ }
}

export function usePosture() {
  const [settings] = useLocalStorage('posturepal_settings', DEFAULT_SETTINGS)

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
  const baselineRef   = useRef(null)
  const isTrackingRef = useRef(false)
  const settingsRef   = useRef(settings)
  // true while score is below the warn threshold this episode
  const isBadRef      = useRef(false)
  // true if user dismissed the alert during the current bad episode
  const dismissedRef  = useRef(false)

  useEffect(() => { settingsRef.current = settings }, [settings])
  useEffect(() => { baselineRef.current = baseline }, [baseline])
  useEffect(() => { isTrackingRef.current = isTracking }, [isTracking])

  // dismissing suppresses the banner until posture recovers then drops again
  const dismissAlert = useCallback(() => {
    setAlert(null)
    dismissedRef.current = true
  }, [])

  /** Called every frame by CameraView with raw MediaPipe landmarks (or null). */
  const handlePoseResults = useCallback((rawLandmarks) => {
    setLandmarks(rawLandmarks)
    if (!rawLandmarks || !baselineRef.current || !isTrackingRef.current) return

    const s = computeScore(rawLandmarks, baselineRef.current)
    if (s === null) return

    setScore(s)
    scores.current.push(s)

    const threshold = settingsRef.current.warnThreshold
    const isBad = s < threshold

    if (isBad && !isBadRef.current) {
      // just crossed into bad posture — show alert, play sound, send notification
      isBadRef.current = true
      dismissedRef.current = false
      setAlert('Heads up — your posture needs attention!')
      if (settingsRef.current.soundAlerts) playBeep()
      if (settingsRef.current.pushNotifications && Notification.permission === 'granted') {
        new Notification('PosturePal', {
          body: 'Your posture needs attention!',
          icon: '/posture-icon.svg',
        })
      }
    } else if (!isBad && isBadRef.current) {
      // posture recovered — clear alert and reset so it can fire again later
      isBadRef.current = false
      dismissedRef.current = false
      setAlert(null)
    } else if (isBad && !dismissedRef.current) {
      // still bad and not dismissed — keep alert visible
      setAlert('Heads up — your posture needs attention!')
    }
  }, [])

  /** Snapshot current landmarks as the "good posture" baseline. */
  const calibrate = useCallback(() => {
    if (!landmarks) return false
    const bl = computeBaseline(landmarks)
    setBaseline(bl)
    setIsCalibrated(true)
    setScore(100)
    setAlert(null)
    isBadRef.current = false
    dismissedRef.current = false
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
