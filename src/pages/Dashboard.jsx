import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import PostureScore from '@/components/posture/PostureScore'
import AlertBanner from '@/components/posture/AlertBanner'
import CameraView from '@/components/posture/CameraView'
import { usePosture } from '@/hooks/usePosture'
import { formatDuration } from '@/utils/formatters'

export default function Dashboard() {
  const {
    score,
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={calibrate}>
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
        <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <span className="text-indigo-500 text-xl mt-0.5">💡</span>
          <div>
            <p className="text-indigo-900 font-semibold text-sm">Calibrate first</p>
            <p className="text-indigo-700 text-sm mt-0.5">
              Sit up straight in your normal good posture, then click <strong>Calibrate</strong>.
              This sets your personal baseline — camera angle and desk height won't matter.
            </p>
          </div>
        </div>
      )}

      {alert && <AlertBanner message={alert} onDismiss={dismissAlert} />}

      {/* Main grid: camera left, stats right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Camera feed with landmark overlay */}
        <div className="lg:col-span-2">
          <CameraView onPoseResults={handlePoseResults} />
        </div>

        {/* Score + stats */}
        <div className="flex flex-col gap-4">
          <Card title="Posture Score">
            <PostureScore score={score ?? 0} />
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

          <Card title="Session Stats">
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

      {/* Landmark legend */}
      <Card title="Landmark Guide">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <LegendItem color="#f59e0b" label="Nose" />
          <LegendItem color="#6366f1" label="Ears" />
          <LegendItem color="#6366f1" label="Shoulders" />
          <LegendItem color="#6366f1" label="Hips" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-indigo-400 rounded" />
            <span>Skeleton connections</span>
          </div>
        </div>
      </Card>
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
