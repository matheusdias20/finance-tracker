import { Suspense } from 'react'
import { SettingsClient } from '@/presentation/components/settings/settings-client'
import { Card, CardContent, PageHeader } from '@/presentation/components/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações',
  description: 'Gerencie suas preferências e dados.',
}

async function getInitialSettings() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/notifications/settings`, { 
    cache: 'no-store' 
  })
  
  if (!res.ok) return null
  const data = await res.json()
  return data.success ? data.data : null
}

export default async function SettingsPage() {
  const settings = await getInitialSettings()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        subtitle="Gerencie suas preferências e dados."
      />

      <Suspense fallback={
        <Card>
          <CardContent className="p-6">
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      }>
        <SettingsClient initialSettings={settings} />
      </Suspense>
    </div>
  )
}
