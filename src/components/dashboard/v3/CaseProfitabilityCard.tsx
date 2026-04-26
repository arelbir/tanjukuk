import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCaseProfitability } from '@/hooks/useCaseProfitability'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowRight,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function CaseProfitabilityCard() {
  const { data, loading, error } = useCaseProfitability()
  const [filter, setFilter] = useState<'all' | 'profitable' | 'loss'>('all')

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Dava Karlılık Raporu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border/50 bg-card/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Dava Karlılık Raporu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">Hata: {error}</div>
        </CardContent>
      </Card>
    )
  }

  const filteredData = data.filter((item) => {
    if (filter === 'profitable') return item.netProfit > 0
    if (filter === 'loss') return item.netProfit < 0
    return true
  })

  const totalIncome = data.reduce((sum, item) => sum + item.totalIncome, 0)
  const totalExpenses = data.reduce((sum, item) => sum + item.totalExpenses, 0)
  const totalProfit = totalIncome - totalExpenses
  const profitableCases = data.filter((item) => item.netProfit > 0).length
  const lossCases = data.filter((item) => item.netProfit < 0).length

  return (
    <Card className="border-border/50 bg-card/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Dava Karlılık Raporu</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Toplam {data.length} dava
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tümü
            </Button>
            <Button
              variant={filter === 'profitable' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('profitable')}
            >
              Karlı
            </Button>
            <Button
              variant={filter === 'loss' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('loss')}
            >
              Zararlı
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              Toplam Gelir
            </div>
            <div className="text-lg font-bold text-green-600">
              {totalIncome.toLocaleString('tr-TR')} ₺
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingDown className="w-4 h-4" />
              Toplam Gider
            </div>
            <div className="text-lg font-bold text-red-600">
              {totalExpenses.toLocaleString('tr-TR')} ₺
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              {totalProfit >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              Net Kar
            </div>
            <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit.toLocaleString('tr-TR')} ₺
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Filter className="w-4 h-4" />
              Karlı/Zararlı
            </div>
            <div className="text-lg font-bold">
              <span className="text-green-600">{profitableCases}</span>
              /
              <span className="text-red-600">{lossCases}</span>
            </div>
          </div>
        </div>

        {/* Case List */}
        <div className="space-y-3">
          {filteredData.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {filter === 'all' ? 'Henüz dava kaydı yok' : 'Bu filtreye uygun dava yok'}
            </div>
          ) : (
            filteredData.map((item) => (
              <div
                key={item.caseId}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {item.caseNumber}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.incomeCount} gelir / {item.expenseCount} gider
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.caseTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Müvekkil: {item.clientName}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-lg font-bold ${item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.netProfit >= 0 ? '+' : ''}{item.netProfit.toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-xs text-muted-foreground">
                    %{item.profitMargin.toFixed(1)} kar marjı
                  </div>
                </div>
                <Link href={`/cases/${item.caseId}`}>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
