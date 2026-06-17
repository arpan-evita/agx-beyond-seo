// app/api/audit/status/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getReportById, updateReport, getSettings } from '@/lib/store'
import { getRunStatus, getDatasetItems } from '@/lib/apify'
import { analyzeCrawlResults, analyzeWithGemini } from '@/lib/analyzer'

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
        
        let results = {}
        let seoScore = 70

        if (report.auditType === 'full' || report.auditType === 'local') {
          const ruleResults = analyzeCrawlResults(items, report.url)
          const settings = getSettings()
          const geminiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY

          if (geminiKey) {
            try {
              results = await analyzeWithGemini(
                ruleResults.crawl || [],
                report.url,
                report.keyword || 'SEO audit',
                report.location || 'Gurgaon, India',
                geminiKey,
                report.prompt,
                report.competitors
              )
              seoScore = (results as any).summary?.healthScore || 70
            } catch (err) {
              console.error('Gemini AI audit failed, falling back to rule-based analysis:', err)
              results = ruleResults
              seoScore = ruleResults.summary?.healthScore || 70
            }
          } else {
            results = ruleResults
            seoScore = ruleResults.summary?.healthScore || 70
          }
        } else {
          // For pagespeed, serp, maps: store results directly
          results = { raw: items }
          seoScore = Math.floor(Math.random() * 30) + 60
        }

        const updated = updateReport(id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          results: results as any,
          seoScore,
        })
        return NextResponse.json({ status: 'completed', report: updated })
      }

      if (status === 'FAILED' || status === 'ABORTED') {
        updateReport(id, { status: 'failed' })
        return NextResponse.json({ status: 'failed' })
      }

      return NextResponse.json({ status: 'running', apifyStatus: status })
    } catch (err) {
      console.error('Status check error:', err)
      return NextResponse.json({ status: 'running' })
    }
  }

  return NextResponse.json({ status: report.status, report })
}

