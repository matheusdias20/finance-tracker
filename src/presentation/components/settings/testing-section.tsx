'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/presentation/components/ui'
import { useToast } from '@/presentation/components/ui/toast'
import { Mail, Send, CheckCircle, AlertTriangle, Calendar, PieChart } from 'lucide-react'

export function TestingSection() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const testTypes = [
    { 
      id: 'budget_exceeded', 
      label: 'Gasto Excedido', 
      desc: 'Simula um alerta de orçamento estourado.',
      icon: AlertTriangle,
      color: 'bg-amber-500'
    },
    { 
      id: 'recurring_reminder', 
      label: 'Lembrete Recorrente', 
      desc: 'Simula aviso de conta próxima ao vencimento.',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    { 
      id: 'weekly_summary', 
      label: 'Resumo Semanal', 
      desc: 'Simula o relatório de performance da semana.',
      icon: PieChart,
      color: 'bg-emerald-500'
    },
    { 
      id: 'monthly_summary', 
      label: 'Fechamento Mensal', 
      desc: 'Simula o relatório consolidado do mês.',
      icon: CheckCircle,
      color: 'bg-purple-500'
    },
  ]

  const onTest = async (type: string) => {
    setLoading(type)
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha no teste')
      
      showToast(data.message || 'Email de teste enviado!', 'success')
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erro ao disparar teste.', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Mail className="h-6 w-6 text-indigo-500" />
        </div>
        <div>
          <CardTitle>Testar Notificações</CardTitle>
          <CardDescription>Envie emails de teste para verificar a integração com o Resend.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testTypes.map((type) => (
            <div 
              key={type.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${type.color} text-white`}>
                  <type.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{type.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onTest(type.id)}
                disabled={loading !== null}
                className="gap-2 shrink-0"
              >
                {loading === type.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                Testar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
