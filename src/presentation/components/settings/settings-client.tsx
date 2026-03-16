'use client'

import React from 'react'
import { NotificationSettings } from '@/shared/schemas/settings.schema'
import { NotificationForm } from './notification-form'
import { TestingSection } from './testing-section'
import { DataSection } from './data-section'
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui'
import { Github, Info, Globe, Shield } from 'lucide-react'

interface SettingsClientProps {
  initialSettings: NotificationSettings | null
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  return (
    <div className="space-y-8 pb-10">
      <NotificationForm initialSettings={initialSettings} />
      
      <TestingSection />
      
      <DataSection />

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="p-2 bg-gray-500/10 rounded-lg">
            <Info className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <CardTitle>Sobre o Finance Tracker</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold text-sm">
              <Globe className="h-4 w-4 text-primary" />
              Versão do App
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">1.2.0 (Stable Release)</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold text-sm">
              <Shield className="h-4 w-4 text-emerald-500" />
              Privacidade
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Seus dados são armazenados localmente.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold text-sm">
              <Github className="h-4 w-4" />
              Código Fonte
            </div>
            <a 
              href="https://github.com/matheusdias20/finance-tracker" 
              target="_blank" 
              className="text-sm text-primary hover:underline"
              rel="noreferrer"
            >
              github.com/matheusdias20
            </a>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">
          Finance Tracker &copy; {new Date().getFullYear()} - Feito com ❤️ e Next.js
        </p>
      </div>
    </div>
  )
}
