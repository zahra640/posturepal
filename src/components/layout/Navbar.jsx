import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import pal from '../../../images/pal.PNG'

const links = [
  { to: '/',            label: 'Home' },
  { to: '/dashboard',   label: 'Detector' },
  { to: '/history',     label: 'History' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/settings',    label: 'Settings' },
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
          {links.map(({ to, label }) => (
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
                  <span className="px-3 py-2 text-sm sm:text-base font-medium tracking-wide">
                    {label}
                  </span>
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
