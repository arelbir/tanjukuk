import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardStats, MonthlyTrend, LawyerCaseCount } from '@/types/dashboard-v3'
import { CollapsibleCard } from '@/components/dashboard/v3/CollapsibleCard'
import { 
  TrendingUp, 
  Users, 
  ArrowRight,
  FolderKanban,
  Scale
} from 'lucide-react'
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts'
import Link from 'next/link'

interface GrowthLensProps {
  stats: DashboardStats
  monthlyTrends: MonthlyTrend[]
  lawyerCaseCounts: LawyerCaseCount[]
}

export function GrowthLens({ stats, monthlyTrends, lawyerCaseCounts }: GrowthLensProps) {
  // Calculate growth metrics
  const caseGrowthRate = monthlyTrends.length >= 2 
    ? ((monthlyTrends[monthlyTrends.length - 1].cases - monthlyTrends[monthlyTrends.length - 2].cases) / 
       (monthlyTrends[monthlyTrends.length - 2].cases || 1)) * 100
    : 0

  const avgCasesPerMonth = monthlyTrends.length > 0
    ? (monthlyTrends.reduce((sum, m) => sum + m.cases, 0) / monthlyTrends.length).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      {/* Growth Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Toplam Müvekkil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">
              {stats.totalClients}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktif dosya başına: {(stats.totalClients / (stats.activeCases || 1)).toFixed(1)} müvekkil
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              Aylık Ortalama Dosya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">
              {avgCasesPerMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Son 6 ay
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dosya Büyüme Oranı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-display font-bold ${caseGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {caseGrowthRate >= 0 ? '+' : ''}{caseGrowthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Geçen aya göre
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Case & Event Trends */}
      <Card className="border-border/50 bg-card/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Büyüme Trendleri</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Dosya ve etkinlik sayıları
              </p>
            </div>
            <Link href="/cases">
              <Button variant="ghost" size="sm" className="text-xs">
                Detaylar
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="cases"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Yeni Dosyalar"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="hearings"
                stroke="#10b981"
                strokeWidth={2}
                name="Etkinlikler"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lawyer Workload Distribution */}
      {lawyerCaseCounts.length > 0 && (
        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader>
            <div>
              <CardTitle className="text-lg">Avukat Yük Dağılımı</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Aktif dosya sayısı göre
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lawyerCaseCounts}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Aktif Dosya Sayısı" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Growth Insights */}
      <CollapsibleCard 
        title="Büyüme Analizi"
        icon={<Scale className="w-5 h-5 text-muted-foreground" />}
        defaultOpen={false}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Dosya Kapasitesi</p>
              <p className="text-xs text-muted-foreground">
                Mevcut avukat sayısı: {lawyerCaseCounts.length}
              </p>
            </div>
            <div className="text-sm font-medium text-foreground">
              {lawyerCaseCounts.length > 0 
                ? (stats.activeCases / lawyerCaseCounts.length).toFixed(1)
                : 0} dosya/avukat
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Etkinlik Yoğunluğu</p>
              <p className="text-xs text-muted-foreground">
                Bu hafta
              </p>
            </div>
            <div className={`text-sm font-medium ${
              stats.weekHearings > 10 ? 'text-amber-600' : 'text-green-600'
            }`}>
              {stats.weekHearings} etkinlik
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Müvekkil Büyümesi</p>
              <p className="text-xs text-muted-foreground">
                Toplam müvekkil
              </p>
            </div>
            <div className="text-sm font-medium text-foreground">
              {stats.totalClients}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Tamamlanma Oranı</p>
              <p className="text-xs text-muted-foreground">
                Tamamlanan dosyalar
              </p>
            </div>
            <div className="text-sm font-medium text-foreground">
              %{((stats.totalCases - stats.activeCases) / (stats.totalCases || 1) * 100).toFixed(1)}
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  )
}
