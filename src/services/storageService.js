import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'

const LOCAL_KEY = 'posturepal_sessions'

// Simple in-memory subscription for localStorage-backed sessions (same-window)
const _listeners = new Set()
function notifyListeners(sessions) {
  _listeners.forEach((cb) => {
    try { cb(sessions) } catch (e) { /* ignore listener errors */ }
  })
}

export async function getSessions() {
  const user = auth.currentUser
  if (!user) {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') }
    catch { return [] }
  }
  const snap = await getDocs(
    query(collection(db, 'users', user.uid, 'sessions'), orderBy('startedAt', 'asc'))
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function saveSession(session) {
  const user = auth.currentUser
  if (!user) {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]')
    all.push(session)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all))
    notifyListeners(all.slice())
    return
  }

  await addDoc(collection(db, 'users', user.uid, 'sessions'), session)

  // Keep the user's public avgScore in sync for the leaderboard
  const userRef  = doc(db, 'users', user.uid)
  const snap     = await getDoc(userRef)
  const data     = snap.data() ?? {}
  const newCount = (data.sessionCount ?? 0) + 1
  const newAvg   = Math.round(((data.avgScore ?? 0) * (newCount - 1) + session.avgScore) / newCount)
  await updateDoc(userRef, { avgScore: newAvg, sessionCount: newCount })
  // Firestore listeners in the UI will pick this up; notify anyway for completeness
  notifyListeners()
}

export async function clearSessions() {
  const user = auth.currentUser
  if (!user) {
    localStorage.removeItem(LOCAL_KEY)
    notifyListeners([])
    return
  }
  const snap = await getDocs(collection(db, 'users', user.uid, 'sessions'))
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  await updateDoc(doc(db, 'users', user.uid), { avgScore: 0, sessionCount: 0 })
}

export function subscribeSessions(cb) {
  _listeners.add(cb)
  return () => _listeners.delete(cb)
}
