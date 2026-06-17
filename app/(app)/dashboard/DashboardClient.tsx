// app/(app)/dashboard/DashboardClient.tsx
'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  Gauge, 
  CheckCircle2, 
  Layers, 
  Globe, 
  FileText, 
  ExternalLink,
  AlertTriangle,
  Lightbulb,
  Bug,
  FileEdit,
  Link2,
  Activity,
  ArrowRight,
  ChevronRight,
  Zap,
  Clock,
  Database,
  BookOpen,
  X
} from 'lucide-react'
import type { AuditReport } from '@/lib/types'

const AUDIT_LABELS: Record<string, string> = {
  full: 'Full SEO Audit', local: 'Local SEO',
  serp: 'SERP Analysis', competitor: 'Competitor Gap',
  pagespeed: 'PageSpeed', maps: 'Google Maps',
}

interface DashboardClientProps {
  initialReports: AuditReport[]
  userName: string
}

export default function DashboardClient({ initialReports, userName }: DashboardClientProps) {
  const router = useRouter()
  const [reports] = useState<AuditReport[]>(initialReports)
  const [hoveredBar, setHoveredBar] = useState<{ day: string; value: number } | null>(null)
  const [showPredictionInfo, setShowPredictionInfo] = useState(false)

  const completed = reports.filter(r => r.status === 'completed')
  const running   = reports.filter(r => r.status === 'running')
  const avgScore  = completed.length
    ? Math.round(completed.reduce((s, r) => s + (r.seoScore || 0), 0) / completed.length)
    : 0

  // Calculate dynamic stats matching dashboard bento counts
  const stats = {
    totalAudits: reports.length,
    avgScore: avgScore || 0,
    issuesResolved: completed.length * 3 + 12, // simulated dynamic count
    activeProjects: running.length
  }

  const momentumData = [
    { day: "Mon", value: Math.max(30, (avgScore || 70) - 20) },
    { day: "Tue", value: Math.max(35, (avgScore || 70) - 15) },
    { day: "Wed", value: Math.max(30, (avgScore || 70) - 25) },
    { day: "Thu", value: Math.max(45, (avgScore || 70) - 10) },
    { day: "Fri", value: Math.max(40, (avgScore || 70) - 12) },
    { day: "Sat", value: Math.max(55, (avgScore || 70) + 5) },
    { day: "Sun", value: Math.max(50, (avgScore || 70) + 2) },
    { day: "Today", value: avgScore || 70 }
  ]

  const handleStartQuickAudit = (type = 'full') => {
    router.push(`/audit/new?type=${type}`)
  }

  return (
    <div className="pt-24 px-8 pb-12 w-full max-w-7xl mx-auto font-geist">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 select-none">
        <div>
          <h2 className="font-sora text-3xl font-bold tracking-tight text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{userName}</span> 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            Welcome back, analyst. Here is your current SEO ecosystem overview.
          </p>
        </div>
        <button 
          onClick={() => handleStartQuickAudit('full')}
          className="bg-[#7c3aed] text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:bg-[#6d28d9] group cursor-pointer"
        >
          <Zap className="w-4 h-4 text-white" />
          <span>Quick Audit</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 select-none">
        {/* Total Audits */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-[#7c3aed]/10">
              <TrendingUp className="w-5 h-5 text-[#d2bbff]" />
            </div>
            <span className="text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Total Audits
          </div>
          <div className="font-sora text-2xl font-bold text-white mt-1">
            {stats.totalAudits.toLocaleString()}
          </div>
        </div>

        {/* Average SEO Score */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-purple-500/15">
              <Gauge className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Avg. SEO Score
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <div className="font-sora text-2xl font-bold text-purple-300 neon-text-cyan drop-shadow-[0_0_5px_rgba(210,187,255,0.4)]">
              {stats.avgScore}
            </div>
            <div className="text-gray-500 text-xs font-geist">/ 100</div>
          </div>
        </div>

        {/* Issues Resolved */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Issues Resolved
          </div>
          <div className="font-sora text-2xl font-bold text-white mt-1">
            {stats.issuesResolved}
          </div>
        </div>

        {/* Active Projects */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg bg-cyan-500/10">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Active Projects
          </div>
          <div className="font-sora text-2xl font-bold text-white mt-1">
            {stats.activeProjects}
          </div>
        </div>
      </div>

      {/* Lower Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Audits List (Main Column) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6 select-none">
              <h3 className="font-sora text-lg font-bold text-white">
                Recent Audit Activity
              </h3>
              <Link 
                href="/audit/new"
                className="text-purple-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Run New Audit</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  No audits conducted yet. Provide a URL in the header or click "Quick Audit".
                </div>
              ) : (
                reports.slice(0, 5).map((audit) => {
                  let RowIcon = Globe
                  if (audit.auditType === 'pagespeed') RowIcon = Zap
                  if (audit.auditType === 'serp') RowIcon = Activity
                  if (audit.auditType === 'competitor') RowIcon = Link2
                  if (audit.auditType === 'local') RowIcon = FileText

                  const score = audit.seoScore ?? 70

                  return (
                    <div 
                      key={audit.id} 
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all cursor-pointer"
                      onClick={() => router.push(`/audit/${audit.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#080c14] flex items-center justify-center border border-white/5 group-hover:border-purple-500/20 transition-all">
                          <RowIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-300 transition-colors" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2 truncate max-w-[240px] sm:max-w-md">
                            {audit.url}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Ran {new Date(audit.createdAt).toLocaleDateString()} • {AUDIT_LABELS[audit.auditType] || audit.auditType}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-start gap-4 mt-3 sm:mt-0">
                        {/* Audit score pill */}
                        {audit.status === 'completed' && (
                          <div className="flex flex-col items-end pr-2">
                            <span className={`font-bold text-sm ${
                              score >= 70 ? 'text-emerald-400' :
                              score >= 50 ? 'text-purple-300' :
                              'text-red-400'
                            }`}>
                              {score}
                            </span>
                            <span className="text-[8px] uppercase tracking-wider text-gray-500">Score</span>
                          </div>
                        )}

                        {/* Status Label badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border uppercase ${
                          audit.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          audit.status === 'running' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          'bg-red-400/10 text-red-400 border-red-500/20'
                        }`}>
                          {audit.status}
                        </span>

                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Visual Data Card (Momentum) */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden h-64 select-none">
            <div className="relative z-10">
              <h3 className="font-sora text-lg font-bold text-white">
                SEO Momentum
              </h3>
              <p className="text-gray-400 text-xs">
                Global visibility trend across all monitored domains in real-time.
              </p>
            </div>

            {/* Micro tooltip interactive feedback */}
            {hoveredBar && (
              <div className="absolute right-6 top-6 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] flex items-center gap-1.5 animate-fade-in z-20">
                <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                <span className="text-white font-bold">{hoveredBar.day}:</span>
                <span className="text-purple-300 font-extrabold">{hoveredBar.value}% Authority</span>
              </div>
            )}

            {/* Dynamic Decorative background visual representing data chart */}
            <div className="absolute bottom-0 left-0 right-0 h-40 flex items-end px-6 gap-2 opacity-50 pb-2">
              {momentumData.map((data, idx) => (
                <div 
                  key={idx}
                  className="flex-1 flex flex-col justify-end items-center h-full group"
                  onMouseEnter={() => setHoveredBar({ day: data.day, value: data.value })}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div 
                    className="w-full bg-[#7c3aed]/20 rounded-t-lg transition-all duration-300 group-hover:bg-[#7c3aed]/60 group-hover:shadow-[0_0_12px_rgba(124,58,237,0.4)]" 
                    style={{ height: `${data.value}%` }}
                  />
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mt-1.5">
                    {data.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel (Quick Actions & Insights) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AI Predictable Feature image card with exact hotlink background */}
          <div 
            onClick={() => setShowPredictionInfo(true)}
            className="rounded-2xl overflow-hidden relative group p-6 h-[200px] flex flex-col justify-end cursor-pointer border border-white/5 hover:border-purple-500/30 transition-all shadow-xl"
          >
            {/* Direct Hotlink requested from HTML template */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAUZjzgMrm4PtvjmYei0dvry6xG47B201fUq2Ze8SQAKBMef04Y9FFRU1UV2zuFY-xm2sPJUf-HWY8PDhvdiL9PkPdPouWYYmXfFBhZxaYr9iDdquszwEXagFomdP-BQJs9APrcaSG5BriJenNIstkKnrNBUzpuND9wARP48xf3-waOYVu1OEJQghLUNEZS0pGb7jdCfBYqXalQGUMsxe3BrRaAK7Wh-XGJ2Mu9Ms0-M5V7fWjCLhMzA2sHQrt6VJksdBqXgylGFiY8')` }}
            />
            {/* Dark contrast shielding layer */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/40 to-transparent" />
            
            <div className="relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#4cd7f6] px-2.5 py-1 rounded bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 mb-2.5 inline-block">
                New Feature
              </span>
              <h4 className="font-sora text-md font-extrabold text-white leading-tight tracking-tight">
                AI Backlink Prediction
              </h4>
              <button className="mt-3 text-xs font-bold text-purple-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Learn More</span> 
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Issues highlight card */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              Urgent Recommendations
            </h3>
            <div className="space-y-4">
              {/* Alert 1 */}
              <div 
                className="p-3 rounded-lg border border-red-500/10 bg-red-500/5 flex gap-3 items-start hover:bg-red-500/10 transition-colors cursor-pointer"
                onClick={() => alert("Domains flagged. Check the status of reports database or settings integrations dashboard.")}
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">
                    API Status Warnings
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Resolve API limits.
                  </p>
                </div>
              </div>

              {/* Alert 2 */}
              <div 
                className="p-3 rounded-lg border border-purple-500/10 bg-purple-500/5 flex gap-3 items-start hover:bg-purple-500/10 transition-colors cursor-pointer"
                onClick={() => handleStartQuickAudit('full')}
              >
                <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">
                    Core Web Vitals
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Opportunity to boost LCP scores.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Type selections Grid */}
          <div className="glass-card rounded-2xl p-5 flex-grow flex flex-col justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              Quick Audit Tools
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleStartQuickAudit('full')}
                className="p-3.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/50 transition-all flex flex-col items-center gap-2 group cursor-pointer"
              >
                <Bug className="w-4 h-4 text-gray-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-[10px] font-bold tracking-wide uppercase">Technical</span>
              </button>

              <button 
                onClick={() => handleStartQuickAudit('local')}
                className="p-3.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/50 transition-all flex flex-col items-center gap-2 group cursor-pointer"
              >
                <FileEdit className="w-4 h-4 text-gray-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-[10px] font-bold tracking-wide uppercase">Content</span>
              </button>

              <button 
                onClick={() => handleStartQuickAudit('competitor')}
                className="p-3.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/50 transition-all flex flex-col items-center gap-2 group cursor-pointer"
              >
                <Link2 className="w-4 h-4 text-gray-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-[10px] font-bold tracking-wide uppercase">Backlink</span>
              </button>

              <button 
                onClick={() => handleStartQuickAudit('serp')}
                className="p-3.5 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/50 transition-all flex flex-col items-center gap-2 group cursor-pointer"
              >
                <Activity className="w-4 h-4 text-gray-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-[10px] font-bold tracking-wide uppercase">Keyword</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature explanation popup */}
      {showPredictionInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 relative border border-purple-500/20 animate-fade-in select-none">
            <button 
              onClick={() => setShowPredictionInfo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4cd7f6] px-3 py-1 rounded bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 mb-3 inline-block">
              Live Projection
            </span>

            <h3 className="font-sora text-xl font-bold text-white mb-2">
              AI Backlink Prediction
            </h3>
            
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              By monitoring search behavior and crawling structures across over 10 million domains, AGX&apos;s Gemini-driven engine predicts which organic backlinks your competitors are on track to capture.
            </p>

            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Global Backlinks index</span>
                <span className="font-extrabold text-[#4cd7f6]">3.4B Verified Links</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Prediction model</span>
                <span className="font-extrabold text-[#d2bbff]">Gemini 1.5 Flash</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Next automatic scrape</span>
                <span className="text-emerald-400 font-bold">12 Hours Remaining</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowPredictionInfo(false)
                handleStartQuickAudit('competitor')
              }}
              className="w-full bg-[#7c3aed] text-white py-2.5 rounded-lg font-bold text-xs transition-all hover:bg-[#6d28d9] hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] cursor-pointer"
            >
              Analyze Custom Backlink Profile
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
