'use client'

import { useState } from 'react'
import { 
  Utensils, Coffee, Pizza, ShoppingCart, 
  Car, Bike, Bus, Plane, 
  Home, Sofa, Lightbulb, Wrench, 
  Heart, Activity, Pill, Stethoscope, 
  Gamepad2, Music, Film, TreePine, 
  TrendingUp, TrendingDown, Wallet, CreditCard, 
  GraduationCap, BookOpen, Pencil, Monitor, 
  Repeat, Star, Zap, Package, 
  Search
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/presentation/lib/utils'
import { Input } from '@/presentation/components/ui/input'

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const ICON_MAP = {
  Utensils, Coffee, Pizza, ShoppingCart, 
  Car, Bike, Bus, Plane, 
  Home, Sofa, Lightbulb, Wrench, 
  Heart, Activity, Pill, Stethoscope, 
  Gamepad2, Music, Film, TreePine, 
  TrendingUp, TrendingDown, Wallet, CreditCard, 
  GraduationCap, BookOpen, Pencil, Monitor, 
  Repeat, Star, Zap, Package, 
  Search
}

const FINANCE_ICONS = [
  // Alimentação
  { name: 'Utensils', category: 'Alimentação' },
  { name: 'Coffee', category: 'Alimentação' },
  { name: 'Pizza', category: 'Alimentação' },
  { name: 'ShoppingCart', category: 'Alimentação' },
  // Transporte
  { name: 'Car', category: 'Transporte' },
  { name: 'Bike', category: 'Transporte' },
  { name: 'Bus', category: 'Transporte' },
  { name: 'Plane', category: 'Transporte' },
  // Casa
  { name: 'Home', category: 'Casa' },
  { name: 'Sofa', category: 'Casa' },
  { name: 'Lightbulb', category: 'Casa' },
  { name: 'Wrench', category: 'Casa' },
  // Saúde
  { name: 'Heart', category: 'Saúde' },
  { name: 'Activity', category: 'Saúde' },
  { name: 'Pill', category: 'Saúde' },
  { name: 'Stethoscope', category: 'Saúde' },
  // Lazer
  { name: 'Gamepad2', category: 'Lazer' },
  { name: 'Music', category: 'Lazer' },
  { name: 'Film', category: 'Lazer' },
  { name: 'TreePine', category: 'Lazer' },
  // Finanças
  { name: 'TrendingUp', category: 'Finanças' },
  { name: 'TrendingDown', category: 'Finanças' },
  { name: 'Wallet', category: 'Finanças' },
  { name: 'CreditCard', category: 'Finanças' },
  // Educação
  { name: 'GraduationCap', category: 'Educação' },
  { name: 'BookOpen', category: 'Educação' },
  { name: 'Pencil', category: 'Educação' },
  { name: 'Monitor', category: 'Educação' },
  // Outros
  { name: 'Repeat', category: 'Outros' },
  { name: 'Star', category: 'Outros' },
  { name: 'Zap', category: 'Outros' },
  { name: 'Package', category: 'Outros' },
]

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [search, setSearch] = useState('')

  const filteredIcons = FINANCE_ICONS.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={cn('space-y-4', className)}>
      <Input
        label="Pesquisar"
        name="searchIcon"
        placeholder="Pesquisar ícone..."
        value={search}
        onChange={setSearch}
        icon={<Search className="h-4 w-4" />}
      />

      <div className="grid grid-cols-8 gap-2 max-h-[240px] overflow-y-auto p-1">
        {filteredIcons.map((item) => {
          const Icon = ICON_MAP[item.name as keyof typeof ICON_MAP] as LucideIcon
          const isSelected = value === item.name

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onChange(item.name)}
              title={`${item.category}: ${item.name}`}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-md border transition-all hover:bg-gray-50',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-gray-200 text-gray-500'
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
            </button>
          )
        })}

        {filteredIcons.length === 0 && (
          <div className="col-span-8 py-8 text-center text-sm text-gray-500">
            Nenhum ícone encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
