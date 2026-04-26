import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  DashboardStats,
  StatusDistribution,
  LawyerCaseCount,
  MonthlyTrend,
  Prediction
} from '@/types/dashboard-v3'

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userRole, setUserRole] = useState<string>('assistant')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([])
  const [lawyerCaseCounts, setLawyerCaseCounts] = useState<LawyerCaseCount[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [incomePrediction, setIncomePrediction] = useState<Prediction[]>([])
  const supabase = createClient()

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Oturum açılmamış')
        setLoading(false)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError) {
        setError('Kullanıcı bilgisi alınamadı')
        setLoading(false)
        return
      }

      if (userData) {
        setUserRole(userData.role)
      }

      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      let casesQuery = supabase.from('cases').select('id, status_id, lawyer_id', { count: 'exact' })
      const clientsQuery = supabase.from('clients').select('id', { count: 'exact' })
      let eventsQuery = supabase.from('events').select('id, scheduled_at')
      const incomeQuery = supabase.from('income_records').select('amount')
      const expensesQuery = supabase.from('expense_records').select('amount')

      if (userData?.role !== 'admin' && userData?.role !== 'assistant') {
        casesQuery = casesQuery.eq('lawyer_id', user.id)
        eventsQuery = eventsQuery.eq('lawyer_id', user.id)
      }

      const [casesResult, clientsResult, eventsResult, incomeResult, expensesResult] = 
        await Promise.all([
          casesQuery,
          clientsQuery,
          eventsQuery,
          incomeQuery.gte('record_date', monthStart),
          expensesQuery.gte('record_date', monthStart)
        ])

      const activeCases = casesResult.data?.length || 0
      const todayHearings = eventsResult.data?.filter(e => 
        e.scheduled_at?.startsWith(today)
      ).length || 0
      const weekHearings = eventsResult.data?.filter(e => 
        e.scheduled_at && e.scheduled_at >= weekAgo
      ).length || 0
      const monthIncome = incomeResult.data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0
      const monthExpenses = expensesResult.data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0

      setStats({
        totalCases: casesResult.count || 0,
        activeCases,
        totalClients: clientsResult.count || 0,
        todayHearings,
        weekHearings,
        monthIncome,
        monthExpenses
      })

      // Load chart data for admin/assistant
      if (userData?.role === 'admin' || userData?.role === 'assistant') {
        // Status distribution
        const statusIds = casesResult.data?.map(c => c.status_id).filter(Boolean) || []
        const statusCounts: Record<string, number> = {}
        statusIds.forEach(id => {
          statusCounts[id] = (statusCounts[id] || 0) + 1
        })

        const { data: statusLabels } = await supabase
          .from('lookup_values')
          .select('id, label')
          .in('id', Object.keys(statusCounts))

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
        const statusData: StatusDistribution[] = (statusLabels || []).map((s, i) => ({
          name: s.label,
          value: statusCounts[s.id] || 0,
          color: colors[i % colors.length]
        }))
        setStatusDistribution(statusData)

        // Lawyer case counts
        const lawyerIds = casesResult.data?.map(c => c.lawyer_id).filter(Boolean) || []
        const lawyerCounts: Record<string, number> = {}
        lawyerIds.forEach(id => {
          lawyerCounts[id] = (lawyerCounts[id] || 0) + 1
        })

        const { data: lawyerNames } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', Object.keys(lawyerCounts))

        const lawyerData: LawyerCaseCount[] = (lawyerNames || []).map(l => ({
          name: l.full_name,
          value: lawyerCounts[l.id] || 0
        }))
        setLawyerCaseCounts(lawyerData)

        // Load monthly trends for last 6 months
        const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
        
        const [incomeTrend, expenseTrend, caseTrend, eventTrend] = await Promise.all([
          supabase.from('income_records').select('record_date, amount').gte('record_date', sixMonthsAgo),
          supabase.from('expense_records').select('record_date, amount').gte('record_date', sixMonthsAgo),
          supabase.from('cases').select('created_at').gte('created_at', sixMonthsAgo),
          supabase.from('events').select('scheduled_at').gte('scheduled_at', sixMonthsAgo)
        ])

        // Aggregate by month
        const monthlyData: Record<string, MonthlyTrend> = {}
        const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000)
          const monthKey = months[date.getMonth()]
          monthlyData[monthKey] = {
            month: monthKey,
            income: 0,
            expenses: 0,
            cases: 0,
            hearings: 0
          }
        }

        incomeTrend.data?.forEach(r => {
          const month = months[new Date(r.record_date).getMonth()]
          if (monthlyData[month]) monthlyData[month].income += r.amount || 0
        })

        expenseTrend.data?.forEach(r => {
          const month = months[new Date(r.record_date).getMonth()]
          if (monthlyData[month]) monthlyData[month].expenses += r.amount || 0
        })

        caseTrend.data?.forEach(r => {
          const month = months[new Date(r.created_at).getMonth()]
          if (monthlyData[month]) monthlyData[month].cases += 1
        })

        eventTrend.data?.forEach((r: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          const month = months[new Date(r.scheduled_at).getMonth()]
          if (monthlyData[month]) monthlyData[month].hearings += 1
        })

        setMonthlyTrends(Object.values(monthlyData))

        // Simple prediction based on trend
        const lastMonth = Object.values(monthlyData)[Object.values(monthlyData).length - 1]
        const previousMonth = Object.values(monthlyData)[Object.values(monthlyData).length - 2]
        const growthRate = lastMonth.income > 0 ? (lastMonth.income - previousMonth.income) / previousMonth.income : 0
        
        const predictions: Prediction[] = []
        for (let i = 1; i <= 3; i++) {
          const nextMonthIndex = (new Date().getMonth() + i) % 12
          const predictedIncome = lastMonth.income * (1 + growthRate * 0.5) // Conservative prediction
          predictions.push({
            month: months[nextMonthIndex],
            predicted: Math.round(predictedIncome),
            confidence: Math.max(50, 90 - i * 15) // Decreasing confidence
          })
        }
        setIncomePrediction(predictions)
      }

      setLoading(false)
    } catch (err) {
      console.error('Dashboard data loading error:', err)
      setError('Veriler yüklenirken bir hata oluştu')
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadDashboardData()
    }, 0)

    return () => clearTimeout(timeout)
  }, [loadDashboardData])

  return {
    stats,
    userRole,
    loading,
    error,
    statusDistribution,
    lawyerCaseCounts,
    monthlyTrends,
    incomePrediction,
    reload: loadDashboardData
  }
}
