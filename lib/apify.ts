// lib/apify.ts
// Server-side Apify REST API integration (token never exposed to browser)
import { getSettings } from './store'

const APIFY_BASE = 'https://api.apify.com/v2'

function getToken() {
  return getSettings().apifyToken || process.env.APIFY_API_TOKEN || ''
}

export const ACTORS = {
  crawl:     'apify/website-content-crawler',
  serp:      'apify/google-search-scraper',
  maps:      'compass/google-maps-scraper',
  pagespeed: 'jancurn/analyze-url',
}

interface RunOptions {
  actorId: string
  input: Record<string, unknown>
  timeoutSecs?: number
}

// Start an actor run (async — returns run ID)
export async function startActorRun(opts: RunOptions): Promise<string> {
  const token = getToken()
  const res = await fetch(
    `${APIFY_BASE}/acts/${encodeURIComponent(opts.actorId)}/runs?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...opts.input,
        ...(opts.timeoutSecs ? { timeoutSecs: opts.timeoutSecs } : {}),
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Apify run start failed: ${err}`)
  }
  const data = await res.json()
  return data.data.id as string
}

// Get run status
export async function getRunStatus(runId: string): Promise<{
  status: string
  datasetId?: string
}> {
  const token = getToken()
  const res = await fetch(
    `${APIFY_BASE}/actor-runs/${runId}?token=${token}`
  )
  if (!res.ok) throw new Error(`Failed to get run status`)
  const data = await res.json()
  return {
    status: data.data.status,
    datasetId: data.data.defaultDatasetId,
  }
}

// Get dataset items from a completed run
export async function getDatasetItems(datasetId: string, limit = 100): Promise<unknown[]> {
  const token = getToken()
  const res = await fetch(
    `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&limit=${limit}&clean=true`
  )
  if (!res.ok) throw new Error(`Failed to get dataset items`)
  return res.json()
}


// Run actor synchronously and return items (for fast actors like SERP)
export async function runActorSync(opts: RunOptions): Promise<unknown[]> {
  const runId = await startActorRun(opts)
  // Poll every 3s for up to 3 minutes
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const { status, datasetId } = await getRunStatus(runId)
    if (status === 'SUCCEEDED' && datasetId) {
      return getDatasetItems(datasetId)
    }
    if (status === 'FAILED' || status === 'ABORTED') {
      throw new Error(`Actor run ${status}`)
    }
  }
  throw new Error('Actor run timed out')
}

// ── Preset inputs for each audit type ────────────────────────────────────

export function getCrawlInput(url: string, maxPages = 30) {
  return {
    startUrls: [{ url }],
    maxCrawlPages: maxPages,
    crawlerType: 'playwright:firefox',
    maxCrawlDepth: 3,
    htmlTransformer: 'readableText',
    saveHtml: false,
    saveMarkdown: true,
  }
}

export function getSerpInput(keyword: string, countryCode = 'in') {
  return {
    queries: keyword,
    resultsPerPage: 10,
    maxPagesPerQuery: 1,
    languageCode: 'en',
    countryCode,
    saveHtml: false,
  }
}

export function getMapsInput(keyword: string, location: string, maxPlaces = 20) {
  return {
    searchStringsArray: [`${keyword} ${location}`],
    maxCrawledPlacesPerSearch: maxPlaces,
    language: 'en',
    maxImages: 0,
    includeOpeningHours: true,
    maxReviews: 0,
  }
}

export function getPagespeedInput(url: string) {
  return { url, strategy: 'MOBILE' }
}
