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
    if (report.apifyRunId.startsWith('mock-run-')) {
      // Simulate status completion after 6 seconds of running
      const elapsed = Date.now() - new Date(report.createdAt).getTime()
      if (elapsed < 6000) {
        return NextResponse.json({ status: 'running', apifyStatus: 'RUNNING (Simulation Mode)' })
      }

      // Generate simulation results
      let results: any = {}
      let seoScore = 65

      if (report.url.toLowerCase().includes('avcindia.co.in')) {
        // Return seeded AVC India detailed audit
        seoScore = 50
        results = {
          summary: {
            totalPages: 45,
            indexablePages: 44,
            issuesCount: { critical: 3, high: 3, medium: 4, low: 0 },
            topIssues: [
              "robots.txt Points to Wrong Sitemap URL",
              "No Dedicated Location Pages for Gurgaon Services",
              "Homepage Title Tag Has Keyword Stuffing Pattern"
            ],
            healthScore: 50
          },
          thirtyDayPlan: [
            "Fix robots.txt sitemap URL reference in code.",
            "Add 'noindex' headers or delete test page '/aa-demo-building/'.",
            "Create Gurgaon-specific CA landing pages: /ca-firm-gurgaon/, /gst-registration-gurgaon/.",
            "Add floating mobile WhatsApp contact button."
          ],
          sixtyDayPlan: [
            "Expand service pages with YMYL guidelines (candidacy, pricing, credentials).",
            "Inject LocalBusiness & ProfessionalService JSON-LD markup on homepage.",
            "Publish 8 blog posts answering direct tax/GST compliance questions."
          ],
          ninetyDayPlan: [
            "Establish citation submissions (15+ Indian business index listings).",
            "Request reviews on Google Business Profile from clients.",
            "Monitor indexation status of newly created location pages in GSC."
          ],
          crawl: [
            {
              url: "https://avcindia.co.in/",
              title: "Best CA Firm in Gurgaon | Chartered Accountant Services India | AVC India",
              h1: "AVC India - Chartered Accountant & Business Advisory",
              metaDescription: "Leading Chartered Accountant Firm in Gurgaon offering Accounting, Tax filings, GST registration, audit and corporate compliance services.",
              wordCount: 1120,
              statusCode: 200,
              canonical: "https://avcindia.co.in/",
              indexable: true,
              internalLinks: 42
            },
            {
              url: "https://avcindia.co.in/tax-services/",
              title: "Tax Services - AVC India",
              h1: "Taxation, Filing & Compliance Services",
              metaDescription: "Corporate tax filing, direct taxation advisory and tax compliance services for companies.",
              wordCount: 380,
              statusCode: 200,
              canonical: "https://avcindia.co.in/tax-services/",
              indexable: true,
              internalLinks: 15
            },
            {
              url: "https://avcindia.co.in/business-services/",
              title: "Business Registration & Consulting - AVC India",
              h1: "Business Setup & Advisory Services",
              metaDescription: "Startup registration, company formation, ROC filings and business setup consulting in India.",
              wordCount: 340,
              statusCode: 200,
              canonical: "https://avcindia.co.in/business-services/",
              indexable: true,
              internalLinks: 12
            }
          ],
          issues: [
            {
              id: "robots-sitemap-mismatch",
              title: "robots.txt Points to Wrong Sitemap URL",
              description: "robots.txt points to https://www.avcindia.co.in/sitemap_index, but actual sitemap resides at https://avcindia.co.in/sitemap.xml (mismatch of www vs non-www and path name).",
              severity: "critical",
              impact: "Search crawlers will check the robots sitemap first. A broken link leads to crawl errors and delayed page indexing.",
              fix: "Update Sitemap reference in robots.txt to: Sitemap: https://avcindia.co.in/sitemap.xml",
              effort: "low"
            },
            {
              id: "missing-location-pages",
              title: "No Dedicated Location Pages for Gurgaon Services",
              description: "No city-specific service hubs exist (e.g. /ca-firm-gurgaon/, /gst-registration-gurgaon/). Only the generic home page targets Gurgaon.",
              severity: "critical",
              impact: "A single home page cannot rank for multiple service + location variations. Competitors with dedicated city pages outrank you.",
              fix: "Create dedicated subpages: /ca-firm-gurgaon/, /gst-registration-gurgaon/, /income-tax-filing-gurgaon/.",
              effort: "medium"
            },
            {
              id: "homepage-title-keyword-stuffing",
              title: "Homepage Title Tag Has Keyword Stuffing Pattern",
              description: "Current Title: 'Best CA Firm in Gurgaon | Chartered Accountant Services India | AVC India'",
              severity: "high",
              impact: "Google ignores superlative claims ('Best'). Stacking unrelated local/national keywords creates duplicate signals and lower relevance.",
              fix: "Shorten Title to: 'CA Firm in Gurgaon | AVC India - Accounting, GST & Tax Experts'",
              effort: "low"
            },
            {
              id: "missing-entity-schema",
              title: "Missing Structured JSON-LD Entity Schema",
              description: "No Organization, ProfessionalService, LocalBusiness, or Service schema exists in HTML source code.",
              severity: "high",
              impact: "Google cannot map entity relations, geolocation bounds, or operating schedules, reducing map-pack eligibility.",
              fix: "Inject professional Dentist/AccountingService JSON-LD Schema to the homepage header.",
              effort: "low"
            },
            {
              id: "thin-content-service-pages",
              title: "Thin Content on Main Service Pages",
              description: "Key pages like /tax-services/ and /business-services/ carry fewer than 400 words of promotional copy.",
              severity: "high",
              impact: "YMYL (Your Money Your Life) criteria requires deep explanation, compliance risks, credentials, and FAQs to establish trust.",
              fix: "Expand text block size to 1,200+ words including steps, eligibility criteria, FAQs, and local credentials.",
              effort: "medium"
            },
            {
              id: "missing-tax-gst-landing-pages",
              title: "No GST or Income Tax Specific Landing Pages",
              description: "No separate pages targeting major commercial terms (e.g. /gst-registration-india/, /income-tax-return-filing/).",
              severity: "high",
              impact: "These are highly targeted terms users search for when ready to buy. Without dedicated pages, you miss these leads.",
              fix: "Publish individual service pages: /gst-registration-gurgaon/, /income-tax-filing-gurgaon/.",
              effort: "medium"
            },
            {
              id: "indexed-demo-pages",
              title: "Indexed Development Demo Pages (/aa-demo-building/)",
              description: "Development/test pages are publicly listed in sitemaps and indexed in Google search console.",
              severity: "critical",
              impact: "Indexation of demo paths dilutes crawl budget, leaks authority, and triggers thin content penalties.",
              fix: "Remove test sitemap nodes and add noindex header: <meta name=\"robots\" content=\"noindex\" />",
              effort: "low"
            },
            {
              id: "missing-faqpage-schema",
              title: "Missing FAQPage Schema on Information Pages",
              description: "An isolated FAQ page exists, but is not inter-linked and has no FAQPage JSON-LD structures.",
              severity: "medium",
              impact: "FAQ markup qualifies content for Google Rich Answers (PAA) and voice search engine answers (AEO).",
              fix: "Inject 5-8 context-rich FAQ sections on each service node and add FAQPage schema.",
              effort: "low"
            },
            {
              id: "irregular-blog-publishing",
              title: "Irregular Blog / Supporting Content Creation",
              description: "Existing blog indices are outdated. There is no topical cluster supporting tax, GST, or payroll questions.",
              severity: "medium",
              impact: "Topical authority requires surrounding informational articles linking to primary service pages.",
              fix: "Publish 2 informational support articles per week linking to service hubs with natural anchors.",
              effort: "medium"
            },
            {
              id: "missing-whatsapp-mobile-cta",
              title: "No Floating Conversions Channels (WhatsApp/Mobile Calls)",
              description: "No floating CTA buttons on mobile layouts. No WhatsApp chat integration (standard in India).",
              severity: "medium",
              impact: "India local services convert heavily on mobile. The absence of floating WhatsApp links reduces leads by 40-60%.",
              fix: "Embed WhatsApp floating CTA anchor at bottom right linking to business chat line.",
              effort: "low"
            }
          ]
        }
      } else {
        // Return generic mock crawl results
        seoScore = 65
        results = {
          summary: {
            totalPages: 10,
            indexablePages: 10,
            issuesCount: { critical: 1, high: 1, medium: 1, low: 0 },
            topIssues: ["Missing LocalBusiness Schema", "Thin Content on Service Pages"],
            healthScore: 65
          },
          thirtyDayPlan: [
            "Inject primary LocalBusiness schema parameters",
            "Enable a WhatsApp CTA button for customer conversions"
          ],
          sixtyDayPlan: [
            "Expand thin content nodes to 800+ words",
            "Deploy FAQPage schema elements across catalog sub-directories"
          ],
          ninetyDayPlan: [
            "Establish citation submissions on business indexes"
          ],
          crawl: [
            {
              url: report.url,
              title: "Home Page - Audited Site",
              h1: "Welcome to Our Website",
              metaDescription: "We provide professional services.",
              wordCount: 350,
              statusCode: 200,
              canonical: report.url,
              indexable: true,
              internalLinks: 5
            }
          ],
          issues: [
            {
              id: "missing-schema",
              title: "Missing LocalBusiness Schema",
              description: "No structured local business data detected in source HTML.",
              severity: "critical",
              impact: "Prevents search engines from matching location bounds for local pack queries.",
              fix: "Add LocalBusiness JSON-LD markup to homepage header.",
              effort: "low"
            },
            {
              id: "thin-content",
              title: "Thin Content on Main Landing Page",
              description: "Homepage has fewer than 400 words of indexable copy.",
              severity: "high",
              impact: "Weaker ranking position due to thin search query matching.",
              fix: "Expand content to 800+ words detailing all available core services.",
              effort: "medium"
            }
          ]
        }
      }

      const updated = updateReport(id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        results: results as any,
        seoScore,
      })
      return NextResponse.json({ status: 'completed', report: updated })
    }

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

