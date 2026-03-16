'use client'

import { AlertTriangle } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-danger-light dark:bg-danger/10">
        <AlertTriangle className="h-10 w-10 text-danger dark:text-red-400" />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Algo deu errado
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
        </p>
      </div>

      {process.env.NODE_ENV === 'development' && error.message && (
        <pre className="max-w-lg rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-left text-xs text-gray-700 dark:text-gray-300 overflow-auto whitespace-pre-wrap">
          {error.message}
        </pre>
      )}

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Tentar novamente
      </button>
    </div>
  )
}
