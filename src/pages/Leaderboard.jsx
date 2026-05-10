import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, query, orderBy, getDoc, doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuth } from '@/context/AuthContext'
import { sendFriendRequest, acceptFriend, declineFriend, removeFriend } from '@/services/friendsService'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { getScoreVariant, getScoreLabel } from '@/utils/scoring'
import leaderboardImage from '../../images/leaderboard.png'

const medals = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { currentUser } = useAuth()

  const [tab, setTab]                     = useState('friends')
  const [globalUsers, setGlobalUsers]     = useState([])
  const [friends, setFriends]             = useState([])
  const [pending, setPending]             = useState([])
  const [statuses, setStatuses]           = useState({})
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [search, setSearch]               = useState('')
  const [error, setError]                 = useState(null)

  useEffect(() => {
    if (!currentUser) return

    // Global leaderboard — one-time fetch is fine, scores don't need to be live
    getDocs(query(collection(db, 'users'), orderBy('avgScore', 'desc')))
      .then((snap) => setGlobalUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))))
      .catch(() => setError('Could not load leaderboard. Check your Firebase config.'))
      .finally(() => setLoading(false))

    // Friends subcollection — real-time so requests/accepts show up instantly
    const unsubscribe = onSnapshot(
      collection(db, 'users', currentUser.uid, 'friends'),
      async (snap) => {
        const newStatuses = {}
        const pendingReqs = []
        const acceptedUids = []

        snap.docs.forEach((d) => {
          newStatuses[d.id] = d.data().status
          if (d.data().status === 'pending_received') pendingReqs.push({ uid: d.id, ...d.data() })
          if (d.data().status === 'accepted') acceptedUids.push(d.id)
        })

        setStatuses(newStatuses)
        setPending(pendingReqs)

        // Fetch accepted friends' user docs for their latest scores
        const friendDocs = await Promise.all(acceptedUids.map((uid) => getDoc(doc(db, 'users', uid))))
        setFriends(friendDocs.filter((d) => d.exists()).map((d) => ({ uid: d.id, ...d.data() })))
      },
      () => setError('Could not load friends.')
    )

    return () => unsubscribe()
  }, [currentUser])

  async function handleAdd(user) {
    setActionLoading(user.uid)
    setError(null)
    try {
      await sendFriendRequest(user.uid, user.displayName ?? user.email)
      // onSnapshot will update statuses; optimistic update handles the instant UI feel
      setStatuses((prev) => ({ ...prev, [user.uid]: 'pending_sent' }))
    } catch {
      setError('Could not send friend request — make sure your Firestore security rules are updated.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancel(targetUid) {
    setActionLoading(targetUid)
    setError(null)
    try {
      await declineFriend(targetUid)
      setStatuses((prev) => { const s = { ...prev }; delete s[targetUid]; return s })
    } catch {
      setError('Could not cancel request.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRemove(targetUid) {
    setActionLoading(targetUid)
    setError(null)
    try {
      await removeFriend(targetUid)
      setFriends((prev) => prev.filter((f) => f.uid !== targetUid))
      setStatuses((prev) => { const s = { ...prev }; delete s[targetUid]; return s })
    } catch {
      setError('Could not remove friend.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleAccept(req) {
    setActionLoading(req.uid)
    setError(null)
    try {
      await acceptFriend(req.uid)
      // onSnapshot handles state update for both sides automatically
    } catch {
      setError('Could not accept request — make sure your Firestore rules are updated.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDecline(req) {
    setActionLoading(req.uid)
    setError(null)
    try {
      await declineFriend(req.uid)
      // onSnapshot handles state update automatically
    } catch {
      setError('Could not decline request — make sure your Firestore rules are updated.')
    } finally {
      setActionLoading(null)
    }
  }

  // Friends leaderboard includes the current user
  const friendsBoard = useMemo(() => {
    const me = globalUsers.find((u) => u.uid === currentUser?.uid)
    return [...friends, ...(me ? [me] : [])].sort((a, b) => b.avgScore - a.avgScore)
  }, [friends, globalUsers, currentUser])

  // Global list (everyone) with optional search
  const filteredGlobal = useMemo(() => {
    const q = search.toLowerCase()
    return globalUsers.filter(
      (u) => !q || (u.displayName ?? u.email ?? '').toLowerCase().includes(q)
    )
  }, [globalUsers, search, currentUser])

  return (
    <div className="flex flex-col gap-6 items-center w-full min-h-[calc(100vh-6rem)] pt-8 sm:pt-12 px-4">
      {/* Header with leaderboard image */}
      <div className="flex flex-col items-center gap-2 w-full max-w-4xl mb-4">
        <img
          src={leaderboardImage}
          alt="Leaderboard"
          className="h-16 sm:h-20 w-auto object-contain"
        />
        <p className="text-sm text-amber-700 text-center">Average posture score across all sessions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit max-w-4xl">
        {['friends', 'global'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'friends' && pending.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <Card><p className="text-gray-400 text-sm text-center py-8">Loading…</p></Card>
      )}
      {error && (
        <Card><p className="text-red-500 text-sm text-center py-8">{error}</p></Card>
      )}

      {/* ── FRIENDS TAB ── */}
      {!loading && !error && tab === 'friends' && (
        <div className="flex flex-col gap-4">
          {/* Pending requests */}
          {pending.length > 0 && (
            <Card title="Friend Requests">
              <div className="flex flex-col divide-y divide-gray-100">
                {pending.map((req) => (
                  <div key={req.uid} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-medium text-gray-800">{req.displayName}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={actionLoading === req.uid}
                        onClick={() => handleAccept(req)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={actionLoading === req.uid}
                        onClick={() => handleDecline(req)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Friends leaderboard */}
          {friendsBoard.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="text-5xl">👯</div>
                <p className="text-gray-700 font-semibold">No friends yet</p>
                <p className="text-sm text-gray-400 max-w-xs">
                  Switch to the Global tab to find and add friends.
                </p>
                <Button size="sm" variant="secondary" onClick={() => setTab('global')}>
                  Find Friends
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex flex-col divide-y divide-gray-100">
                {friendsBoard.map((user, i) => {
                  const isYou   = user.uid === currentUser?.uid
                  const variant = user.sessionCount > 0 ? getScoreVariant(user.avgScore) : null
                  return (
                    <div
                      key={user.uid}
                      className={`flex items-center gap-4 py-3 first:pt-0 last:pb-0 ${
                        isYou ? 'bg-brand-50 -mx-4 px-4 rounded-lg' : ''
                      }`}
                    >
                      <span className="text-xl w-8 text-center flex-shrink-0">
                        {medals[i] ?? `#${i + 1}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isYou ? 'text-brand-700' : 'text-gray-800'}`}>
                          {user.displayName ?? user.email}
                          {isYou && <span className="ml-1.5 text-xs font-normal text-brand-500">you</span>}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user.sessionCount === 1 ? '1 session' : `${user.sessionCount ?? 0} sessions`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {user.sessionCount > 0 ? (
                          <>
                            <span className="text-xl font-bold text-gray-800">{user.avgScore}</span>
                            <Badge label={getScoreLabel(user.avgScore)} variant={variant} />
                          </>
                        ) : (
                          <span className="text-sm text-gray-300">No sessions</span>
                        )}
                        {!isYou && (
                          <button
                            disabled={actionLoading === user.uid}
                            onClick={() => handleRemove(user.uid)}
                            className="text-xs text-gray-300 hover:text-red-400 transition-colors ml-1"
                            title="Remove friend"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── GLOBAL TAB ── */}
      {!loading && !error && tab === 'global' && (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full max-w-xs
                       focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />

          {filteredGlobal.length === 0 ? (
            <Card>
              <p className="text-gray-400 text-sm text-center py-8">
                {search ? 'No users match that name.' : 'No other users yet.'}
              </p>
            </Card>
          ) : (
            <Card>
              <div className="flex flex-col divide-y divide-gray-100">
                {filteredGlobal.map((user, i) => {
                  const isYou   = user.uid === currentUser?.uid
                  const variant = user.sessionCount > 0 ? getScoreVariant(user.avgScore) : null
                  const status  = statuses[user.uid]
                  return (
                    <div
                      key={user.uid}
                      className={`flex items-center gap-4 py-3 first:pt-0 last:pb-0 ${
                        isYou ? 'bg-brand-50 -mx-4 px-4 rounded-lg' : ''
                      }`}
                    >
                      <span className="text-xl w-8 text-center flex-shrink-0 text-gray-400">
                        {medals[i] ?? `#${i + 1}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isYou ? 'text-brand-700' : 'text-gray-800'}`}>
                          {user.displayName ?? user.email}
                          {isYou && <span className="ml-1.5 text-xs font-normal text-brand-500">you</span>}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user.sessionCount === 1 ? '1 session' : `${user.sessionCount ?? 0} sessions`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {user.sessionCount > 0 && (
                          <>
                            <span className="text-xl font-bold text-gray-800">{user.avgScore}</span>
                            <Badge label={getScoreLabel(user.avgScore)} variant={variant} />
                          </>
                        )}
                        {!isYou && (
                          <FriendButton
                            status={status}
                            loading={actionLoading === user.uid}
                            onAdd={() => handleAdd(user)}
                            onCancel={() => handleCancel(user.uid)}
                            onRemove={() => handleRemove(user.uid)}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function FriendButton({ status, loading, onAdd, onCancel, onRemove }) {
  if (status === 'accepted')
    return (
      <Button size="sm" variant="ghost" disabled={loading} onClick={onRemove}
        className="text-brand-600 hover:text-red-500 hover:bg-red-50">
        {loading ? '…' : 'Friends ✓'}
      </Button>
    )
  if (status === 'pending_sent')
    return (
      <Button size="sm" variant="ghost" disabled={loading} onClick={onCancel}
        className="text-gray-400 hover:text-red-500 hover:bg-red-50">
        {loading ? '…' : 'Cancel request'}
      </Button>
    )
  if (status === 'pending_received')
    return <span className="text-xs text-amber-500 font-medium">Wants to be friends</span>
  return (
    <Button size="sm" variant="secondary" disabled={loading} onClick={onAdd}>
      {loading ? '…' : 'Add Friend'}
    </Button>
  )
}
