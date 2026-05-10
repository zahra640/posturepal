const styles = {
  good:    'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  bad:     'bg-red-100 text-red-700',
  neutral: 'bg-gray-100 text-gray-600',
}

export default function Badge({ label, variant = 'neutral' }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant]}`}>
      {label}
    </span>
  )
}
