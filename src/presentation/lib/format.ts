export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: Date | string): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR', { 
    timeZone: 'America/Sao_Paulo', 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(new Date(date))
}

export function formatMonth(yearMonth: string): string {
  if (!yearMonth) return ''
  const [year, month] = yearMonth.split('-')
  const dateStr = `${year}-${month}-01T12:00:00.000Z`
  const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const formatted = formatter.format(new Date(dateStr))
  // 'dezembro de 2024' -> 'Dezembro 2024'
  const parts = formatted.split(' de ')
  if (parts.length === 2) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' ' + parts[1]
  }
  return formatted
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value) + '%'
}

export function getProgressColor(percentage: number): string {
  if (percentage < 80) return 'text-green-600'
  if (percentage >= 80 && percentage < 100) return 'text-yellow-600'
  return 'text-red-600'
}
