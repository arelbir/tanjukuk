import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function TodaySummaryRail({ overdueCount = 0 }: { overdueCount?: number }) {
  if (overdueCount <= 0) return null

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-lg font-semibold">Dikkat gerektirenler</h2>
        <p className="text-sm text-muted-foreground">Geciken veya bugün aksiyon bekleyen kayıtlar</p>
      </div>

      <Link href="/calendar?tab=overdue" className="block">
        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 via-card to-card p-4 shadow-sm transition-colors hover:border-rose-300 hover:bg-rose-50/70">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-100 text-rose-600">
                <AlertTriangle className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{overdueCount} geciken iş var</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Ajandadaki geciken kayıtları kontrol edin.</p>
              </div>
            </div>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-rose-100 px-3 text-sm font-semibold text-rose-700">
              Gecikenleri gör
              <ArrowRight className="size-4" />
            </span>
          </div>
        </Card>
      </Link>
    </section>
  )
}
