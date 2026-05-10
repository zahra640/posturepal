import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PostureScore from '@/components/posture/PostureScore'
import AlertBanner from '@/components/posture/AlertBanner'
import CameraView from '@/components/posture/CameraView'
import { usePosture } from '@/hooks/usePosture'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { DEFAULT_SETTINGS } from '@/data/constants'
import { formatDuration } from '@/utils/formatters'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import detectorImage from '../../images/detector.png'

export default function Dashboard() {
  const {
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
  } = usePosture()

  const [settings] = useLocalStorage('posturepal_settings', DEFAULT_SETTINGS)
  const location = useLocation()

  useEffect(() => {
    // Robust scroll helper: retry until element exists (up to attempts)
    const navbar = document.querySelector('.app-navbar')
    const navHeight = navbar ? navbar.offsetHeight : 96

    let attempts = 0
    const maxAttempts = 12
    const retryMs = 80

    function tryScroll() {
      const el = document.getElementById('detector')
      if (el) {
        const targetScroll = el.offsetTop - navHeight - 30
        window.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' })
        return true
      }
      return false
    }

    const id = setInterval(() => {
      attempts += 1
      if (tryScroll() || attempts >= maxAttempts) {
        clearInterval(id)
      }
    }, retryMs)

    // also try once shortly after mount
    setTimeout(tryScroll, 120)

    return () => clearInterval(id)
  }, [/* run on mount */])

  return (
    <div id="detector" className="flex flex-col gap-6 items-center w-full min-h-[calc(100vh-6rem)] pt-8 sm:pt-12 px-4">
      {/* Header with detector image */}
      <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
        <img
          src={detectorImage}
          alt="Detector"
          className="h-16 sm:h-20 w-auto object-contain"
        />
        <div className="flex items-center gap-2 justify-center flex-wrap">
          {!landmarks && (
            <span className="text-xs text-amber-500">Waiting for pose detection…</span>
          )}
          <Button variant="secondary" onClick={calibrate} disabled={!landmarks}>
            {isCalibrated ? 'Recalibrate' : 'Calibrate'}
          </Button>
          {isCalibrated && (
            <Button
              variant={isTracking ? 'danger' : 'primary'}
              onClick={isTracking ? stopTracking : startTracking}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Button>
          )}
        </div>
      </div>

      {/* Calibration prompt */}
      {!isCalibrated && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 w-full max-w-2xl mx-auto">
          <span className="text-amber-500 text-xl mt-0.5">💡</span>
          <div>
            <p className="text-amber-900 font-semibold text-sm">Calibrate first</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Sit up straight in your normal good posture, then click <strong>Calibrate</strong>.
              This sets your personal baseline — camera angle and desk height won't matter.
            </p>
          </div>
        </div>
      )}

      {alert && <AlertBanner message={alert} onDismiss={dismissAlert} />}

      {/* Main grid: camera left, stats right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-4xl mx-auto items-stretch">
        {/* Camera feed with landmark overlay */}
        <div className="lg:col-span-2 h-full">
          <CameraView onPoseResults={handlePoseResults} />
        </div>

        {/* Score + stats */}
        <div className="flex flex-col gap-6 h-full">
          <Card title="Posture Score" className="h-full flex flex-col justify-between">
            <PostureScore score={score ?? 0} warnThreshold={settings.warnThreshold} />
            {!isCalibrated && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Calibrate to start scoring
              </p>
            )}
            {isCalibrated && score === null && (
              <p className="text-xs text-amber-500 text-center mt-2">
                Move into frame to detect posture
              </p>
            )}
          </Card>

          <Card title="Session Stats" className="h-full flex flex-col justify-between">
            <dl className="grid grid-cols-2 gap-4">
              <Stat label="Session Time" value={formatDuration(sessionDuration)} />
              <Stat
                label="Status"
                value={
                  isTracking ? 'Active' : isCalibrated ? 'Ready' : 'Not calibrated'
                }
              />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-xl font-semibold text-gray-800 mt-0.5">{value}</dd>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full border-2 border-white shadow" style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}
