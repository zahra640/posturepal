import { useNavigate } from 'react-router-dom'
import arrow from '../../../images/arrow.png'

export default function ScrollArrow({ to = '/dashboard#detector', label = 'Go to Detector' }) {
  const navigate = useNavigate()

  async function handleClick(e) {
    e.preventDefault()

    // If the detector element exists on the current page, perform an in-page scroll
    const el = document.getElementById('detector')
    const navbar = document.querySelector('.app-navbar')
    const navH = navbar ? navbar.offsetHeight : 96
    if (el) {
      const target = el.offsetTop - navH - 24
      window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
      return
    }

    // Otherwise navigate to the dashboard route with hash so the dashboard can scroll on mount
    navigate(to)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer"
    >
      <img
        src={arrow}
        alt=""
        aria-hidden="true"
        className="w-20 h-20 sm:w-24 sm:h-24 object-contain arrow-bob"
      />
    </button>
  )
}
