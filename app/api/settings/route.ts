// app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSettings, updateSettings } from '@/lib/store'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = getSettings()
  return NextResponse.json(settings)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { apifyToken, geminiApiKey } = body

    const dataToUpdate: Record<string, string> = {}
    if (apifyToken !== undefined) dataToUpdate.apifyToken = apifyToken
    if (geminiApiKey !== undefined) dataToUpdate.geminiApiKey = geminiApiKey

    const updated = updateSettings(dataToUpdate)
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
