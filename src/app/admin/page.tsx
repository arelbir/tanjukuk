import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ClipboardList, Database, ShieldCheck, Users } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { requirePageContext } from '@/lib/auth/page'

const adminCards = [
  {
    title: 'Kullanıcı yönetimi',
    description: 'Kullanıcıları, rolleri ve aktif/pasif durumlarını yönetin.',
    href: '/admin/users',
    icon: Users,
    tone: 'bg-blue-50 text-blue-700 border-blue-100',
    badge: 'Yetkiler',
  },
  {
    title: 'Seçim listeleri',
    description: 'Formlardaki dava türü, mahkeme, müvekkil tipi, ödeme yöntemi ve finans kategorilerini yönetin.',
    href: '/admin/lookups',
    icon: Database,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    badge: 'Lookup',
  },
  {
    title: 'Audit log',
    description: 'Kritik yönetim ve kayıt işlemlerinin iz kayıtlarını inceleyin.',
    href: '/admin/audit',
    icon: ShieldCheck,
    tone: 'bg-violet-50 text-violet-700 border-violet-100',
    badge: 'Güvenlik',
  },
]

export default async function AdminPage() {
  const { user, unreadCount } = await requirePageContext()

  if (user.role !== 'admin') {
    redirect('/home')
  }

  return (
    <AppShell user={user} unreadCount={unreadCount}>
      <div className="space-y-5">
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-r from-slate-950 via-primary to-indigo-600 p-5 text-white">
            <div className="flex items-start gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <ClipboardList className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-white/75">Admin yönetimi</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">Uygulama ayarları ve yönetim merkezi</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                  Kullanıcı yetkileri, formlardaki seçim listeleri, finans kategorileri, dava/icra ayarları ve audit kayıtları buradan yönetilir.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-3">
          {adminCards.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                <Card className="h-full space-y-4 p-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex size-11 items-center justify-center rounded-2xl border ${item.tone}`}>
                      <Icon className="size-5" />
                    </span>
                    <Badge variant="outline">{item.badge}</Badge>
                  </div>
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
