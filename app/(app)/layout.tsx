// app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen flex flex-col justify-between">
        <Header />
        <div className="flex-grow max-w-7xl mx-auto w-full">
          {children}
        </div>
        <footer className="py-6 text-center text-[10px] text-gray-500 border-t border-white/5 font-mono select-none print-hide">
          AGX Beyond Intelligence SEO Suite • Developed on secure server binds inside Cloud Run. All rights reserved.
        </footer>
      </main>
    </div>
  )
}

