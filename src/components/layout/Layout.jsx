import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Outlet />
      </main>
      <footer className="text-center text-sm text-gray-400 py-4">
        PosturePal &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
