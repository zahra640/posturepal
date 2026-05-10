import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import logo from '../../images/logo.PNG'
import ScrollArrow from '@/components/layout/ScrollArrow'

export default function Home() {
  return (
    <div id="home" className="flex flex-col items-center justify-center text-center gap-6 min-h-[calc(100vh-6rem)] px-4">
      <img
        src={logo}
        alt="PosturePal"
        className="w-full max-w-[920px] sm:max-w-[1200px] mx-auto mb-0 hero-logo object-contain"
      />

      <h2 className="hero-title text-3xl sm:text-4xl font-semibold text-[rgb(219,173,7)] mt-0 leading-tight">
        Sit Smarter. Feel Better
      </h2>
      
      <div className="flex flex-col items-center gap-4 justify-center mt-6">
        <ScrollArrow to="/dashboard#detector" label="Go to Detector" />
      </div>
    </div>
  )
}
