'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FolderKanban, 
  TrendingUp, 
  TrendingDown,
  Users,
  Clock
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardStats {
  totalCases: number
  activeCases: number
  totalClients: number
  todayHearings: number
  weekHearings: number
  monthIncome: number
  monthExpenses: number
}

interface StatusDistribution {
  name: string
  value: number
  color: string
}

interface LawyerCaseCount {
  name: string
  value: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userRole, setUserRole] = useState<string>('assistant')
  const [loading, setLoading] = useState(true)
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([])
  const [lawyerCaseCounts, setLawyerCaseCounts] = useState<LawyerCaseCount[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData) {
        setUserRole(userData.role)
      }

      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      let casesQuery = supabase.from('cases').select('id, status_id, lawyer_id', { count: 'exact' })
      const clientsQuery = supabase.from('clients').select('id', { count: 'exact' })
      let hearingsQuery = supabase.from('hearings').select('id, hearing_at')
      const incomeQuery = supabase.from('income_records').select('amount')
      const expensesQuery = supabase.from('expense_records').select('amount')

      if (userData?.role !== 'admin' && userData?.role !== 'assistant') {
        casesQuery = casesQuery.eq('lawyer_id', user.id)
        hearingsQuery = hearingsQuery.eq('lawyer_id', user.id)
      }

      const [casesResult, clientsResult, hearingsResult, incomeResult, expensesResult] = 
        await Promise.all([
          casesQuery,
          clientsQuery,
          hearingsQuery,
          incomeQuery.gte('record_date', monthStart),
          expensesQuery.gte('record_date', monthStart)
        ])

      const activeCases = casesResult.data?.length || 0
      const todayHearings = hearingsResult.data?.filter(h => 
        h.hearing_at?.startsWith(today)
      ).length || 0
      const weekHearings = hearingsResult.data?.filter(h => 
        h.hearing_at && h.hearing_at >= weekAgo
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
      }

      setLoading(false)
    }

    loadDashboardData()
  }, [supabase])

  const cards = [
    {
      title: 'Aktif Dosyalar',
      value: stats?.activeCases || 0,
      total: stats?.totalCases || 0,
      icon: FolderKanban,
      color: 'text-primary'
    },
    {
      title: 'Bugünkü Duruşmalar',
      value: stats?.todayHearings || 0,
      total: stats?.weekHearings || 0,
      icon: Clock,
      color: 'text-amber-600'
    },
    {
      title: 'Müvekkiller',
      value: stats?.totalClients || 0,
      total: null,
      icon: Users,
      color: 'text-emerald-600'
    },
  ]

  const financeCards = userRole === 'admin' || userRole === 'assistant' ? [
    {
      title: 'Bu Ay Gelir',
      value: stats?.monthIncome || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      isMoney: true
    },
    {
      title: 'Bu Ay Gider',
      value: stats?.monthExpenses || 0,
      icon: TrendingDown,
      color: 'text-red-600',
      isMoney: true
    },
  ] : []

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="font-display text-2xl text-foreground mb-1">Hoş Geldiniz</h2>
        <p className="text-muted-foreground">Bugün {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{card.value}</div>
              {card.total !== null && (
                <p className="text-xs text-muted-foreground mt-1">Toplam: {card.total}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {financeCards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {financeCards.map((card) => (
            <Card key={card.title} className="border-border/50 bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-display font-bold ${card.isMoney ? (card.color === 'text-green-600' ? 'text-green-600' : 'text-red-600') : ''}`}>
                  {card.value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(userRole === 'admin' || userRole === 'assistant') && (
        <>
          {statusDistribution.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Dosya Durumu Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {lawyerCaseCounts.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Avukata Göre Aktif Dosya Sayısı</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={lawyerCaseCounts}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Dosya Sayısı" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}