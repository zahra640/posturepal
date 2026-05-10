import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-20">
      <p className="text-6xl font-black text-gray-200">404</p>
      <h1 className="text-xl font-semibold text-gray-700">Page not found</h1>
      <Link to="/">
        <Button variant="secondary">Back to Home</Button>
      </Link>
    </div>
  )
}
