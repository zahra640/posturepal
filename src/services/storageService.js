/**
 * storageService.js
 *
 * Thin wrapper around localStorage for typed session/history persistence.
 * Swap for IndexedDB or a backend API later without touching the hooks.
 */

const SESSIONS_KEY = 'posturepal_sessions'

/** @typedef {{ id: string, startedAt: number, endedAt: number, avgScore: number }} Session */

/**
 * Load all saved sessions.
 * @returns {Session[]}
 */
export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? '[]')
  } catch {
    return []
  }
}

/**
 * Persist a completed session.
 * @param {Session} session
 */
export function saveSession(session) {
  const sessions = getSessions()
  sessions.push(session)
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

/**
 * Wipe all stored sessions.
 */
export function clearSessions() {
  localStorage.removeItem(SESSIONS_KEY)
}
