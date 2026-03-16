'use client'

import React, { useMemo } from 'react'
import * as LucideIcons from 'lucide-react'

import { cn } from '@/presentation/lib/utils'


interface LucideIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  name: string
  size?: number | string
  color?: string
  strokeWidth?: number | string
  className?: string
}

/**
 * A wrapper to render Lucide icons dynamically by name.
 */
export function LucideIcon({
  name,
  size = 20,
  color,
  strokeWidth = 2,
  className,
  ...props
}: LucideIconProps) {
  const IconComponent = useMemo(() => {
    // Convert kebab-case or PascalCase string to what lucide-react exports
    // e.g., 'layout-dashboard' -> 'LayoutDashboard'
    const pascalName = name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')

    const Icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number | string | undefined; color?: string | undefined; strokeWidth?: number | string | undefined; className?: string | undefined } >>
    const Icon = Icons[pascalName] || Icons[name] || LucideIcons.HelpCircle
    return Icon
  }, [name])

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={cn('shrink-0', className)}
      {...props}
    />
  )
}
