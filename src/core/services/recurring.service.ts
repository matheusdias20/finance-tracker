import { TransactionService } from './transaction.service'
import type { ITransactionRepository } from '../repositories/transaction.repository.interface'

export class RecurringService {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly transactionService: TransactionService
  ) {}

  async processRecurring(asOfDate: Date): Promise<{ processed: number; errors: string[] }> {
    const dueTransactions = await this.transactionRepo.findRecurringDue(asOfDate)
    
    let processed = 0
    const errors: string[] = []

    for (const tx of dueTransactions) {
      try {
        if (!tx.recurrenceRule) {
          throw new Error(`Transaction ${tx.id} is recurring but lacks a recurrence rule`)
        }

        // 2a. Criar nova transação para a data base atual (materializa o registro ocorrido)
        await this.transactionService.create({
          amount: tx.amount,
          description: tx.description,
          date: asOfDate,
          type: tx.type,
          categoryId: tx.categoryId,
          isRecurring: false, // A transação filha não engatilha sub-recorrências
          recurrenceRule: null
        })

        // 2b e 2c. Calcular a data da PRÓXIMA parcela e atualizar a transação original mãe
        const nextDate = this.transactionService.calculateNextOccurrence(asOfDate, tx.recurrenceRule)
        await this.transactionRepo.updateNextOccurrence(tx.id, nextDate)

        processed++
      } catch (err) {
        errors.push(`Falha ao processar transação recorrente ${tx.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    return { processed, errors }
  }
}
