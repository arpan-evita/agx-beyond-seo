// app/(app)/audit/new/page.tsx
'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Globe, 
  Search, 
  Sparkles,
  Database,
  ArrowRight,
  TrendingUp,
  LineChart,
  Zap,
  Loader2,
  X,
  Keyboard
} from 'lucide-react'

const AUDIT_TYPES = [
  { id: 'full',       label: 'Full SEO Audit',   desc: 'Complete crawl and AI insights', color: '#7c3aed' },
  { id: 'local',      label: 'Local SEO',         desc: 'Google Business Profile citation checks', color: '#06b6d4' },
  { id: 'serp',       label: 'SERP Analysis',     desc: 'Keyword rank position tracking', color: '#10b981' },
  { id: 'pagespeed',  label: 'PageSpeed',          desc: 'Core Web Vitals latency values', color: '#ec4899' },
  { id: 'competitor', label: 'Competitor Gap',     desc: 'Organic search comparison logs', color: '#8b5cf6' },
]

const PRESETS = [
  {
    id: 'leads',
    title: '50 Leads/Month Local Audit',
    desc: 'Evaluate conversion triggers and lead capture gaps.',
    template: `You are Antigravity, an expert SEO consultant. Analyze the following crawl details of the website: {URL}.
The user targets the location: {LOCATION} with primary keyword: "{KEYWORD}".
The business goal is to achieve 50 qualified leads/month from local SEO.

Here is the crawl data of the website's pages (up to 30 pages):
{CRAWL_DATA}

Identify the top 10 SEO issues. They must address:
1. Technical & on-page errors found in the crawl data (e.g. status codes, missing titles, empty H1s, canonical URL mismatches).
2. Location & local-specific optimization gaps (e.g. missing location landing pages for "{LOCATION}", missing LocalBusiness schema, missing WhatsApp CTA which is critical for conversion in Indian contexts since the target is in India).

Generate the SEO score (0-100), an Executive Summary explaining where the 50 leads will come from and what the main gaps are, and a 30/60/90-day action plan.

Respond strictly with JSON matching the required schema.`
  },
  {
    id: 'competitor',
    title: 'Competitor Gap Analysis',
    desc: 'Map keywords and backlinks against direct competitors.',
    template: `You are Antigravity, an expert SEO consultant. Analyze the crawl details of the website: {URL} and compare it against competitors: {COMPETITORS}.
The target keyword is: "{KEYWORD}" in {LOCATION}.
The business goal is to rank higher than these competitors and capture local search traffic.

Here is the crawl data of the website's pages (up to 30 pages):
{CRAWL_DATA}

Identify the top 10 SEO issues. They must address:
1. Technical & on-page errors found in the crawl data (e.g. status codes, missing titles, empty H1s, canonical URL mismatches).
2. Direct comparison gaps against {COMPETITORS} (e.g. key missing topics, thin service descriptions, and formatting differences).
3. Local optimization recommendations for {LOCATION}.

Generate the SEO score (0-100), an Executive Summary comparing our strengths vs the competitors, and a 30/60/90-day action plan.

Respond strictly with JSON matching the required schema.`
  },
  {
    id: 'local_growth',
    title: 'Local Practice Growth Plan',
    desc: 'Roadmap tailored specifically for service practices and clinics.',
    template: `You are Antigravity, an expert local service SEO consultant. Analyze the crawl details of the service website: {URL}.
The target location is: {LOCATION} and primary keyword targets are: "{KEYWORD}".
The goal is to design a high-converting local growth roadmap.

Here is the crawl data of the website's pages (up to 30 pages):
{CRAWL_DATA}

Identify the top 10 SEO issues. They must address:
1. Technical & on-page errors found in the crawl data (e.g. status codes, missing titles, empty H1s, canonical URL mismatches).
2. Local practice optimizations (e.g. Dentist, Chiropractor, or ProfessionalService schema, GBP details, patient review velocity, phone/WhatsApp CTA setup).
3. Geotargeted landing pages for NCR / {LOCATION} sectors.

Generate the SEO score (0-100), an Executive Summary showing the local practice action plan, and a 30/60/90-day roadmap.

Respond strictly with JSON matching the required schema.`
  }
]

function NewAuditForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [auditType, setAuditType] = useState(searchParams.get('type') || 'full')
  const [url, setUrl] = useState(searchParams.get('url') || '')
  const [keyword, setKeyword] = useState('CA firm Gurgaon')
  const [location, setLocation] = useState('Gurgaon, India')
  const [competitors, setCompetitors] = useState('gvcindia.com, taxsgurgaon.com')
  
  const [selectedPreset, setSelectedPreset] = useState('leads')
  const [promptTemplate, setPromptTemplate] = useState(PRESETS[0].template)
  const [promptPreview, setPromptPreview] = useState('')
  const [isPromptDirty, setIsPromptDirty] = useState(false)
  const [showPromptConfig, setShowPromptConfig] = useState(true)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sync parameters with quick search params
  useEffect(() => {
    const prefillUrl = searchParams.get('url')
    if (prefillUrl) {
      setUrl(prefillUrl)
    }
  }, [searchParams])

  // Sync prompts whenever templates or inputs change (only if prompt is not dirty)
  useEffect(() => {
    if (!isPromptDirty) {
      const compiled = promptTemplate
        .replace(/{URL}/g, url || '[Website URL]')
        .replace(/{KEYWORD}/g, keyword || '[Target Keyword]')
        .replace(/{LOCATION}/g, location || '[Location]')
        .replace(/{COMPETITORS}/g, competitors || '[Competitors]')
      setPromptPreview(compiled)
    }
  }, [url, keyword, location, competitors, promptTemplate, isPromptDirty])

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId)
    if (preset) {
      setSelectedPreset(presetId)
      setPromptTemplate(preset.template)
      setIsPromptDirty(false)
    }
  }

  const handlePromptChange = (val: string) => {
    setPromptPreview(val)
    setIsPromptDirty(true)
  }

  const calculateProgress = () => {
    let progress = 25
    if (url.trim()) progress += 25
    if (keyword.trim()) progress += 25
    if (competitors.trim()) progress += 25
    return progress
  }

  // Live tokenizer highlighting tags dynamically
  const renderHighlightedPrompt = () => {
    const actualUrl = url.trim() || "[Website URL]"
    const actualKeyword = keyword.trim() || "[Target Keyword]"
    const actualLocation = location.trim() || "[Location]"
    const actualCompetitors = competitors.trim() || "[Competitors]"

    let text = promptPreview
    if (!text) return null

    // Helper tokenizers
    let highlightedText = text
      .replace(/{URL}/g, `__URL__${actualUrl}__URL__`)
      .replace(/{KEYWORD}/g, `__KEYWORD__${actualKeyword}__KEYWORD__`)
      .replace(/{LOCATION}/g, `__LOCATION__${actualLocation}__LOCATION__`)
      .replace(/{COMPETITORS}/g, `__COMPETITORS__${actualCompetitors}__COMPETITORS__`)

    const parts = highlightedText.split(/(__URL__|__KEYWORD__|__LOCATION__|__COMPETITORS__)/)
    
    let currentMarker = ''
    return parts.map((part, idx) => {
      if (part === '__URL__' || part === '__KEYWORD__' || part === '__LOCATION__' || part === '__COMPETITORS__') {
        currentMarker = part
        return null
      }
      if (currentMarker) {
        currentMarker = ''
        return (
          <span key={idx} className="text-[#4cd7f6] font-extrabold drop-shadow-[0_0_8px_rgba(76,215,246,0.4)]">
            {part}
          </span>
        )
      }
      return <span key={idx}>{part}</span>
    }).filter(Boolean)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) {
      setError('Target URL is required')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          auditType,
          keyword,
          location,
          competitors,
          prompt: promptPreview
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start audit')
      router.push(`/audit/${data.reportId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 px-8 pb-12 w-full max-w-7xl mx-auto font-geist animate-fade-in">
      {/* Header */}
      <div className="mb-8 select-none">
        <h2 className="font-sora text-3xl font-extrabold tracking-tight text-white">
          Audit Prompt Composer
        </h2>
        <p className="text-gray-400 text-sm mt-2 font-medium">
          Configure crawlers, edit customized presets, and view live intelligence templates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & parameters */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Audit Type selections */}
          <div className="glass-card p-6 border border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 select-none">
              1. Choose Discipline
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 select-none">
              {AUDIT_TYPES.map(t => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setAuditType(t.id)}
                  className={`p-3 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    auditType === t.id
                      ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-white'
                      : 'border-white/5 bg-white/3 hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-sm font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target inputs card */}
          <div className="glass-card p-6 md:p-8 border border-white/5 shadow-xl">
            <h3 className="font-sora text-lg font-extrabold text-purple-300 mb-6 flex items-center gap-2 select-none">
              <Database className="w-5 h-5 text-purple-400" />
              <span>Core Parameters</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-wider text-gray-400 font-bold mb-2 uppercase select-none">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-wider text-gray-400 font-bold mb-2 uppercase select-none">
                    Target Keyword
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="SaaS SEO Audit"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-wider text-gray-400 font-bold mb-2 uppercase select-none">
                    Target Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Gurgaon, India"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-wider text-gray-400 font-bold mb-2 uppercase select-none">
                  Competitors (comma separated)
                </label>
                <input
                  type="text"
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  placeholder="competitor1.com, competitor2.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* AI Preset Cards */}
          {(auditType === 'full' || auditType === 'local' || auditType === 'competitor') && (
            <div className="select-none">
              <h3 className="text-[10px] tracking-widest text-gray-400 font-bold uppercase mb-4 font-geist">
                Available Prompts Presets
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PRESETS.map((preset) => {
                  const Icon = preset.id === 'leads' ? TrendingUp : preset.id === 'competitor' ? LineChart : Zap
                  const isChosen = selectedPreset === preset.id

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`glass-card p-5 rounded-2xl text-left hover:scale-[1.02] hover:bg-white/[0.06] transition-all group border-l-[4px] cursor-pointer flex flex-col justify-between h-40 ${
                        isChosen
                          ? 'border-l-purple-500 bg-purple-500/5'
                          : 'border-l-purple-500/40 hover:border-l-purple-500 border border-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <Icon className="w-5 h-5 text-purple-400" />
                        <Sparkles className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white mb-1 font-sora truncate w-full">
                          {preset.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          {preset.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live preview & composition */}
        <div className="lg:col-span-5">
          <div className="glass-card flex flex-col rounded-2xl overflow-hidden h-full min-h-[520px] shadow-2xl border border-white/5">
            
            {/* Live preview header */}
            <div className="bg-white/5 px-6 py-4.5 border-b border-white/5 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 glow-cyan animate-pulse shrink-0"></span>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  LIVE COMPILER VIEW
                </span>
              </div>
              
              <div className="flex gap-2">
                {isPromptDirty && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPromptDirty(false)
                      handleSelectPreset(selectedPreset)
                    }}
                    className="bg-yellow-500/10 hover:bg-yellow-500/20 px-2 py-0.5 rounded text-[9px] font-extrabold text-yellow-400 uppercase border border-yellow-500/20 transition-all"
                  >
                    Reset
                  </button>
                )}
                <span className="bg-white/10 px-2 py-0.5 rounded text-[9px] font-extrabold text-gray-400 uppercase">
                  {isPromptDirty ? '✏️ CUSTOM' : '⚡ AUTO'}
                </span>
              </div>
            </div>

            {/* Content view text editor */}
            <div className="flex-grow p-6 relative font-mono text-xs text-gray-300 leading-relaxed overflow-y-auto select-text min-h-[300px]">
              {showPromptConfig ? (
                <textarea
                  value={promptPreview}
                  onChange={e => handlePromptChange(e.target.value)}
                  rows={14}
                  className="w-full h-full bg-transparent border-none outline-none resize-none focus:ring-0 text-gray-300 font-mono leading-relaxed"
                />
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {renderHighlightedPrompt()}
                </div>
              )}
            </div>

            {/* Toggle Editor link */}
            <div className="px-6 py-2 border-t border-white/5 flex justify-end select-none">
              <button
                type="button"
                onClick={() => setShowPromptConfig(!showPromptConfig)}
                className="text-[10px] font-bold uppercase tracking-wider text-purple-300 hover:underline cursor-pointer"
              >
                {showPromptConfig ? 'Switch to Highlighted Preview' : 'Switch to Prompt Text Editor'}
              </button>
            </div>

            {/* Submit execution block */}
            <div className="p-6 bg-gradient-to-t from-black/40 to-transparent border-t border-white/5">
              <div className="flex items-center justify-between mb-4 gap-4 select-none">
                <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(124,58,237,0.5)] transition-all duration-700 ease-in-out" 
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest shrink-0">
                  Ready
                </span>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl text-xs badge-critical text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#7c3aed] to-[#03b5d3] hover:from-[#6d28d9] hover:to-[#02a1bd] hover:scale-[1.01] text-white font-extrabold rounded-xl shadow-xl hover:shadow-[#7c3aed]/10 transition-all flex items-center justify-center gap-2 group cursor-pointer text-xs uppercase tracking-widest"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Crawl Engine Launching...</span>
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white group-hover:rotate-12 transition-transform shrink-0" />
                    <span>RUN SEO AUDIT ENGINE</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </form>

      {/* Atmospheric neural network status */}
      <div className="mt-12 relative h-24 rounded-2xl overflow-hidden bg-white/[0.01] border border-white/5 flex items-center justify-center px-6 text-center select-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] to-transparent pointer-events-none" />
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">
          AGX Neural Network processing active • 12ms Latency
        </p>
      </div>

    </div>
  )
}

export default function NewAuditPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading editor...</div>}>
      <NewAuditForm />
    </Suspense>
  )
}
