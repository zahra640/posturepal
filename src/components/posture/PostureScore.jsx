import { getScoreVariant, getScoreLabel } from '@/utils/scoring'

/**
 * Circular score display (0–100).
 * Colour-codes itself based on the posture quality thresholds.
 */
export default function PostureScore({ score = 0 }) {
  const variant = getScoreVariant(score)
  const label   = getScoreLabel(score)

  const colorMap = {
    good:    'text-posture-good',
    warning: 'text-posture-warning',
    bad:     'text-posture-bad',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`text-7xl font-bold tabular-nums ${colorMap[variant]}`}>
        {score}
      </div>
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </p>
    </div>
  )
}
