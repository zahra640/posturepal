import { useState, useRef, useCallback, useEffect } from 'react'
import { computeBaseline, computeScore } from '@/utils/scoring'
import { saveSession } from '@/services/storageService'
import { WARN_THRESHOLD } from '@/data/constants'

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

  const dismissAlert = useCallback(() => setAlert(null), [])

  // Keep refs in sync so pose callbacks always have the latest values
  useEffect(() => { baselineRef.current = baseline }, [baseline])
  useEffect(() => { isTrackingRef.current = isTracking }, [isTracking])

  /** Called every frame by CameraView with raw MediaPipe landmarks (or null). */
  const handlePoseResults = useCallback((rawLandmarks) => {
    setLandmarks(rawLandmarks)
    if (!rawLandmarks || !baselineRef.current || !isTrackingRef.current) return

    const s = computeScore(rawLandmarks, baselineRef.current)
    if (s === null) return // key points not visible

    setScore(s)
    scores.current.push(s)

    if (s < WARN_THRESHOLD) {
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
