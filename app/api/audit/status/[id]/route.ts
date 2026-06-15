// app/api/audit/status/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getReportById, updateReport } from '@/lib/store'
import { getRunStatus, getDatasetItems } from '@/lib/apify'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const report = getReportById(id)
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // If already completed/failed, return current status
  if (report.status === 'completed' || report.status === 'failed') {
    return NextResponse.json({ status: report.status, report })
  }

  // Check Apify run status
  if (report.apifyRunId) {
    try {
      const { status, datasetId } = await getRunStatus(report.apifyRunId)

      if (status === 'SUCCEEDED' && datasetId) {
        const items = await getDatasetItems(datasetId, 100)
        const updated = updateReport(id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          results: { crawl: items as never },
          seoScore: Math.floor(Math.random() * 30) + 50, // Will be replaced by real scoring
        })
        return NextResponse.json({ status: 'completed', report: updated })
      }

      if (status === 'FAILED' || status === 'ABORTED') {
        updateReport(id, { status: 'failed' })
        return NextResponse.json({ status: 'failed' })
      }

      return NextResponse.json({ status: 'running', apifyStatus: status })
    } catch {
      return NextResponse.json({ status: 'running' })
    }
  }

  return NextResponse.json({ status: report.status, report })
}
