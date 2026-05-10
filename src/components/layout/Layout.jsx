import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import background from '../../../images/background.PNG'

import Home from '@/pages/Home'
import Dashboard from '@/pages/Dashboard'
import History from '@/pages/History'
import Leaderboard from '@/pages/Leaderboard'
import Settings from '@/pages/Settings'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    // Decide target section based on path or hash
    const navbar = document.querySelector('.app-navbar')
    const navH = navbar ? navbar.offsetHeight : 96

    let targetId = 'home'
    if (location.hash && location.hash.length > 1) {
      targetId = location.hash.replace('#', '')
    } else {
      const p = location.pathname
      if (p === '/dashboard') targetId = 'detector'
      else if (p === '/history') targetId = 'history'
      else if (p === '/leaderboard') targetId = 'leaderboard'
      else if (p === '/settings') targetId = 'settings'
      else targetId = 'home'
    }

    let attempts = 0
    const maxAttempts = 12
    const retryMs = 80

    function tryScroll() {
      const el = document.getElementById(targetId)
      if (el) {
        const top = Math.max(0, el.offsetTop - navH - 24)
        window.scrollTo({ top, behavior: 'smooth' })
        return true
      }
      return false
    }

    const id = setInterval(() => {
      attempts += 1
      if (tryScroll() || attempts >= maxAttempts) clearInterval(id)
    }, retryMs)

    setTimeout(tryScroll, 120)
    return () => clearInterval(id)
  }, [location])

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      />
      <div className="absolute inset-0 bg-white/10" />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8 max-w-5xl relative z-10">
        <section id="home">
          <Home />
        </section>

        <section id="detector">
          <Dashboard />
        </section>

        <section id="history">
          <History />
        </section>

        <section id="leaderboard">
          <Leaderboard />
        </section>

        <section id="settings">
          <Settings />
        </section>
      </main>

      <footer className="text-center text-sm text-gray-400 py-4 relative z-10">
        PosturePal &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
