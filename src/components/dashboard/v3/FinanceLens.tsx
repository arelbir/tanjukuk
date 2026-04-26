import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardStats, MonthlyTrend } from '@/types/dashboard-v3'
import { CollapsibleCard } from '@/components/dashboard/v3/CollapsibleCard'
import { CaseProfitabilityCard } from '@/components/dashboard/v3/CaseProfitabilityCard'
import { predictNext } from '@/lib/predictions/TrendAnalyzer'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowRight,
  PieChart
} from 'lucide-react'
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import Link from 'next/link'

interface FinanceLensProps {
  stats: DashboardStats
  monthlyTrends: MonthlyTrend[]
}

export function FinanceLens({ stats, monthlyTrends }: FinanceLensProps) {
  const netProfit = stats.monthIncome - stats.monthExpenses
  const profitMargin = stats.monthIncome > 0 ? ((netProfit / stats.monthIncome) * 100).toFixed(1) : '0'

  // Generate predictions using trend analysis
  const monthlyIncome = monthlyTrends.map(m => m.income)
  const incomePred = predictNext(monthlyIncome, 'ensemble')

  // Prepare chart data - combine historical trends with predictions
  const chartData = [
    ...monthlyTrends.slice(-4).map(m => ({
      month: m.month,
      income: m.income,
      expenses: m.expenses,
      net: m.income - m.expenses,
      predicted: false
    })),
    {
      month: 'Tahmin',
      income: incomePred.predicted,
      expenses: incomePred.predicted * 0.3, // Estimate expenses as 30% of income
      net: incomePred.predicted * 0.7,
      predicted: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Bu Ay Gelir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-green-600">
              {stats.monthIncome.toLocaleString('tr-TR')} ₺
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ortalama aylık: {monthlyTrends.length > 0 
                ? (monthlyTrends.reduce((sum, m) => sum + m.income, 0) / monthlyTrends.length).toLocaleString('tr-TR', { maximumFractionDigits: 0 })
                : 0} ₺
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Bu Ay Gider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-red-600">
              {stats.monthExpenses.toLocaleString('tr-TR')} ₺
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gelirin %{stats.monthIncome > 0 ? ((stats.monthExpenses / stats.monthIncome) * 100).toFixed(1) : 0}&apos;i
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              Net Kar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-display font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netProfit.toLocaleString('tr-TR')} ₺
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kar marjı: %{profitMargin}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card className="border-border/50 bg-card/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Nakit Akışı</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Geçmiş 4 ay + gelecek 3 ay tahmini
              </p>
            </div>
            <Link href="/income">
              <Button variant="ghost" size="sm" className="text-xs">
                Detaylar
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Gelir"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Gider"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Financial Health Insights */}
      <CollapsibleCard 
        title="Finansal Sağlık Analizi"
        icon={<PieChart className="w-5 h-5 text-muted-foreground" />}
        defaultOpen={false}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Gelir/Gider Oranı</p>
              <p className="text-xs text-muted-foreground">
                {stats.monthIncome > 0 
                  ? ((stats.monthIncome / stats.monthExpenses)).toFixed(2)
                  : 0}
              </p>
            </div>
            <div className={`text-sm font-medium ${
              stats.monthIncome > stats.monthExpenses ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.monthIncome > stats.monthExpenses ? 'Sağlıklı' : 'Riskli'}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Aylık Ortalama Gelir</p>
              <p className="text-xs text-muted-foreground">
                Son 6 ay
              </p>
            </div>
            <div className="text-sm font-medium text-foreground">
              {monthlyTrends.length > 0 
                ? (monthlyTrends.reduce((sum, m) => sum + m.income, 0) / monthlyTrends.length).toLocaleString('tr-TR', { maximumFractionDigits: 0 })
                : 0} ₺
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Gelir Trendi</p>
              <p className="text-xs text-muted-foreground">
                Son ay vs önceki ay
              </p>
            </div>
            {monthlyTrends.length >= 2 && monthlyTrends[monthlyTrends.length - 2].income > 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                monthlyTrends[monthlyTrends.length - 1].income > monthlyTrends[monthlyTrends.length - 2].income
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {monthlyTrends[monthlyTrends.length - 1].income > monthlyTrends[monthlyTrends.length - 2].income ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(
                  ((monthlyTrends[monthlyTrends.length - 1].income - monthlyTrends[monthlyTrends.length - 2].income) / 
                  monthlyTrends[monthlyTrends.length - 2].income) * 100
                ).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </CollapsibleCard>

      {/* Case Profitability Report */}
      <CaseProfitabilityCard />
    </div>
  )
}
