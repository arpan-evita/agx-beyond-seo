// lib/types.ts
export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'member'
  createdAt: string
  lastLogin?: string
}

export interface AuditReport {
  id: string
  url: string
  auditType: AuditType
  keyword?: string
  location?: string
  prompt?: string
  competitors?: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  createdBy: string
  createdByName: string
  apifyRunId?: string
  results?: AuditResults
  seoScore?: number
}

export type AuditType =
  | 'full'
  | 'local'
  | 'serp'
  | 'competitor'
  | 'pagespeed'
  | 'maps'

export interface AuditResults {
  crawl?: CrawlResult[]
  serp?: SerpResult[]
  maps?: MapsResult[]
  pagespeed?: PagespeedResult
  issues?: SEOIssue[]
  summary?: AuditSummary
  thirtyDayPlan?: string[]
  sixtyDayPlan?: string[]
  ninetyDayPlan?: string[]
  categoryScores?: {
    category: string
    score: string
    status: string
    statusType: 'success' | 'warning' | 'error' | 'info'
    error?: string
    fix?: string
  }[]
  growthModel?: {
    targetLeads: number
    requiredTraffic: string
    conversionRate: string
    sources: {
      source: string
      leads: string
      action: string
    }[]
  }
  dentalClinicPlan?: {
    title: string
    note: string
    gbp: {
      categories: {
        primary: string
        secondary: string[]
      }
      details: string[]
      content: string[]
      posts: string[]
      qna: { q: string; a: string }[]
    }
    reviews: {
      target: string
      steps: string[]
      keywords: string[]
    }
    citations: { platform: string; action: string }[]
    landingPages: { path: string; keyword: string; priority: string }[]
  }
}

export interface CrawlResult {
  url: string
  title?: string
  h1?: string
  metaDescription?: string
  wordCount?: number
  statusCode?: number
  canonical?: string
  indexable?: boolean
  internalLinks?: number
}

export interface SerpResult {
  position: number
  title: string
  url: string
  description?: string
  domain?: string
}

export interface MapsResult {
  name: string
  rating?: number
  reviewCount?: number
  address?: string
  phone?: string
  website?: string
  categories?: string[]
  position?: number
}

export interface PagespeedResult {
  performanceScore?: number
  accessibilityScore?: number
  bestPracticesScore?: number
  seoScore?: number
  lcp?: string
  cls?: string
  tbt?: string
  fcp?: string
}

export interface SEOIssue {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  impact: string
  fix: string
  effort: 'low' | 'medium' | 'high'
  affectedUrls?: string[]
}

export interface AuditSummary {
  totalPages?: number
  indexablePages?: number
  issuesCount?: {
    critical: number
    high: number
    medium: number
    low: number
  }
  topIssues?: string[]
  healthScore?: number
  executiveSummary?: string
}
