/** Score at or above this is "good" posture */
export const WARN_THRESHOLD = 65

/** Score below this is "bad" posture */
export const BAD_THRESHOLD = 40

/** How often (ms) to capture a posture reading */
export const SAMPLE_INTERVAL_MS = 3000

/** Default user settings (persisted via useLocalStorage) */
export const DEFAULT_SETTINGS = {
  warnThreshold:    WARN_THRESHOLD,
  soundAlerts:      false,
  reminderInterval: 15, // minutes
}
