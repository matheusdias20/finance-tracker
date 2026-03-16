'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export function SectionError({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center gap-4 rounded-xl border border-danger/10 bg-danger/5 dark:bg-danger/10">
      <AlertTriangle className="h-8 w-8 text-danger" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Falha ao carregar seção
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {error.message || 'Ocorreu um erro ao recuperar os dados.'}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  )
}
