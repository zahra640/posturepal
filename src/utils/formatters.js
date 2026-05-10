/**
 * Format a duration in seconds as mm:ss.
 * @param {number} seconds
 * @returns {string}  e.g. "04:32"
 */
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/**
 * Format a timestamp as a short date/time string.
 * @param {number} timestamp  Unix ms
 * @returns {string}  e.g. "May 9, 2:34 PM"
 */
export function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day:   'numeric',
    hour:  'numeric',
    minute:'2-digit',
  })
}
