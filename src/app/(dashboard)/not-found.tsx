import Link from 'next/link'
import { SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <SearchX className="h-10 w-10 text-gray-400 dark:text-gray-500" />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Página não encontrada
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs">
          A página que você está procurando não existe ou foi movida.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  )
}
