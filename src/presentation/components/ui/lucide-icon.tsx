'use client'

import React, { useMemo } from 'react'
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PieChart, 
  Settings, 
  TrendingUp,
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Download,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Menu,
  X,
  PlusCircle,
  MinusCircle,
  Hash,
  ShoppingBag,
  CreditCard,
  Utensils,
  Coffee,
  Car,
  Home,
  Heart,
  Gamepad2,
  Briefcase,
  GraduationCap
} from 'lucide-react'

import { cn } from '@/presentation/lib/utils'

const ICONS_MAP = {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart,
  Settings,
  TrendingUp,
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Download,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Menu,
  X,
  PlusCircle,
  MinusCircle,
  Hash,
  ShoppingBag,
  CreditCard,
  Utensils,
  Coffee,
  Car,
  Home,
  Heart,
  Gamepad2,
  Briefcase,
  GraduationCap
}

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
    const pascalName = name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')

    const Icon = (ICONS_MAP as Record<string, React.ElementType>)[pascalName] || (ICONS_MAP as Record<string, React.ElementType>)[name] || HelpCircle
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
