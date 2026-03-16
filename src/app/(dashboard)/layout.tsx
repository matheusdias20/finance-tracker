import { Providers } from '@/presentation/providers'
import { DashboardShell } from '@/presentation/components/layout/dashboard-shell'
import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <DashboardShell>
        {children}
      </DashboardShell>
    </Providers>
  )
}
