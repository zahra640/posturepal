import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuth } from '@/context/AuthContext'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { getScoreVariant, getScoreLabel } from '@/utils/scoring'

export default function Leaderboard() {
  const { currentUser } = useAuth()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getDocs(query(collection(db, 'users'), orderBy('avgScore', 'desc')))
      .then((snap) => setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))))
      .catch(() => setError('Could not load leaderboard. Check your Firebase config.'))
      .finally(() => setLoading(false))
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-sm text-gray-500 mt-1">Average posture score across all sessions</p>
      </div>

      {loading && (
        <Card>
          <p className="text-gray-400 text-sm text-center py-8">Loading…</p>
        </Card>
      )}

      {error && (
        <Card>
          <p className="text-red-500 text-sm text-center py-8">{error}</p>
        </Card>
      )}

      {!loading && !error && users.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="text-5xl">🏆</div>
            <p className="text-gray-700 font-semibold">No one's on the board yet</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Complete a tracking session to appear here.
            </p>
          </div>
        </Card>
      )}

      {!loading && !error && users.length > 0 && (
        <Card>
          <div className="flex flex-col divide-y divide-gray-100">
            {users.map((user, i) => {
              const isYou    = user.uid === currentUser?.uid
              const variant  = user.sessionCount > 0 ? getScoreVariant(user.avgScore) : null
              const rankIcon = medals[i] ?? `#${i + 1}`

              return (
                <div
                  key={user.uid}
                  className={`flex items-center gap-4 py-3 first:pt-0 last:pb-0 ${
                    isYou ? 'bg-brand-50 -mx-4 px-4 rounded-lg' : ''
                  }`}
                >
                  <span className="text-xl w-8 text-center flex-shrink-0">{rankIcon}</span>

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
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
