// app/(app)/settings/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Key, 
  Eye, 
  EyeOff, 
  Shield, 
  Users, 
  Trash2,
  Share2,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle,
  Plus,
  User,
  X
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  createdAt: string
  lastLogin?: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as { role?: string })?.role === 'admin'

  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'team'>('settings')

  // Integration Credentials credentials
  const [apifyToken, setApifyToken] = useState('')
  const [showApify, setShowApify] = useState(false)
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [showGemini, setShowGemini] = useState(false)
  const [tokenLoading, setTokenLoading] = useState(false)

  // Password configuration
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  // Team collaborators lists
  const [team, setTeam] = useState<TeamMember[]>([])
  const [teamLoading, setTeamLoading] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberForm, setNewMemberForm] = useState({ name: '', email: '', password: '', role: 'member' })

  // Notifications banner toast
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isAdmin) {
      // Fetch credentials settings
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (data.apifyToken) setApifyToken(data.apifyToken)
          if (data.geminiApiKey) setGeminiApiKey(data.geminiApiKey)
        })
        .catch(() => {})

      // Fetch team users
      fetchMembers()
    }
  }, [isAdmin])

  const fetchMembers = async () => {
    setTeamLoading(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setTeam(data)
      }
    } catch {}
    setTeamLoading(false)
  }

  const triggerNotify = (msg: string) => {
    setSuccessMsg(msg)
    setErrorMsg('')
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  const triggerError = (msg: string) => {
    setErrorMsg(msg)
    setSuccessMsg('')
    setTimeout(() => setErrorMsg(''), 3500)
  }

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setTokenLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apifyToken, geminiApiKey }),
      })
      if (res.ok) {
        triggerNotify("Integration credentials saved successfully.")
      } else {
        const data = await res.json()
        triggerError(data.error || 'Failed to save settings')
      }
    } catch {
      triggerError('Error connecting to server settings')
    }
    setTokenLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      triggerError("All password fields are required.")
      return
    }
    if (newPassword !== confirmPassword) {
      triggerError("Passwords do not match.")
      return
    }
    if (newPassword.length < 8) {
      triggerError("New password must be at least 8 characters.")
      return
    }

    setPwdLoading(true)
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        triggerNotify("Password updated and hashed successfully.")
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await res.json()
        triggerError(data.error || 'Failed to change password')
      }
    } catch {
      triggerError('Error connecting to update password')
    }
    setPwdLoading(false)
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberForm.name.trim() || !newMemberForm.email.trim() || !newMemberForm.password.trim()) {
      triggerError("All collaborator parameters are required.")
      return
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemberForm),
      })
      if (res.ok) {
        triggerNotify(`Added team access permission for ${newMemberForm.name}.`)
        setNewMemberForm({ name: '', email: '', password: '', role: 'member' })
        setShowAddMember(false)
        fetchMembers()
      } else {
        const data = await res.json()
        triggerError(data.error || 'Failed to add team member')
      }
    } catch {
      triggerError('Error establishing guest permission credentials')
    }
  }

  const handleRemoveMember = async (id: string, name: string) => {
    if (!confirm(`Revoke team permission access token for ${name}?`)) return
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        triggerNotify(`Revoked team access for ${name}.`)
        fetchMembers()
      } else {
        const data = await res.json()
        triggerError(data.error || 'Failed to revoke member')
      }
    } catch {
      triggerError('Error connecting to revoke member')
    }
  }

  const handleGetInviteLink = () => {
    const inviteLink = `${window.location.origin}/login`
    navigator.clipboard.writeText(inviteLink)
    triggerNotify("Platform sign-in portal link copied to clipboard!")
  }

  return (
    <div className="pt-24 px-8 pb-12 w-full max-w-7xl mx-auto font-geist">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 select-none">
        <div>
          <h2 className="font-sora text-3xl font-bold tracking-tight text-white">
            History &amp; Configuration
          </h2>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Review your historical configurations and manage system-level integration settings for the AGX Beyond SEO engine.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex space-x-1 bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/5 shrink-0 self-start md:self-auto shadow-2xl">
          <button 
            onClick={() => setActiveSubTab('settings')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer ${
              activeSubTab === 'settings' 
                ? 'bg-[#7c3aed] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Admin Settings
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => setActiveSubTab('team')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeSubTab === 'team' 
                  ? 'bg-[#7c3aed] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Team Access
            </button>
          )}
        </div>
      </div>

      {/* Success banner notifications */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-[0_0_15px_rgba(78,222,163,0.1)] select-none">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 flex items-center gap-2 select-none animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Tab Content: Settings */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 space-y-6">
            {/* Credentials Block */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-6 select-none border-b border-white/5 pb-4">
                <span className="p-2 bg-[#06b6d4]/10 rounded-lg text-[#06b6d4]">
                  <Key className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-sora text-lg font-bold text-white">Integration Credentials</h3>
                  <p className="text-[10px] tracking-wide text-gray-500 mt-0.5 uppercase">API access token authorizations</p>
                </div>
              </div>

              {isAdmin ? (
                <form onSubmit={handleSaveCredentials} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Apify key */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        Apify API Key
                      </label>
                      <div className="relative">
                        <input 
                          type={showApify ? "text" : "password"}
                          value={apifyToken}
                          onChange={(e) => setApifyToken(e.target.value)}
                          placeholder="apify_api_..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-11 text-xs focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 text-white placeholder:text-gray-700 font-mono"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowApify(!showApify)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-all cursor-pointer"
                        >
                          {showApify ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">Used for crawling website targets and mapping lists.</p>
                    </div>

                    {/* Gemini Key */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        Gemini Pro API Key
                      </label>
                      <div className="relative">
                        <input 
                          type={showGemini ? "text" : "password"}
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-11 text-xs focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 text-white placeholder:text-gray-700 font-mono"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowGemini(!showGemini)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-all cursor-pointer"
                        >
                          {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">Used for semantic content advice and roadmap suggestions.</p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end select-none">
                    <button 
                      type="submit"
                      disabled={tokenLoading}
                      className="px-8 py-3 bg-[#7c3aed] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:brightness-110 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] cursor-pointer disabled:opacity-50"
                    >
                      {tokenLoading ? 'Saving...' : 'Save Credentials'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-sm text-gray-400">
                  🔒 You must be a System Administrator to view or edit the Integration credentials configuration.
                </div>
              )}
            </div>

            {/* Password security update block */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-6 select-none border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <Shield className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-sora text-lg font-bold text-white">Security &amp; Password</h3>
                    <p className="text-[10px] tracking-wide text-gray-500 mt-0.5 uppercase">Administrative safety configurations</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Current Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">New Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Confirm Password</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 select-none">
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Passwords must be at least 8 characters and satisfy high-throughput security criteria.
                  </p>
                </div>

                <div className="flex justify-end select-none">
                  <button 
                    type="submit"
                    disabled={pwdLoading}
                    className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    {pwdLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar widget details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-2xl p-5 border border-white/5 shadow-2xl relative overflow-hidden group select-none">
              <div className="relative z-10">
                <h4 className="font-sora text-sm font-bold text-white mb-1.5">Invite Collaborators</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed mb-4">
                  Share real-time SEO insights with your entire marketing team securely.
                </p>
                <button 
                  onClick={handleGetInviteLink}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 text-[#0f131c] rounded-lg font-bold text-xs transition-all tracking-wider uppercase shadow-xl cursor-pointer hover:scale-[1.01]"
                >
                  Get Access Link
                </button>
              </div>
              <div className="absolute -right-5 -bottom-5 opacity-5 transition-transform group-hover:scale-125 duration-700 pointer-events-none text-white">
                <Share2 className="w-20 h-20" />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. Tab Content: Team management list */}
      {activeSubTab === 'team' && isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8">
            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
              <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="font-sora text-sm font-bold text-white">Team Access</h3>
                </div>
                <button 
                   onClick={() => setShowAddMember(!showAddMember)}
                   className="w-8 h-8 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 flex items-center justify-center transition-all cursor-pointer"
                >
                  {showAddMember ? <X className="w-4 h-4" /> : <Plus className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* Inline Add member form */}
              {showAddMember && (
                <form onSubmit={handleAddMember} className="p-6 bg-white/[0.02] border-b border-white/5 space-y-4 animate-fade-in">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Authorize Guest Entry</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text"
                      required
                      placeholder="Collaborator name..."
                      value={newMemberForm.name}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500"
                    />
                    <input 
                      type="email"
                      required
                      placeholder="Email address..."
                      value={newMemberForm.email}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500 font-mono"
                    />
                    <input 
                      type="password"
                      required
                      placeholder="Password..."
                      value={newMemberForm.password}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-purple-500"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <select
                      value={newMemberForm.role}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value as any })}
                      className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:border-purple-500 cursor-pointer"
                    >
                      <option value="member">Auditor Member</option>
                      <option value="admin">System Admin</option>
                    </select>

                    <button 
                      type="submit"
                      className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Grant Entry Access
                    </button>
                  </div>
                </form>
              )}

              {/* Members table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] text-gray-400 font-bold text-[10px] uppercase tracking-wider select-none border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">Collaborator</th>
                      <th className="px-6 py-4">System Role</th>
                      <th className="px-6 py-4">Registration Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {teamLoading && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading collaborators...</td>
                      </tr>
                    )}
                    {!teamLoading && team.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                      </tr>
                    )}
                    {team.map((member) => (
                      <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-white/10 flex items-center justify-center text-purple-300 font-bold text-xs uppercase">
                              {(member.name || 'A')[0]}
                            </div>
                            <div>
                              <p className="font-bold text-white leading-tight">{member.name}</p>
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 select-none">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border
                            ${member.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right select-none">
                          {session?.user?.email !== member.email ? (
                            <button 
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 p-1 rounded hover:bg-white/5 cursor-pointer"
                              title="Revoke Permission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-500 italic">Current User</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
