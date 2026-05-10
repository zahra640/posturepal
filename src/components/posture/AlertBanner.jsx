/**
 * Shown when posture drops below the warning threshold.
 * Pass onDismiss to allow the user to hide it temporarily.
 */
export default function AlertBanner({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
      <span className="font-medium">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 text-amber-500 hover:text-amber-700 transition-colors font-bold"
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  )
}
