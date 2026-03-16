'use client'

import React, { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/presentation/lib/format'

interface CategoryData {
  categoryName: string
  name: string
  totalAmount: number
  categoryColor: string
}

interface CategoryChartProps {
  data: CategoryData[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  const totalExpenses = useMemo(() => 
    data.reduce((acc, curr) => acc + curr.totalAmount, 0),
    [data]
  )

  const chartData = useMemo(() => 
    data.map(item => ({
      ...item,
      name: item.categoryName,
      percentage: totalExpenses > 0 ? (item.totalAmount / totalExpenses) * 100 : 0
    })),
    [data, totalExpenses]
  )

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center dark:bg-gray-800">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nenhum gasto registrado neste mês
        </p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: CategoryData & { percentage: number } }[] }) => {
    if (active && payload && payload.length) {
      const { categoryName, totalAmount, categoryColor } = payload[0].payload
      return (
        <div className="rounded-lg border border-gray-100 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: categoryColor }} />
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {categoryName}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(totalAmount)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Distribuição de gastos
      </h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="totalAmount"
              nameKey="categoryName"
            >
              {chartData.map((entry: CategoryData & { percentage: number }, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.categoryColor} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: string, entry: any) => {
                const item = entry.payload?.payload as CategoryData & { percentage: number } | undefined
                return (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
                    <span className="ml-1">({item?.percentage?.toFixed(1) ?? '0'}%)</span>
                  </span>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
