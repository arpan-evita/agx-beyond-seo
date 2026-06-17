// app/api/audit/start/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createReport } from '@/lib/store'
import {
  startActorRun,
  ACTORS,
  getCrawlInput,
  getSerpInput,
  getMapsInput,
  getPagespeedInput,
} from '@/lib/apify'
import type { AuditType } from '@/lib/types'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { url, auditType, keyword, location, prompt, competitors } = body as {
    url: string
    auditType: AuditType
    keyword?: string
    location?: string
    prompt?: string
    competitors?: string | string[]
  }

  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  // Parse competitors into string[]
  let parsedCompetitors: string[] | undefined
  if (Array.isArray(competitors)) {
    parsedCompetitors = competitors
  } else if (typeof competitors === 'string' && competitors.trim()) {
    parsedCompetitors = competitors.split(',').map(c => c.trim()).filter(Boolean)
  }

  // Create report record
  const report = createReport({
    url,
    auditType,
    keyword,
    location,
    prompt,
    competitors: parsedCompetitors,
    status: 'running',
    createdBy: (session.user as { id?: string }).id || session.user.email,
    createdByName: session.user.name || session.user.email,
  })

  // Fire off Apify actor(s) in background
  try {
    let runId: string | undefined

    if (auditType === 'full' || auditType === 'local') {
      runId = await startActorRun({
        actorId: ACTORS.crawl,
        input: getCrawlInput(url, 30),
      })
    } else if (auditType === 'serp' && keyword) {
      runId = await startActorRun({
        actorId: ACTORS.serp,
        input: getSerpInput(keyword),
      })
    } else if (auditType === 'maps' && keyword && location) {
      runId = await startActorRun({
        actorId: ACTORS.maps,
        input: getMapsInput(keyword, location),
      })
    } else if (auditType === 'pagespeed') {
      runId = await startActorRun({
        actorId: ACTORS.pagespeed,
        input: getPagespeedInput(url),
      })
    }

    // Update report with run ID
    const { updateReport } = await import('@/lib/store')
    if (runId) {
      updateReport(report.id, { apifyRunId: runId })
    }
  } catch (err) {
    const { updateReport } = await import('@/lib/store')
    updateReport(report.id, { status: 'failed' })
    console.error('Apify start error:', err)
  }

  return NextResponse.json({ reportId: report.id })
}
