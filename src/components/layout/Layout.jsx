import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import background from '../../../images/background.PNG'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      />
      <div className="absolute inset-0 bg-white/10" />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8 max-w-5xl relative z-10">
        <Outlet />
      </main>

      <footer className="text-center text-sm text-gray-400 py-4 relative z-10">
        PosturePal &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
