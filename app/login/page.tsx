// app/login/page.tsx
'use client'
import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await signIn('credentials', {
        email, password, redirect: false,
      })
      setLoading(false)
      if (res?.error) {
        setError('Invalid email or password.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-[#dfe2ee] flex items-center justify-center p-4 relative overflow-hidden font-geist">
      {/* Decorative background blur vectors */}
      <div className="absolute top-[10%] right-[10%] w-[380px] h-[380px] bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[380px] h-[380px] bg-cyan-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md fade-in select-none">
        
        {/* Logo Branding */}
        <div className="text-center mb-10 select-none">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center glow-purple"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs text-purple-400 font-extrabold tracking-widest uppercase leading-none">AGX</div>
              <div className="text-xl font-bold gradient-text leading-tight font-sora">Beyond SEO</div>
            </div>
          </div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            AI-Powered SEO Intelligence Suite
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          
          <div className="mb-8 select-none">
            <h1 className="font-sora text-2xl font-bold text-white flex items-center gap-2">
              <span>Welcome Back</span>
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </h1>
            <p className="text-gray-400 text-xs font-medium mt-1 font-geist">
              Sign in to manage your team database credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 text-white placeholder:text-gray-700 font-mono outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                Secret Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 text-white placeholder:text-gray-700 outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:from-[#6d28d9] hover:to-[#059ebd] text-white font-extrabold rounded-xl shadow-xl hover:shadow-[#7c3aed]/10 transition-all flex items-center justify-center gap-2 group cursor-pointer text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Validating Credentials...</span>
                </>
              ) : (
                <span>SIGN IN →</span>
              )}
            </button>
          </form>
          
          <div className="border-t border-white/5 pt-6 mt-6 text-center select-none text-[10px] text-gray-600 font-medium">
            AGX Beyond Intelligence Portal · NCR Binds Enabled
          </div>

        </div>

      </div>
    </div>
  )
}
