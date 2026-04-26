import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardStats, InsightCard } from '@/types/dashboard-v3'
import { CollapsibleCard } from '@/components/dashboard/v3/CollapsibleCard'
import { 
  Shield,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

interface RiskLensProps {
  stats: DashboardStats
}

export function RiskLens({ stats }: RiskLensProps) {
  // Calculate risk metrics
  const workloadRisk = stats.weekHearings > 10 ? 'high' : stats.weekHearings > 5 ? 'medium' : 'low'
  const financialRisk = stats.monthExpenses > stats.monthIncome ? 'high' : stats.monthExpenses > stats.monthIncome * 0.8 ? 'medium' : 'low'
  
  // Generate insight cards based on data
  const insights: InsightCard[] = []

  // Workload risk
  if (workloadRisk === 'high') {
    insights.push({
      type: 'danger',
      title: 'Yüksek İş Yükü',
      message: `Bu hafta ${stats.weekHearings} etkinlik planlandı. Kapasite aşımı riski var.`,
      action: {
        label: 'Etkinlikleri Gör',
        href: '/calendar'
      },
      metric: `${stats.weekHearings} etkinlik`
    })
  } else if (workloadRisk === 'medium') {
    insights.push({
      type: 'warning',
      title: 'Orta İş Yükü',
      message: `Bu hafta ${stats.weekHearings} etkinlik planlandı. Dikkatli planlama önerilir.`,
      action: {
        label: 'Etkinlikleri Gör',
        href: '/calendar'
      },
      metric: `${stats.weekHearings} etkinlik`
    })
  }

  // Financial risk
  if (financialRisk === 'high') {
    insights.push({
      type: 'danger',
      title: 'Finansal Risk',
      message: `Giderler geliri aşıyor. Net zarar: ${(stats.monthExpenses - stats.monthIncome).toLocaleString('tr-TR')} ₺`,
      action: {
        label: 'Giderleri Gör',
        href: '/expenses'
      },
      metric: `-${(stats.monthExpenses - stats.monthIncome).toLocaleString('tr-TR')} ₺`
    })
  } else if (financialRisk === 'medium') {
    insights.push({
      type: 'warning',
      title: 'Finansal Uyarı',
      message: 'Giderler gelirin %80&apos;ini aşıyor. Masrafları gözden geçirin.',
      action: {
        label: 'Giderleri Gör',
        href: '/expenses'
      },
      metric: '%80+'
    })
  }

  // Case completion risk
  const completionRate = (stats.totalCases - stats.activeCases) / (stats.totalCases || 1)
  if (completionRate < 0.3 && stats.totalCases > 10) {
    insights.push({
      type: 'warning',
      title: 'Düşük Tamamlanma Oranı',
      message: `Sadece %{(completionRate * 100).toFixed(0)} dosya tamamlandı. Dosya kapanış süreleri uzun.`,
      action: {
        label: 'Dosyaları Gör',
        href: '/cases'
      },
      metric: `%${(completionRate * 100).toFixed(0)}`
    })
  }

  // Add positive insight if no risks
  if (insights.length === 0) {
    insights.push({
      type: 'success',
      title: 'Risk Yok',
      message: 'Tüm metrikler sağlıklı aralıkta. İyi gidiyorsunuz!',
      metric: 'Stabil'
    })
  }

  return (
    <div className="space-y-6">
      {/* Risk Insights */}
      <CollapsibleCard 
        title="Risk Analizi"
        icon={<AlertCircle className="w-5 h-5 text-muted-foreground" />}
        defaultOpen={false}
      >
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.title}
              className="p-4 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={`${
                    insight.type === 'danger' ? 'bg-red-100 text-red-700 border-red-200' :
                    insight.type === 'warning' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-green-100 text-green-700 border-green-200'
                  }`}>
                    {insight.type === 'danger' ? 'Yüksek' :
                     insight.type === 'warning' ? 'Orta' : 'Düşük'}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">
                    {insight.title}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {insight.message}
              </p>
              {insight.action && (
                <Link href={insight.action.href || '/cases'}>
                  <Button variant="ghost" size="sm" className="text-xs">
                    {insight.action.label}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Risk Mitigation */}
      <CollapsibleCard 
        title="Risk Azaltma Önerileri"
        icon={<Shield className="w-5 h-5 text-muted-foreground" />}
        defaultOpen={false}
      >
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                İş yükü dengesizliği için yeni personel alımı
              </p>
              <p className="text-xs text-muted-foreground">
                Mevcut iş yükü kapasitenin %80 üzerinde
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                Nakit akışı yönetimi için ödeme planları
              </p>
              <p className="text-xs text-muted-foreground">
                Müvekkillerle taksitli ödeme anlaşmaları
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                Duruşma öncesi hazırlık süreci otomasyonu
              </p>
              <p className="text-xs text-muted-foreground">
                Şablon ve hatırlatıcı sistemi kurulumu
              </p>
            </div>
          </div>
        </div>
      </CollapsibleCard>
    </div>
  )
}
