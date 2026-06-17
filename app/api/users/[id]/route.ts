// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteUser, getUserById } from '@/lib/store'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Cannot delete yourself
  if ((session.user as { id?: string }).id === id) {
    return NextResponse.json({ error: 'Cannot delete current admin session' }, { status: 400 })
  }

  const user = getUserById(id)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  deleteUser(id)
  return NextResponse.json({ success: true })
}
