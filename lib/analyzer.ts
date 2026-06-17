// lib/analyzer.ts
import type { CrawlResult, SEOIssue, AuditResults, AuditSummary } from './types'

export function analyzeCrawlResults(rawItems: any[], targetUrl: string): AuditResults {
  const crawl: CrawlResult[] = rawItems.map(item => {
    // Apify content crawler maps metadata inside metadata object or top level
    const url = item.url || item.crawl?.loadedUrl || ''
    const title = item.metadata?.title || item.title || ''
    const metaDescription = item.metadata?.description || item.description || ''
    const h1 = item.metadata?.h1 || item.h1 || ''
    const canonical = item.metadata?.canonicalUrl || item.canonical || ''
    const statusCode = item.crawl?.statusCode || item.statusCode || 200
    
    // Estimate word count from text if not provided
    let wordCount = item.wordCount
    if (!wordCount && item.text) {
      wordCount = item.text.split(/\s+/).filter(Boolean).length
    } else if (!wordCount) {
      wordCount = 0
    }

    return {
      url,
      title: title.trim(),
      h1: h1.trim(),
      metaDescription: metaDescription.trim(),
      wordCount,
      statusCode,
      canonical,
      indexable: statusCode === 200 && !url.includes('/wp-admin/') && !url.includes('/wp-content/'),
      internalLinks: typeof item.internalLinks === 'number' ? item.internalLinks : 0,
    }
  })

  // Start finding issues
  const issues: SEOIssue[] = []
  
  // 1. LocalBusiness Schema
  const hasSchema = rawItems.some(item => {
    const text = (item.text || '').toLowerCase()
    const html = (item.html || '').toLowerCase()
    return text.includes('ld+json') || text.includes('schema.org') || html.includes('localbusiness')
  })
  
  if (!hasSchema) {
    issues.push({
      id: 'missing-local-schema',
      title: 'Missing LocalBusiness JSON-LD Schema',
      description: 'Search engines use structured data to understand your business type, operating hours, address, and logo.',
      severity: 'critical',
      impact: 'Prevents the site from appearing in Google Local 3-Pack rich snippets and Knowledge Graph.',
      fix: 'Generate and inject a LocalBusiness schema JSON-LD snippet on the homepage header.',
      effort: 'low',
    })
  }

  // 2. Robots.txt or Sitemap check
  const robotsTxtPage = crawl.find(p => p.url.endsWith('/robots.txt'))
  if (!robotsTxtPage) {
    issues.push({
      id: 'missing-robots-txt',
      title: 'Missing robots.txt or Sitemap declaration',
      description: 'A robots.txt file guides search bots on how to crawl your site pages.',
      severity: 'critical',
      impact: 'Search crawlers can index temporary pages or waste crawl budget.',
      fix: 'Create a robots.txt file and reference your main sitemap XML URL inside it.',
      effort: 'low',
    })
  }

  // 3. WhatsApp and Indian conversion elements (India-specific best practice)
  const hasWhatsApp = rawItems.some(item => {
    const text = (item.text || '').toLowerCase()
    const html = (item.html || '').toLowerCase()
    return text.includes('whatsapp') || html.includes('wa.me') || html.includes('api.whatsapp.com')
  })

  if (!hasWhatsApp) {
    issues.push({
      id: 'missing-whatsapp-cta',
      title: 'No Floating WhatsApp CTA Button',
      description: 'WhatsApp is India\'s primary communication tool. Local service sites see up to a 60% boost in lead conversion with a floating chat button.',
      severity: 'high',
      impact: 'Higher bounce rates and lower inquiry-to-visit conversion rates.',
      fix: 'Embed a floating WhatsApp CTA icon linking directly to the clinic\'s chat line.',
      effort: 'low',
    })
  }

  // 4. City-specific Service Pages (Gurgaon/NCR Optimization)
  const servicePages = crawl.filter(p => p.url.toLowerCase().includes('/service/') || p.url.toLowerCase().includes('/services/'))
  const hasCityPages = crawl.some(p => p.url.toLowerCase().includes('gurgaon') || p.url.toLowerCase().includes('delhi'))
  
  if (servicePages.length > 0 && !hasCityPages) {
    issues.push({
      id: 'missing-city-pages',
      title: 'No City-Specific Service Landing Pages',
      description: 'You are targeting local search traffic in Gurgaon but lack dedicated service+city landing pages (e.g. "/root-canal-treatment-gurgaon").',
      severity: 'high',
      impact: 'Missing high-intent search queries where users search for "dentist near me" or "dentist in Gurgaon".',
      fix: 'Create optimized sub-pages for top services tailored to local areas (e.g., DLF Phase 3, Sector 56).',
      effort: 'medium',
    })
  }

  // 5. Missing Title Tags
  const missingTitles = crawl.filter(p => p.indexable && !p.title)
  if (missingTitles.length > 0) {
    issues.push({
      id: 'missing-title',
      title: `Missing Title Tags on ${missingTitles.length} page(s)`,
      description: 'Title tags are the single most important on-page SEO factor.',
      severity: 'critical',
      impact: 'Pages will not rank correctly and will display poorly in SERP results.',
      fix: `Add descriptive title tags (under 60 characters) to: ${missingTitles.slice(0, 3).map(p => p.url).join(', ')}.`,
      effort: 'low',
    })
  }

  // 6. Missing Meta Descriptions
  const missingDesc = crawl.filter(p => p.indexable && !p.metaDescription)
  if (missingDesc.length > 0) {
    issues.push({
      id: 'missing-description',
      title: `Missing Meta Descriptions on ${missingDesc.length} page(s)`,
      description: 'Meta descriptions influence user click-through rates from search results.',
      severity: 'high',
      impact: 'Google will auto-generate descriptions, often leading to poor click-through rates.',
      fix: `Draft custom meta descriptions (120-160 characters) for: ${missingDesc.slice(0, 3).map(p => p.url).join(', ')}.`,
      effort: 'low',
    })
  }

  // 7. Missing H1 Tags
  const missingH1 = crawl.filter(p => p.indexable && !p.h1)
  if (missingH1.length > 0) {
    issues.push({
      id: 'missing-h1',
      title: `Missing H1 Header on ${missingH1.length} page(s)`,
      description: 'Each indexable page should have exactly one H1 tag identifying the page topic.',
      severity: 'medium',
      impact: 'Weakens page relevance score for main keyword concepts.',
      fix: `Inject appropriate <h1> tags at the top of content for: ${missingH1.slice(0, 3).map(p => p.url).join(', ')}.`,
      effort: 'low',
    })
  }

  // 8. Thin Content Pages
  const thinPages = crawl.filter(p => p.indexable && p.wordCount && p.wordCount < 400 && !p.url.includes('/contact'))
  if (thinPages.length > 0) {
    issues.push({
      id: 'thin-content',
      title: `${thinPages.length} Thin Content Pages (< 400 words)`,
      description: 'Search engines prefer comprehensive, helpful content.',
      severity: 'medium',
      impact: 'Poor rankings due to weak information depth and low E-E-A-T scores.',
      fix: `Expand service description content to at least 800+ words with structured local FAQs.`,
      effort: 'medium',
    })
  }

  // 9. Demo or boilerplate pages indexed
  const demoPages = crawl.filter(p => p.url.includes('demo') || p.url.includes('test') || p.url.includes('temp'))
  if (demoPages.length > 0) {
    issues.push({
      id: 'demo-pages-indexed',
      title: `Boilerplate or Demo Pages Indexed (${demoPages.length})`,
      description: 'Draft or placeholder directories are being crawled and indexed.',
      severity: 'high',
      impact: 'Dilutes your crawl budget and domain authority score with low-value pages.',
      fix: 'Apply "noindex" robots tag or delete the demo folders entirely.',
      effort: 'low',
    })
  }

  // 10. Canonical mismatch
  const canonicalMismatch = crawl.filter(p => p.indexable && p.canonical && p.canonical !== p.url)
  if (canonicalMismatch.length > 0) {
    issues.push({
      id: 'canonical-mismatch',
      title: `Canonical URL mismatches on ${canonicalMismatch.length} page(s)`,
      description: 'Canonical tag specifies the preferred version of a web page.',
      severity: 'medium',
      impact: 'Causes indexing issues and duplicate content warnings.',
      fix: 'Ensure canonical tags point exactly to the self URL unless referencing a duplicate page.',
      effort: 'medium',
    })
  }

  // Calculate SEO score
  // Critical issues: -15, High: -10, Medium: -5, Low: -2
  let scorePenalty = 0
  issues.forEach(iss => {
    if (iss.severity === 'critical') scorePenalty += 15
    else if (iss.severity === 'high') scorePenalty += 10
    else if (iss.severity === 'medium') scorePenalty += 5
    else scorePenalty += 2
  })

  const seoScore = Math.max(35, Math.min(100, 100 - scorePenalty))

  // Group issues count
  const issuesCount = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  }

  const summary: AuditSummary = {
    totalPages: crawl.length,
    indexablePages: crawl.filter(p => p.indexable).length,
    issuesCount,
    topIssues: issues.slice(0, 3).map(i => i.title),
    healthScore: seoScore,
  }

  return {
    crawl,
    issues,
    summary,
  }
}

export async function analyzeWithGemini(
  crawl: CrawlResult[],
  url: string,
  keyword: string,
  location: string,
  apiKey: string,
  customPrompt?: string,
  competitors?: string[]
): Promise<AuditResults> {
  const defaultPrompt = `You are Antigravity, an expert SEO consultant. Analyze the following crawl details of the website: {URL}.
The user targets the location: {LOCATION} with primary keyword: "{KEYWORD}".
The business goal is to achieve 50 qualified leads/month from local SEO.

Here is the crawl data of the website's pages (up to 30 pages):
{CRAWL_DATA}

Identify the top 10 SEO issues. They must address:
1. Technical & on-page errors found in the crawl data (e.g. status codes, missing titles, empty H1s, canonical URL mismatches).
2. Location & local-specific optimization gaps (e.g. missing location landing pages for "{LOCATION}", missing LocalBusiness / Dentist schema, missing WhatsApp CTA which is critical for conversion in Indian contexts since the target is in India).

Generate the SEO score (0-100), an Executive Summary explaining where the 50 leads will come from and what the main gaps are, and a 30/60/90-day action plan.

Respond strictly with JSON matching this schema:
{
  "seoScore": 55,
  "executiveSummary": "string",
  "thirtyDayPlan": ["string", "string", "string", "string", "string"],
  "sixtyDayPlan": ["string", "string", "string", "string", "string"],
  "ninetyDayPlan": ["string", "string", "string", "string", "string"],
  "issues": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "title": "string",
      "description": "string",
      "impact": "string",
      "fix": "string",
      "effort": "low" | "medium" | "high"
    }
  ]
}`;

  const competitorsStr = competitors && competitors.length > 0 ? competitors.join(', ') : 'None specified'

  let prompt = customPrompt || defaultPrompt
  prompt = prompt
    .replace(/{URL}/g, url)
    .replace(/{KEYWORD}/g, keyword)
    .replace(/{LOCATION}/g, location)
    .replace(/{COMPETITORS}/g, competitorsStr)
    .replace(/{CRAWL_DATA}/g, JSON.stringify(crawl.slice(0, 30), null, 2))


  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              seoScore: { type: 'INTEGER' },
              executiveSummary: { type: 'STRING' },
              thirtyDayPlan: { type: 'ARRAY', items: { type: 'STRING' } },
              sixtyDayPlan: { type: 'ARRAY', items: { type: 'STRING' } },
              ninetyDayPlan: { type: 'ARRAY', items: { type: 'STRING' } },
              issues: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    severity: { type: 'STRING', enum: ['critical', 'high', 'medium', 'low'] },
                    title: { type: 'STRING' },
                    description: { type: 'STRING' },
                    impact: { type: 'STRING' },
                    fix: { type: 'STRING' },
                    effort: { type: 'STRING', enum: ['low', 'medium', 'high'] }
                  },
                  required: ['severity', 'title', 'description', 'impact', 'fix', 'effort']
                }
              }
            },
            required: ['seoScore', 'executiveSummary', 'thirtyDayPlan', 'sixtyDayPlan', 'ninetyDayPlan', 'issues']
          }
        }
      })
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API call failed: ${err}`)
  }

  const data = await res.json()
  const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!contentText) throw new Error('No content returned from Gemini')

  const parsed = JSON.parse(contentText)

  // Map back to AuditResults format
  const issuesCount = {
    critical: parsed.issues.filter((i: any) => i.severity === 'critical').length,
    high: parsed.issues.filter((i: any) => i.severity === 'high').length,
    medium: parsed.issues.filter((i: any) => i.severity === 'medium').length,
    low: parsed.issues.filter((i: any) => i.severity === 'low').length,
  }

  return {
    crawl,
    issues: parsed.issues,
    summary: {
      totalPages: crawl.length,
      indexablePages: crawl.filter(p => p.indexable).length,
      issuesCount,
      topIssues: parsed.issues.slice(0, 3).map((i: any) => i.title),
      healthScore: parsed.seoScore,
      executiveSummary: parsed.executiveSummary,
    },
    thirtyDayPlan: parsed.thirtyDayPlan,
    sixtyDayPlan: parsed.sixtyDayPlan,
    ninetyDayPlan: parsed.ninetyDayPlan,
  } as any
}

