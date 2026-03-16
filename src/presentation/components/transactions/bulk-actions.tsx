'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, LucideIcon, Modal } from '@/presentation/components/ui'

interface BulkActionsProps {
  selectedCount: number
  selectedIds: string[]
  onClear: () => void
}

export function BulkActions({ selectedCount, selectedIds, onClear }: BulkActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      // Loop delete as an alternative if batch endpoint doesn't exist
      await Promise.all(
        selectedIds.map(id => fetch(`/api/transactions/${id}`, { method: 'DELETE' }))
      )
      onClear()
      router.refresh()
    } catch {
      console.error('Bulk delete error')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-700 dark:border-gray-600 flex items-center gap-8 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <LucideIcon name="check-square" size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">{selectedCount} transações selecionadas</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Ações em lote disponíveis</p>
          </div>
        </div>

        <div className="h-8 w-px bg-gray-700" />

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => setShowConfirm(true)}
            className="rounded-xl px-4"
          >
            <LucideIcon name="trash-2" size={16} className="mr-2" />
            Excluir Selecionadas
          </Button>
        </div>
      </div>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Você está prestes a excluir <span className="font-bold text-gray-900 dark:text-gray-100">{selectedCount}</span> transações. Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 pt-2">
            <Button 
              variant="ghost" 
              className="flex-1" 
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
            >
              Voltar
            </Button>
            <Button 
              variant="danger" 
              className="flex-1" 
              onClick={handleBulkDelete}
              loading={isDeleting}
            >
              Sim, Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
