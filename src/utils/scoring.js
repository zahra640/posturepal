import { WARN_THRESHOLD, BAD_THRESHOLD } from '@/data/constants'

export function getScoreVariant(score) {
  if (score >= WARN_THRESHOLD) return 'good'
  if (score >= BAD_THRESHOLD) return 'warning'
  return 'bad'
}

export function getScoreLabel(score) {
  const map = { good: 'Great posture', warning: 'Needs improvement', bad: 'Poor posture' }
  return map[getScoreVariant(score)]
}

export function rollingAverage(scores) {
  if (!scores.length) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

/**
 * Snapshot the user's current landmark positions as their "good posture" baseline.
 * All subsequent scoring measures deviation from this snapshot, so camera angle
 * and desk height don't matter — only relative movement does.
 */
export function computeBaseline(landmarks) {
  const nose = landmarks[0]
  const leftEar = landmarks[7]
  const rightEar = landmarks[8]
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]

  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2
  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2

  return {
    // How high the nose sits above the shoulder midpoint (positive = above = good)
    headHeight: midShoulderY - nose.y,
    // Horizontal centering of nose over shoulders
    headCenter: nose.x - midShoulderX,
    // Shoulder Y-symmetry (ideally ~0)
    shoulderTilt: Math.abs(leftShoulder.y - rightShoulder.y),
    // Ear Y-symmetry (ideally ~0)
    earTilt: Math.abs(leftEar.y - rightEar.y),
  }
}

/**
 * Returns a 0–100 posture score relative to the calibrated baseline.
 * Returns null if key landmarks aren't visible (e.g. user off-camera).
 */
export function computeScore(landmarks, baseline) {
  if (!landmarks || !baseline) return null

  const nose = landmarks[0]
  const leftEar = landmarks[7]
  const rightEar = landmarks[8]
  const leftShoulder = landmarks[11]
  const rightShoulder = landmarks[12]

  const keyPoints = [nose, leftEar, rightEar, leftShoulder, rightShoulder]
  if (keyPoints.some((lm) => !lm || lm.visibility < 0.4)) return null

  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2
  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2

  // HEAD DROP — most important. Positive deviation = head has dropped from baseline.
  const headHeight = midShoulderY - nose.y
  const headDrop = Math.max(0, baseline.headHeight - headHeight)

  // LATERAL LEAN — nose drifted left/right relative to shoulders
  const headCenter = nose.x - midShoulderX
  const lateralLean = Math.abs(headCenter - baseline.headCenter)

  // SHOULDER TILT — one shoulder higher than the other
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y)
  const shoulderTiltDev = Math.max(0, shoulderTilt - baseline.shoulderTilt)

  // EAR/HEAD TILT — head tilted side to side
  const earTilt = Math.abs(leftEar.y - rightEar.y)
  const earTiltDev = Math.max(0, earTilt - baseline.earTilt)

  // Convert deviations to 0–1 scores. Thresholds tuned for normalized coords:
  //   0.08 ≈ 8% of frame height — noticeable but not extreme head drop
  //   0.05 ≈ 5% lateral shift
  //   0.04 ≈ 4% shoulder/ear asymmetry
  const headDropScore    = Math.max(0, 1 - headDrop / 0.08)
  const lateralScore     = Math.max(0, 1 - lateralLean / 0.05)
  const shoulderScore    = Math.max(0, 1 - shoulderTiltDev / 0.04)
  const earTiltScore     = Math.max(0, 1 - earTiltDev / 0.04)

  const weighted =
    headDropScore * 0.45 +
    lateralScore  * 0.15 +
    shoulderScore * 0.20 +
    earTiltScore  * 0.20

  return Math.round(Math.max(0, Math.min(100, weighted * 100)))
}
