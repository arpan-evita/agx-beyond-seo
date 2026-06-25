// app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getReports, getReportById, deleteReport } from '@/lib/store'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(getReports())
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json().catch(() => null)
    if (!body || !body.id) {
      return NextResponse.json({ error: 'Missing report ID in request body' }, { status: 400 })
    }
    
    const { id } = body
    console.log(`[DELETE] Attempting to delete report ID: ${id} requested by: ${session.user.email}`)
    
    const report = getReportById(id)
    if (!report) {
      console.warn(`[DELETE] Report ID: ${id} not found in database.`)
      return NextResponse.json({ error: `Report with ID '${id}' not found` }, { status: 404 })
    }
    
    deleteReport(id)
    console.log(`[DELETE] Successfully deleted report ID: ${id}`)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[DELETE] Unexpected error in DELETE handler:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
