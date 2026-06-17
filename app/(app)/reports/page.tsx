// app/(app)/reports/page.tsx
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Globe, 
  Search, 
  Download, 
  Trash2,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react'
import type { AuditReport } from '@/lib/types'

const AUDIT_LABELS: Record<string, string> = {
  full: 'Full SEO Audit', local: 'Local SEO',
  serp: 'SERP Analysis', competitor: 'Competitor Gap',
  pagespeed: 'PageSpeed', maps: 'Google Maps',
}

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<AuditReport[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(data => {
        setReports(data)
        setLoading(false)
      })
  }, [])

  const triggerNotify = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  const filtered = reports.filter(r =>
    r.url.toLowerCase().includes(search.toLowerCase()) ||
    (r.keyword || '').toLowerCase().includes(search.toLowerCase()) ||
    r.auditType.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string, url: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Revoke and delete report logs for ${url}?`)) return
    
    try {
      const res = await fetch('/api/reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id))
        triggerNotify(`Report for ${url} deleted successfully.`)
      }
    } catch {
      alert('Failed to delete report.')
    }
  }

  const handleExportCSV = () => {
    if (reports.length === 0) {
      alert("Archive database currently contains no matching crawled reports to export.")
      return
    }

    const headers = ["ID", "Target Domain", "Crawl Type", "Date Audited", "Score", "Status", "Keyword", "Location"]
    const rows = reports.map(r => [
      r.id,
      r.url,
      AUDIT_LABELS[r.auditType] || r.auditType,
      new Date(r.createdAt).toLocaleDateString(),
      r.seoScore ?? 'N/A',
      r.status,
      r.keyword || '',
      r.location || ''
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `agx_beyond_seo_history_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerNotify("Historical archives exported successfully.")
  }

  return (
    <div className="pt-24 px-8 pb-12 w-full max-w-7xl mx-auto font-geist animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 select-none">
        <div>
          <h2 className="font-sora text-3xl font-bold tracking-tight text-white">
            Audit Reports Archive
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Review your historical audit data and manage past crawl performance sheets.
          </p>
        </div>

        <Link 
          href="/audit/new"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#03b5d3] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Audit</span>
        </Link>
      </div>

      {/* Notifications banner */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-[0_0_15px_rgba(78,222,163,0.1)] select-none">
          <span>✓ {successMsg}</span>
        </div>
      )}

      {/* Table Card container */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        
        {/* Table Control Header */}
        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-3">
            <span className="font-sora text-lg font-bold text-white">Past Reports</span>
            <span className="bg-purple-500/10 text-purple-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-500/20 tracking-wider">
              {filtered.length} TOTAL
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter domains/keywords..."
                className="bg-black/20 border border-white/10 text-[11px] rounded-lg pl-8 pr-3 py-1.5 focus:border-purple-500 w-full sm:w-48 focus:outline-none placeholder:text-gray-600 text-white"
              />
            </div>

            {/* CSV Exporter */}
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white hover:text-purple-300 border border-white/5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Area */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm">Loading historical reports...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01] select-none border-b border-white/5">
                  <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">Target Domain</th>
                  <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">Date Audited</th>
                  <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">SEO Score</th>
                  <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">Crawl Type</th>
                  <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-wide text-gray-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No matching historical logs found in archives.
                    </td>
                  </tr>
                ) : (
                  filtered.map((audit) => {
                    const score = audit.seoScore ?? 70
                    const isOptimal = score >= 70
                    const isImproved = score >= 50

                    return (
                      <tr 
                        key={audit.id} 
                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => router.push(`/audit/${audit.id}`)}
                      >
                        {/* Domain Target */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              audit.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              isOptimal ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              'bg-purple-500/10 text-purple-300 border-purple-500/20'
                            }`}>
                              <Globe className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                                {audit.url}
                              </span>
                              {audit.keyword && (
                                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Keyword: {audit.keyword}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Timing */}
                        <td className="px-6 py-4.5 text-gray-400">
                          {new Date(audit.createdAt).toLocaleDateString()} · {new Date(audit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        {/* SEO bar */}
                        <td className="px-6 py-4.5">
                          {audit.status === 'completed' ? (
                            <div className="flex items-center gap-3 select-none">
                              <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                <div 
                                  className={`h-full ${
                                    isOptimal ? 'bg-emerald-400' :
                                    isImproved ? 'bg-purple-400' :
                                    'bg-red-400'
                                  }`} 
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                              <span className={`text-[12px] font-bold ${
                                isOptimal ? 'text-emerald-400' :
                                isImproved ? 'text-purple-300' :
                                'text-red-400'
                              }`}>{score}</span>
                            </div>
                          ) : <span className="text-gray-600">—</span>}
                        </td>

                        {/* Crawl type */}
                        <td className="px-6 py-4.5 text-gray-300">
                          {AUDIT_LABELS[audit.auditType] || audit.auditType}
                        </td>

                        {/* Status Label */}
                        <td className="px-6 py-4.5 select-none">
                          <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border ${
                            audit.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            audit.status === 'running' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              audit.status === 'completed' ? 'bg-emerald-400' :
                              audit.status === 'running' ? 'bg-purple-400' :
                              'bg-red-400'
                            }`} />
                            <span>{audit.status}</span>
                          </span>
                        </td>

                        {/* Action details */}
                        <td className="px-6 py-4.5 text-right select-none">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-purple-300 hover:text-white text-[10px] uppercase tracking-wider font-extrabold transition-all hover:underline">
                              View Report
                            </span>
                            <button
                              onClick={(e) => handleDelete(audit.id, audit.url, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-white/5"
                              title="Delete Report"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}

              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
