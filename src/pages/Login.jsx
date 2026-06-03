import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import background from '../../images/background.PNG'
import logo from '../../images/logo.PNG'

export default function Login() {
  const { login, register, currentUser } = useAuth()
  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  if (currentUser) return <Navigate to="/dashboard" replace />

  function mapError(errorMessage) {
    if (errorMessage.includes('auth/invalid-credential')) {
      setError('Error: Invalid credentials.');
    } else if (errorMessage.includes('auth/email-already-in-use')) {
      setError('Error: Email already registered.');
    } else if (errorMessage.includes('auth/weak-password')) {
      setError('Error: Password should be at least 6 characters')
    } else if (errorMessage.includes('auth/network-request-failed')) {
      setError('Error: Network request failed.')
    } else if (errorMessage.includes('auth/too-many-requests')) {
      setError('Error: Too many requests.')
    } else if (errorMessage.includes('auth/timeout')) {
      setError('Error: Request timed out.')
    } else {
      setError('Error with server.')
      console.error('Submit Error', errorMessage);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password, displayName)
      } else {
        await login(email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      mapError(err.message);

    } finally {
      setLoading(false)
    }
  }

  function toggle() {
    setIsRegister((v) => !v)
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      />
      <div className="absolute inset-0 bg-white/10" />

      <div className="mb-8 text-center relative z-10">
        <img
          src={logo}
          alt="PosturePal"
          className="h-20 sm:h-24 w-auto mx-auto object-contain mb-2"
        />
      </div>

      <Card className="w-full max-w-sm relative z-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <Field
              label="Your name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Aleeza"
              required
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full mt-1">
            {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={toggle}
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </Card>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                   placeholder:text-gray-300"
      />
    </div>
  )
}
