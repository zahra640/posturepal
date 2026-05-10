import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 py-20">
      <h1 className="text-4xl font-bold text-gray-900">
        Sit smart with{' '}
        <span className="text-brand-600">PosturePal</span>
      </h1>
      <p className="text-lg text-gray-500 max-w-md">
        Real-time posture feedback so you can feel better, work longer, and
        stay healthier at your desk.
      </p>

      <div className="flex gap-3">
        <Link to="/dashboard">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link to="/settings">
          <Button variant="secondary" size="lg">Settings</Button>
        </Link>
      </div>
    </div>
  )
}
