const COLOR = {
  good:    'text-posture-good',
  warning: 'text-posture-warning',
  bad:     'text-posture-bad',
}
const LABEL = {
  good:    'Great posture',
  warning: 'Needs improvement',
  bad:     'Poor posture',
}

function getVariant(score, warnThreshold) {
  if (score >= warnThreshold) return 'good'
  if (score >= Math.round(warnThreshold * 0.6)) return 'warning'
  return 'bad'
}

export default function PostureScore({ score = 0, warnThreshold = 65 }) {
  const variant = getVariant(score, warnThreshold)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`text-7xl font-bold tabular-nums ${COLOR[variant]}`}>
        {score}
      </div>
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
        {LABEL[variant]}
      </p>
    </div>
  )
}
