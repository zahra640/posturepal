import { useEffect, useRef } from 'react'
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
  // keep latest callback without restarting the whole pipeline
  const callbackRef = useRef(onPoseResults)
  useEffect(() => { callbackRef.current = onPoseResults }, [onPoseResults])

  useEffect(() => {
    let active = true
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    async function start() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      video.srcObject = stream
      await video.play()

      await initPose((results) => {
        if (!active) return
        if (results.poseLandmarks) {
          drawOverlay(ctx, results.poseLandmarks, canvas.width, canvas.height)
          callbackRef.current?.(results.poseLandmarks)
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          callbackRef.current?.(null)
        }
      })

      async function loop() {
        if (!active) return
        await sendFrame(video)
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    start().catch((err) => console.error('[CameraView]', err))

    return () => {
      active = false
      cancelAnimationFrame(rafRef.current)
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
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1 animate-pulse" />
        Live
      </div>
    </div>
  )
}
