import { useEffect, useRef, useState } from 'react'
import { initPose, sendFrame, stopPose } from '@/services/postureService'

// Landmark indices we care about
const TRACKED = [0, 7, 8, 11, 12, 23, 24] // nose, ears, shoulders, hips

const CONNECTIONS = [
  [7, 8],   // ear–ear
  [7, 11],  // left ear–shoulder
  [8, 12],  // right ear–shoulder
  [11, 12], // shoulder–shoulder
  [11, 23], // left shoulder–hip
  [12, 24], // right shoulder–hip
  [23, 24], // hip–hip
]

function drawOverlay(ctx, landmarks, w, h) {
  ctx.clearRect(0, 0, w, h)

  // Lines
  ctx.strokeStyle = 'rgba(99,102,241,0.85)'
  ctx.lineWidth = 2.5
  CONNECTIONS.forEach(([a, b]) => {
    const lmA = landmarks[a]
    const lmB = landmarks[b]
    if (lmA?.visibility > 0.4 && lmB?.visibility > 0.4) {
      ctx.beginPath()
      // flip x to match mirrored video
      ctx.moveTo((1 - lmA.x) * w, lmA.y * h)
      ctx.lineTo((1 - lmB.x) * w, lmB.y * h)
      ctx.stroke()
    }
  })

  // Dots
  TRACKED.forEach((i) => {
    const lm = landmarks[i]
    if (lm?.visibility > 0.4) {
      ctx.beginPath()
      ctx.arc((1 - lm.x) * w, lm.y * h, i === 0 ? 6 : 5, 0, Math.PI * 2)
      ctx.fillStyle = i === 0 ? '#f59e0b' : '#6366f1' // nose = amber, rest = indigo
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  })
}

export default function CameraView({ onPoseResults }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const callbackRef = useRef(onPoseResults)
  useEffect(() => { callbackRef.current = onPoseResults }, [onPoseResults])

  const [camStatus, setCamStatus]     = useState('loading')  // 'loading' | 'ready' | 'error'
  const [poseDetected, setPoseDetected] = useState(false)
  const [errorMsg, setErrorMsg]       = useState('')

  useEffect(() => {
    let active = true
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let visHandler = null

    async function start() {
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        })
      } catch {
        if (active) { setCamStatus('error'); setErrorMsg('Camera access denied. Allow camera permission and refresh.') }
        return
      }
      streamRef.current = stream
      video.srcObject = stream
      await video.play()

      try {
        await initPose((results) => {
          if (!active) return
          setCamStatus('ready')
          if (results.poseLandmarks) {
            setPoseDetected(true)
            drawOverlay(ctx, results.poseLandmarks, canvas.width, canvas.height)
            callbackRef.current?.(results.poseLandmarks)
          } else {
            setPoseDetected(false)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            callbackRef.current?.(null)
          }
        })
      } catch {
        if (active) { setCamStatus('error'); setErrorMsg('Could not load pose detection. Check your internet connection and refresh.') }
        return
      }

      function scheduleLoop() {
        rafRef.current = document.hidden
          ? setTimeout(loop, 500)
          : requestAnimationFrame(loop)
      }

      async function loop() {
        if (!active) return
        await sendFrame(video)
        scheduleLoop()
      }

      // rAF freezes when the tab is hidden and never calls loop again.
      // visibilitychange rescues it: cancel the stalled rAF and start a
      // setTimeout instead, then switch back to rAF when the tab returns.
      visHandler = () => {
        if (!active) return
        cancelAnimationFrame(rafRef.current)
        clearTimeout(rafRef.current)
        scheduleLoop()
      }
      document.addEventListener('visibilitychange', visHandler)
      scheduleLoop()
    }

    start()

    return () => {
      active = false
      cancelAnimationFrame(rafRef.current)
      clearTimeout(rafRef.current)
      if (visHandler) document.removeEventListener('visibilitychange', visHandler)
      stopPose()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width={640}
        height={480}
      />

      {/* Loading overlay */}
      {camStatus === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900/80">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 text-xs">Loading pose detection…</p>
        </div>
      )}

      {/* Error overlay */}
      {camStatus === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900/90 px-6 text-center">
          <p className="text-red-400 text-sm font-medium">⚠ {errorMsg}</p>
        </div>
      )}

      {/* Status badge */}
      {camStatus === 'ready' && (
        <div className={`absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded flex items-center gap-1.5 ${
          poseDetected ? 'bg-green-600/80' : 'bg-amber-500/80'
        }`}>
          <span className={`inline-block w-2 h-2 rounded-full ${poseDetected ? 'bg-green-300 animate-pulse' : 'bg-amber-200'}`} />
          {poseDetected ? 'Pose detected' : 'No pose detected — move into frame'}
        </div>
      )}
    </div>
  )
}
