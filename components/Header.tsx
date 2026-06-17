// components/Header.tsx
'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Bell, HelpCircle, User, Loader2 } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const { data: session } = useSession()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      setLoading(true)
      router.push(`/audit/new?url=${encodeURIComponent(url.trim())}`)
      setUrl('')
      setTimeout(() => setLoading(false), 800)
    }
  }

  return (
    <header className="fixed top-0 right-0 left-64 bg-[#080c14]/30 backdrop-blur-md flex justify-between items-center px-8 h-16 z-30 border-b border-white/5 print-hide">
      {/* Dynamic Search Box */}
      <form onSubmit={handleSubmit} className="flex items-center glass-card px-4 py-1.5 rounded-full w-96 relative group">
        {loading ? (
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin mr-2" />
        ) : (
          <Search className="w-4 h-4 text-gray-400 mr-2 group-focus-within:text-purple-400 transition-colors" />
        )}
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          placeholder="Analyze a URL..."
          className="bg-transparent border-none outline-none text-xs w-full placeholder:text-gray-500 text-white focus:ring-0 focus:outline-none"
        />
        {url.trim() && (
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full hover:bg-purple-500/30 transition-all cursor-pointer"
          >
            Go
          </button>
        )}
      </form>

      {/* Utilities */}
      <div className="flex items-center gap-6">
        {/* Notifications Icon */}
        <button className="text-gray-400 hover:text-purple-400 transition-colors relative group py-1 cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-0.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-[#080c14]" />
          
          {/* Notification Menu overlay */}
          <div className="absolute right-0 top-10 w-64 glass-card rounded-xl p-4 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 text-left">
            <h4 className="text-xs font-bold font-sora text-white mb-2 border-b border-white/5 pb-1">Notifications</h4>
            <div className="space-y-2">
              <div className="text-[10px] text-gray-400 leading-relaxed">
                <span className="text-purple-400 font-bold">System Status:</span> Live audits database loaded online.
              </div>
              <div className="text-[10px] text-gray-400 leading-relaxed">
                <span className="text-green-400 font-bold">Optimization Success:</span> Critical domains resolved check reports.
              </div>
            </div>
          </div>
        </button>

        {/* Documentation / Help Trigger */}
        <button 
          onClick={() => alert("AGX Beyond SEO is a custom performance dashboard with integrated Google Gemini artificial intelligence audit reporting. Navigate around to run active live metrics.")}
          className="text-gray-400 hover:text-purple-400 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Account Capsule */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 cursor-pointer hover:border-purple-500 transition-all">
          <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-black text-white uppercase">
            {(session?.user?.name || 'A')[0]}
          </div>
          <span className="text-xs font-medium text-purple-300 truncate max-w-[100px]">
            {session?.user?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  )
}
