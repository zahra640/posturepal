import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { getSessions, clearSessions, subscribeSessions } from '@/services/storageService'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuth } from '@/context/AuthContext'
import { getScoreVariant, getScoreLabel, rollingAverage } from '@/utils/scoring'
import { formatTimestamp, formatDuration } from '@/utils/formatters'
import historyImage from '../../images/history.png'

function sessionDurationSecs(s) {
  return Math.round((s.endedAt - s.startedAt) / 1000)
}

function scoreColor(score) {
  if (score >= 75) return 'bg-amber-400'
  if (score >= 50) return 'bg-amber-300'
  return 'bg-red-400'
}

export default function History() {
  const { currentUser } = useAuth()
  const [allSessions, setAllSessions] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    let unsubLocal = null
    let unsubFirestore = null
    setLoading(true)

    if (currentUser) {
      const q = query(collection(db, 'users', currentUser.uid, 'sessions'), orderBy('startedAt', 'asc'))
      unsubFirestore = onSnapshot(q, (snap) => {
        setAllSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      }, () => setLoading(false))
    } else {
      // guest: initial load + subscribe to in-window changes
      getSessions()
        .then((s) => setAllSessions(s))
        .finally(() => setLoading(false))
      unsubLocal = subscribeSessions((s) => setAllSessions(s))
    }

    return () => {
      if (unsubFirestore) unsubFirestore()
      if (unsubLocal) unsubLocal()
    }
  }, [currentUser])

  const sessions     = allSessions.slice().reverse()
  const chartSessions = allSessions.slice(-14)

  const stats = useMemo(() => {
    if (!allSessions.length) return null
    const totalSecs = allSessions.reduce((acc, s) => acc + sessionDurationSecs(s), 0)
    return {
      count:     allSessions.length,
      avgScore:  rollingAverage(allSessions.map((s) => s.avgScore)),
      bestScore: Math.max(...allSessions.map((s) => s.avgScore)),
      totalTime: formatDuration(totalSecs),
    }
  }, [allSessions])

  async function handleClear() {
    await clearSessions()
    setAllSessions([])
  }

  const isEmpty = !loading && sessions.length === 0

  return (
    <div className="flex flex-col gap-6 items-center w-full min-h-[calc(100vh-6rem)] pt-8 sm:pt-12 px-4">
      {/* Header with history image */}
      <div className="flex items-center justify-between w-full max-w-4xl mb-4">
        <img
          src={historyImage}
          alt="History & Stats"
          className="h-16 sm:h-20 w-auto object-contain"
        />
        {!isEmpty && !loading && (
          <button
            onClick={handleClear}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Clear all data
          </button>
        )}
      </div>

      {loading ? (
        <Card>
          <p className="text-gray-400 text-sm text-center py-8">Loading…</p>
        </Card>
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Sessions" value={stats.count} />
            <StatCard label="Avg Score" value={`${stats.avgScore}`} unit="/100" accent={getScoreVariant(stats.avgScore)} />
            <StatCard label="Best Session" value={`${stats.bestScore}`} unit="/100" accent={getScoreVariant(stats.bestScore)} />
            <StatCard label="Total Time" value={stats.totalTime} />
          </div>

          <Card title={`Score Trend — last ${chartSessions.length} sessions`}>
            <div className="flex items-end gap-1.5 h-32">
              {chartSessions.map((s) => (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '100px' }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {s.avgScore}
                    </div>
                    <div
                      className={`w-full rounded-t ${scoreColor(s.avgScore)} transition-all`}
                      style={{ height: `${s.avgScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 hidden sm:block">
                    {new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-300 mt-1">
              <span>0</span><span>50</span><span>100</span>
            </div>
          </Card>

          <Card title="Session Log">
            <div className="flex flex-col divide-y divide-gray-100">
              {sessions.map((s) => {
                const variant  = getScoreVariant(s.avgScore)
                const duration = sessionDurationSecs(s)
                return (
                  <div key={s.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-gray-800">{formatTimestamp(s.startedAt)}</span>
                      <span className="text-xs text-gray-400">Duration: {formatDuration(duration)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-800">{s.avgScore}</span>
                      <Badge label={getScoreLabel(s.avgScore)} variant={variant} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, unit, accent }) {
  const accentColor = {
    good:    'text-green-600',
    warning: 'text-amber-500',
    bad:     'text-red-500',
  }[accent] ?? 'text-gray-800'

  return (
    <Card>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accentColor}`}>
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-0.5">{unit}</span>}
      </p>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="text-5xl">📊</div>
        <p className="text-gray-700 font-semibold">No sessions yet</p>
        <p className="text-sm text-gray-400 max-w-xs">
          Start tracking your posture on the Detector. Your history will appear here after your first session.
        </p>
      </div>
    </Card>
  )
}
