import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import pal from '../../../images/pal.PNG'
import homeIcon from '../../../images/home.png'
import detectorIcon from '../../../images/detector.png'
import leaderboardIcon from '../../../images/leaderboard.png'
import historyIcon from '../../../images/history.png'
import settingsIcon from '../../../images/settings.png'

const links = [
  { to: '/',            label: 'Home',       icon: homeIcon },
  { to: '/dashboard',   label: 'Detector',   icon: detectorIcon },
  { to: '/history',     label: 'History',    icon: historyIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: leaderboardIcon },
  { to: '/settings',    label: 'Settings',   icon: settingsIcon },
]

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="app-navbar fixed top-0 left-0 w-full z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between h-20 sm:h-24">
        <div className="flex items-center gap-8 sm:gap-12">
          <img
            src={pal}
            alt="PosturePal"
            className="h-14 sm:h-16 w-auto max-w-[180px] object-contain rounded-lg shrink-0 mr-4 sm:mr-6 -ml-2 sm:-ml-4"
          />
          <span className="sr-only">PosturePal</span>
        </div>

        <ul className="flex gap-6 sm:gap-8 items-center">
          {links.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                aria-label={label}
                className={({ isActive }) =>
                  `flex items-center justify-center transition-colors ${
                    isActive
                      ? 'text-brand-700 border-b-2 border-brand-300'
                      : 'text-gray-600 hover:text-brand-700'
                  }`
                }
              >
                {icon ? (
                  <img
                    src={icon}
                    alt=""
                    aria-hidden="true"
                    className="object-contain drop-shadow-sm h-12 sm:h-14 w-[130px] sm:w-[150px]"
                  />
                ) : label === 'History' ? (
                  <svg viewBox="0 0 24 24" className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.5 4v2.5H6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 3v2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 19v2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4.93 4.93l1.41 1.41" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17.66 17.66l1.41 1.41" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 12h2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 12h2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.34 17.66l-1.41 1.41" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19.07 4.93l-1.41 1.41" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3.5" />
                  </svg>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {currentUser && (
          <div className="flex items-center gap-6 sm:gap-8 ml-12 sm:ml-16">
            <span className="text-sm text-gray-500 hidden sm:block">
              {currentUser.displayName ?? currentUser.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
