// app/(app)/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getReports } from '@/lib/store'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const reports = getReports()
  const name = session?.user?.name?.split(' ')[0] || 'analyst'

  return <DashboardClient initialReports={reports} userName={name} />
}
