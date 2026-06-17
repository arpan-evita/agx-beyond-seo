// components/Sidebar.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LayoutDashboard, Search, FileText, Settings, LogOut, User } from 'lucide-react'

export default function Sidebar() {
  const path = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/audit/new', label: 'New Audit', icon: Search },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings }
  ]

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-[#080c14]/90 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col justify-between py-8 z-40 print-hide">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="px-8 mb-10 select-none cursor-pointer">
          <Link href="/dashboard">
            <h1 className="font-sora text-2xl font-bold text-[#d2bbff] drop-shadow-[0_0_10px_rgba(124,58,237,0.5)] tracking-tight">
              AGX BEYOND
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-[#ccc3d8]/60 font-medium mt-1">
              SEO Suite
            </p>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = path === item.href || path.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative w-full px-8 py-3.5 flex items-center gap-3 transition-all duration-300 ease-in-out font-geist text-sm text-left ${
                  isActive 
                    ? 'text-[#d2bbff] font-bold bg-gradient-to-r from-[#7c3aed]/10 to-transparent border-l-[3px] border-[#7c3aed]' 
                    : 'text-[#ccc3d8] hover:text-white hover:bg-white/5 hover:backdrop-blur-md'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#d2bbff]' : 'text-[#ccc3d8]/70'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Info & Sign Out */}
      <div className="px-6 space-y-4">
        {/* User Card */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
            {(session?.user?.name || 'A')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{session?.user?.name || 'Admin'}</div>
            <div className="text-[9px] text-[#ccc3d8]/50 truncate">{session?.user?.email}</div>
          </div>
        </div>

        {/* Logout button */}
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 text-[#ccc3d8]/80 hover:text-red-400 transition-colors font-geist text-sm cursor-pointer w-full text-left py-2 px-4"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
