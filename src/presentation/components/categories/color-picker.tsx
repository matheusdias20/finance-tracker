'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/presentation/lib/utils'
import { Input } from '@/presentation/components/ui/input'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const PRESET_COLORS = [
  '#E74C3C', '#E91E63', '#9B59B6', '#3498DB', '#2ECC71', '#1ABC9C', '#F39C12', '#E67E22',
  '#C0392B', '#AD1457', '#6C3483', '#1A5276', '#1E8449', '#117A65', '#D68910', '#CA6F1E',
]

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [hex, setHex] = useState(value)

  useEffect(() => {
    setHex(value)
  }, [value])

  const handleHexChange = (val: string) => {
    setHex(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-8 gap-2">
        {PRESET_COLORS.map((color) => {
          const isSelected = value.toUpperCase() === color.toUpperCase()

          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-all hover:scale-110',
                isSelected ? 'border-white ring-2 ring-primary shadow-md' : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <div 
          className="h-10 w-10 shrink-0 rounded-md border border-gray-200 shadow-sm"
          style={{ backgroundColor: hex || '#FFFFFF' }}
        />
        <Input
          label="Cor Hexadecimal"
          name="hexCode"
          placeholder="#RRGGBB"
          value={hex}
          onChange={handleHexChange}
          className="font-mono"
        />
      </div>
    </div>
  )
}
