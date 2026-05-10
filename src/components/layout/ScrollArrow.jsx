import { useNavigate } from 'react-router-dom'
import arrow from '../../../images/arrow.png'

export default function ScrollArrow({ to = '/dashboard#detector', label = 'Go to Detector' }) {
  const navigate = useNavigate()

  function handleClick(e) {
    e.preventDefault()
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
