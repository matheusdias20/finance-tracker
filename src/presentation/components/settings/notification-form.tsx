'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { notificationSettingsSchema } from '@/shared/schemas/settings.schema'
import type { NotificationSettings } from '@/shared/schemas/settings.schema'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from '@/presentation/components/ui'
import { useToast } from '@/presentation/components/ui/toast'
import { Bell, Save } from 'lucide-react'
import { cn } from '@/presentation/lib/utils'

interface NotificationFormProps {
  initialSettings: NotificationSettings | null
}

export function NotificationForm({ initialSettings }: NotificationFormProps) {
  const { showToast } = useToast()
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: initialSettings || {
      email: '',
      budgetExceeded: true,
      recurringReminder: true,
      weeklySummary: true,
      monthlySummary: true,
    },
  })

  const onSubmit = async (data: NotificationSettings) => {
    try {
      const res = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Falha ao salvar')
      showToast('Configurações salvas com sucesso!', 'success')
    } catch {
      showToast('Erro ao salvar configurações.', 'error')
    }
  }

  const Toggle = ({ 
    label, 
    description, 
    name 
  }: { 
    label: string, 
    description: string, 
    name: keyof NotificationSettings 
  }) => {
    const checked = watch(name) as boolean
    
    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <div className="space-y-0.5">
          <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</label>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setValue(name, (!checked) as NotificationSettings[typeof name], { shouldDirty: true })}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle>Notificações por Email</CardTitle>
          <CardDescription>Escolha quais alertas você deseja receber em sua caixa de entrada.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Email para notificações"
                  placeholder="seu@email.com"
                  type="email"
                  error={errors.email?.message}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-1">
            <Toggle 
              name="budgetExceeded" 
              label="Alerta de Orçamento" 
              description="Notificar quando o gasto de uma categoria exceder o limite definido."
            />
            <Toggle 
              name="recurringReminder" 
              label="Lembretes de Recorrência" 
              description="Lembrar 3 dias antes do vencimento de transações recorrentes."
            />
            <Toggle 
              name="weeklySummary" 
              label="Resumo Semanal" 
              description="Receber um balanço geral de gastos e ganhos toda segunda-feira."
            />
            <Toggle 
              name="monthlySummary" 
              label="Fechamento Mensal" 
              description="Receber um relatório detalhado no primeiro dia de cada mês."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting} className="gap-2">
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
