// app/api/users/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserById, updateUser } from '@/lib/store'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id?: string }).id
  if (!userId) {
    return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 })
    }

    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.password !== currentPassword) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
    }

    updateUser(userId, { password: newPassword })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
