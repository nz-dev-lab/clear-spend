/**
 * Login.tsx — Sign in page
 *
 * Clean centered card — Monzo/Revolut style.
 * Shows inline field errors and a toast on network failure.
 * On success, saves the access token and redirects to dashboard.
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Wallet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { login } from '../../api/auth'

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as any)?.from?.pathname ?? '/'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({})

  // Basic client-side validation before hitting the API
  const validate = () => {
    const e: typeof errors = {}
    if (!email)                          e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email  = 'Enter a valid email'
    if (!password)                       e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setErrors({})

    try {
      const { accessToken } = await login(email, password)
      localStorage.setItem('accessToken', accessToken)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">

      {/* Card */}
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">

        {/* Teal header */}
        <div className="bg-primary-500 px-6 py-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">ClearSpend</h1>
            <p className="text-primary-100 text-sm mt-1">Sign in to your account</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })) }}
              placeholder="student@uni.ac.nz"
              className={`w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all
                ${errors.email
                  ? 'border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
                  : 'border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900'
                }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(v => ({ ...v, password: undefined })) }}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all
                  ${errors.password
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
                    : 'border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900'
                  }`}
              />
              {/* Show/hide password toggle */}
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
