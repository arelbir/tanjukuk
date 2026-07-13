import { AppShell } from '@/components/layout/app-shell'
import { Card } from '@/components/ui/card'
import { requirePageContext } from '@/lib/auth/page'
import { getFinanceSummary, listExpenses, listPayments, listReceivables } from '@/features/finance/repository'

function money(value: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)
}

export default async function FinancePage() {
  const { supabase, user, unreadCount } = await requirePageContext()
  const [summary, receivables, payments, expenses] = await Promise.all([
    getFinanceSummary(supabase),
    listReceivables(supabase),
    listPayments(supabase),
    listExpenses(supabase),
  ])

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="border-sky-100 bg-sky-50/60 p-4"><p className="text-sm text-sky-700">Alacak</p><p className="text-2xl font-semibold">{money(summary.remainingTotal)}</p></Card>
          <Card className="border-emerald-100 bg-emerald-50/60 p-4"><p className="text-sm text-emerald-700">Tahsilat</p><p className="text-2xl font-semibold">{money(summary.paymentTotal)}</p></Card>
          <Card className="border-orange-100 bg-orange-50/60 p-4"><p className="text-sm text-orange-700">Gider</p><p className="text-2xl font-semibold">{money(summary.expenseTotal)}</p></Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Alacaklar</h2>
          {receivables.length > 0 ? receivables.slice(0, 10).map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.client?.name || 'Müvekkil yok'}</p>
                  <p className="text-sm text-muted-foreground">{item.description || item.case_file?.file_code || item.enforcement_file?.file_code || 'Alacak'}</p>
                </div>
                <p className="font-semibold text-sky-700">{money(Number(item.remaining_amount || 0))}</p>
              </div>
            </Card>
          )) : <EmptyFinance label="Alacak kaydı yok." />}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tahsilatlar</h2>
          {payments.length > 0 ? payments.slice(0, 10).map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.client?.name || 'Müvekkil yok'}</p>
                  <p className="text-sm text-muted-foreground">{item.description || item.payment_date}</p>
                </div>
                <p className="font-semibold text-emerald-700">{money(Number(item.amount || 0))}</p>
              </div>
            </Card>
          )) : <EmptyFinance label="Tahsilat kaydı yok." />}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Giderler</h2>
          {expenses.length > 0 ? expenses.slice(0, 10).map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.category?.label || 'Gider'}</p>
                  <p className="text-sm text-muted-foreground">{item.description || item.expense_date}</p>
                </div>
                <p className="font-semibold text-orange-700">{money(Number(item.amount || 0))}</p>
              </div>
            </Card>
          )) : <EmptyFinance label="Gider kaydı yok." />}
        </section>
      </div>
    </AppShell>
  )
}

function EmptyFinance({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">{label}</div>
}
