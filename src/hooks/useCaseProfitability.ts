import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CaseProfitability {
  caseId: string
  caseNumber: string
  caseTitle: string
  clientName: string
  totalIncome: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  incomeCount: number
  expenseCount: number
  status: string
}

export function useCaseProfitability() {
  const [data, setData] = useState<CaseProfitability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadCaseProfitability = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Oturum açılmamış')
        setLoading(false)
        return
      }

      // Get all cases with their income and expenses
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })

      if (casesError) {
        console.error('Cases error:', casesError)
        setError('Dava bilgileri alınamadı')
        setLoading(false)
        return
      }

      if (!cases || cases.length === 0) {
        setData([])
        setLoading(false)
        return
      }

      // Get client names - skip for now to avoid query errors
      const clientMap = new Map<string, string>()

      // Get income records for all cases
      const { data: incomeRecords, error: incomeError } = await supabase
        .from('income_records')
        .select('case_id, amount')
        .not('case_id', 'is', null)

      if (incomeError) {
        setError('Gelir kayıtları alınamadı')
        setLoading(false)
        return
      }

      // Get expense records for all cases
      const { data: expenseRecords, error: expenseError } = await supabase
        .from('expense_records')
        .select('case_id, amount')
        .not('case_id', 'is', null)

      if (expenseError) {
        setError('Gider kayıtları alınamadı')
        setLoading(false)
        return
      }

      // Calculate profitability for each case
      const profitability: CaseProfitability[] = cases.map((c) => {
        const caseIncome = incomeRecords
          .filter((r) => r.case_id === c.id)
          .reduce((sum, r) => sum + (r.amount || 0), 0)

        const caseExpenses = expenseRecords
          .filter((r) => r.case_id === c.id)
          .reduce((sum, r) => sum + (r.amount || 0), 0)

        const netProfit = caseIncome - caseExpenses
        const profitMargin = caseIncome > 0 ? ((netProfit / caseIncome) * 100) : 0

        return {
          caseId: c.id,
          caseNumber: c.case_number || 'N/A',
          caseTitle: c.title || 'İsimsiz Dava',
          clientName: c.client_id ? (clientMap.get(c.client_id) || 'Bilinmiyor') : 'Bilinmiyor',
          totalIncome: caseIncome,
          totalExpenses: caseExpenses,
          netProfit,
          profitMargin,
          incomeCount: incomeRecords.filter((r) => r.case_id === c.id).length,
          expenseCount: expenseRecords.filter((r) => r.case_id === c.id).length,
          status: c.status_id || 'unknown'
        }
      })

      setData(profitability)
      setLoading(false)
    } catch (err) {
      console.error('Case profitability loading error:', err)
      setError('Veriler yüklenirken bir hata oluştu')
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadCaseProfitability()
    }, 0)

    return () => clearTimeout(timeout)
  }, [loadCaseProfitability])

  return {
    data,
    loading,
    error,
    reload: loadCaseProfitability
  }
}
