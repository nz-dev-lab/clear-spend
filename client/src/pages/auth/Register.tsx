/**
 * Register.tsx — Create a new student account
 *
 * Same visual style as Login.
 * Validates name, email, password, and confirm password before submitting.
 * On success, saves the token and goes straight to the dashboard.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Wallet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { register } from '../../api/auth'

export default function Register() {
  const navigate = useNavigate()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())                        e.name     = 'Name is required'
    if (!email)                              e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email))   e.email    = 'Enter a valid email'
    if (!password)                           e.password = 'Password is required'
    else if (password.length < 6)           e.password = 'At least 6 characters'
    if (password !== confirm)               e.confirm  = 'Passwords do not match'
    return e
  }

  const clearError = (field: string) =>
    setErrors(v => { const next = { ...v }; delete next[field]; return next })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setErrors({})

    try {
      const { accessToken } = await register(name.trim(), email, password)
      localStorage.setItem('accessToken', accessToken)
      toast.success('Account created! Welcome to ClearSpend 🎉')
      navigate('/', { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Reusable input class helper
  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all ${
      errors[field]
        ? 'border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
        : 'border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900'
    }`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8">

      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">

        {/* Teal header */}
        <div className="bg-primary-500 px-6 py-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">ClearSpend</h1>
            <p className="text-primary-100 text-sm mt-1">Create your account</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError('name') }}
              placeholder="Alex Smith"
              className={inputClass('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError('email') }}
              placeholder="student@uni.ac.nz"
              className={inputClass('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError('password') }}
                placeholder="At least 6 characters"
                className={inputClass('password') + ' pr-11'}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm password
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); clearError('confirm') }}
              placeholder="••••••••"
              className={inputClass('confirm')}
            />
            {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
