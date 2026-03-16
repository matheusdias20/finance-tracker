'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/presentation/components/layout/sidebar'
import { useAppState } from '@/presentation/providers'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useAppState()

  // Close sidebar on ESC key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dispatch({ type: 'CLOSE_SIDEBAR' })
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [dispatch])

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-60 flex-col">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {state.isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-hidden="true"
            onClick={() => dispatch({ type: 'CLOSE_SIDEBAR' })}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col md:hidden animate-in slide-in-from-left duration-200">
            <Sidebar onNavigate={() => dispatch({ type: 'CLOSE_SIDEBAR' })} />
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="md:pl-60 flex min-h-screen flex-col">
        <main className="flex-1 px-4 md:px-6 pt-6 pb-8">
          {children}
        </main>
      </div>
    </>
  )
}
