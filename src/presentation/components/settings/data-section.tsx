'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Modal } from '@/presentation/components/ui'
import { useToast } from '@/presentation/components/ui/toast'
import { Database, Download, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react'

export function DataSection() {
  const { showToast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Buscar dados essenciais
      const [txsRes, budgetsRes] = await Promise.all([
        fetch('/api/transactions?limit=1000'),
        fetch('/api/budgets')
      ])

      const txs = (await txsRes.json()) as { data: { data: unknown[] } }
      const budgets = (await budgetsRes.json()) as { data: unknown[] }

      const exportData = {
        exportedAt: new Date().toISOString(),
        transactions: txs.data?.data || [],
        budgets: budgets.data || []
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finance-tracker-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      showToast('Dados exportados com sucesso!', 'success')
    } catch {
      showToast('Erro ao exportar dados.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAll = async () => {
    if (confirmText !== 'CONFIRMAR') return

    setIsDeleting(true)
    try {
      const [txsRes, budgetsRes] = await Promise.all([
        fetch('/api/transactions/all', { method: 'DELETE' }),
        fetch('/api/budgets/all', { method: 'DELETE' })
      ])

      if (!txsRes.ok || !budgetsRes.ok) throw new Error('Erro ao limpar dados')

      showToast('Todos os dados foram excluídos com sucesso.', 'success')
      setIsModalOpen(false)
      setConfirmText('')
      
      // Recarregar a página após um pequeno delay para limpar o estado global
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      showToast('Erro ao limpar banco de dados.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <Database className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <CardTitle>Dados e Privacidade</CardTitle>
            <CardDescription>Exporte seus dados para backup ou limpe permanentemente seu histórico.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Download className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Exportar Dados</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Baixe todas as suas transações e orçamentos em formato JSON para usar em outras ferramentas.
              </p>
              <Button 
                variant="secondary" 
                className="w-full gap-2" 
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exportando...' : 'Fazer Download'}
              </Button>
            </div>

            <div className="flex-1 p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <div className="flex items-center gap-3 mb-3">
                <Trash2 className="h-5 w-5 text-rose-500" />
                <h3 className="font-semibold text-rose-600 dark:text-rose-400">Limpar Dados</h3>
              </div>
              <p className="text-xs text-rose-500/80 dark:text-rose-400/80 mb-4">
                Excluir permanentemente todas as transações, orçamentos e registros financeiros do sistema.
              </p>
              <Button 
                variant="secondary" 
                className="w-full gap-2 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                onClick={() => setIsModalOpen(true)}
              >
                Limpar Tudo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Limpar todos os dados"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Esta ação é irreversível. Todos os seus dados financeiros serão excluídos permanentemente.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Digite <span className="font-bold text-gray-900 dark:text-gray-100">CONFIRMAR</span> para prosseguir:
            </p>
            <Input
              label="Confirmação"
              name="confirm"
              value={confirmText}
              onChange={(val) => setConfirmText(val.toUpperCase())}
              placeholder="Digite aqui..."
              className="border-rose-200 focus:ring-rose-500"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="danger"
              className="w-full gap-2"
              disabled={confirmText !== 'CONFIRMAR' || isDeleting}
              onClick={handleDeleteAll}
            >
              {isDeleting ? 'Excluindo...' : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Confirmar Exclusão
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setIsModalOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
