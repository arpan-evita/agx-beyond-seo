// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUsers, createUser } from '@/lib/store'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Hide passwords in api response
  const users = getUsers().map(({ password, ...u }) => u)
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || (session.user as { role?: string }).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const users = getUsers()
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const newUser = createUser({
      name,
      email: email.toLowerCase(),
      password,
      role: role as 'admin' | 'member',
    })

    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
