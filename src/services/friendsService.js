import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'

/**
 * Send a friend request from the current user to targetUid.
 * If there's already an incoming request from that person, auto-accept instead
 * of creating a deadlock where both users are stuck on "pending_sent".
 */
export async function sendFriendRequest(targetUid, targetDisplayName) {
  const { uid, displayName, email } = auth.currentUser

  const existing = await getDoc(doc(db, 'users', uid, 'friends', targetUid))
  if (existing.exists() && existing.data().status === 'pending_received') {
    await acceptFriend(targetUid)
    return
  }

  await setDoc(doc(db, 'users', uid, 'friends', targetUid), {
    displayName: targetDisplayName,
    status: 'pending_sent',
  })
  await setDoc(doc(db, 'users', targetUid, 'friends', uid), {
    displayName: displayName ?? email,
    status: 'pending_received',
  })
}

/** Accept an incoming friend request from fromUid. */
export async function acceptFriend(fromUid) {
  const uid = auth.currentUser.uid
  await updateDoc(doc(db, 'users', uid, 'friends', fromUid), { status: 'accepted' })
  await updateDoc(doc(db, 'users', fromUid, 'friends', uid), { status: 'accepted' })
}

/** Decline, cancel, or remove a friend — deletes both sides. */
export async function declineFriend(targetUid) {
  const uid = auth.currentUser.uid
  await deleteDoc(doc(db, 'users', uid, 'friends', targetUid))
  await deleteDoc(doc(db, 'users', targetUid, 'friends', uid))
}

export { declineFriend as removeFriend }

/**
 * Returns a map of { [uid]: status } for all of the current user's friend docs.
 * Used to know whether an Add Friend button should say "Add", "Sent", or "Friends".
 */
export async function getFriendStatuses() {
  const uid = auth.currentUser.uid
  const snap = await getDocs(collection(db, 'users', uid, 'friends'))
  const statuses = {}
  snap.docs.forEach((d) => { statuses[d.id] = d.data().status })
  return statuses
}

/**
 * Returns accepted friends with their latest scores fetched from their user docs.
 */
export async function getAcceptedFriends() {
  const uid = auth.currentUser.uid
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'friends'), where('status', '==', 'accepted'))
  )
  if (!snap.docs.length) return []
  const docs = await Promise.all(snap.docs.map((d) => getDoc(doc(db, 'users', d.id))))
  return docs.filter((d) => d.exists()).map((d) => ({ uid: d.id, ...d.data() }))
}

/** Returns incoming pending friend requests. */
export async function getPendingRequests() {
  const uid = auth.currentUser.uid
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'friends'), where('status', '==', 'pending_received'))
  )
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
}
