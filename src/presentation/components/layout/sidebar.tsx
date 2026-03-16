'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Tag, 
  TrendingUp, 
  Settings 
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs))
}

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categorias', icon: Tag },
  { href: '/reports', label: 'Relatórios', icon: TrendingUp },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-full flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shrink-0">
          <BarChart3 className="h-4.5 w-4.5" />
        </div>
        <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
          Finance Tracker
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação principal">
        <ul className="space-y-0.5">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  {...(onNavigate ? { onClick: onNavigate } : {})}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                    'transition-colors duration-150',
                    isActive
                      ? 'bg-primary-light text-primary border-l-[3px] border-primary pl-[9px]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                    isActive && 'dark:bg-primary/10 dark:text-primary',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3">
        <p className="text-xs text-gray-400 dark:text-gray-600 select-none">v1.0.0</p>
      </div>
    </aside>
  )
}
