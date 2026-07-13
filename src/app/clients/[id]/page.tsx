import { notFound } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { DocumentCard, FileCard, FinanceCard } from '@/components/domain/cards'
import { clients, demoUser, documents, files, financeItems, notifications } from '@/components/domain/demo-data'
import { Card } from '@/components/ui/card'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = clients.find((item) => item.id === id)
  if (!client) notFound()
  const unreadCount = notifications.filter((item) => item.unread).length

  return (
    <AppShell user={demoUser} unreadCount={unreadCount}>
      <div className="space-y-4">
        <Card className="p-4"><h2 className="text-xl font-semibold">{client.name}</h2><p className="text-sm text-muted-foreground">{client.type} · {client.contact}</p><p className="mt-2 text-sm font-medium">{client.activeFiles} aktif dosya</p></Card>
        <section className="space-y-3"><h3 className="text-lg font-semibold">Dosyalar</h3>{files.slice(0, 2).map((item) => <FileCard key={item.id} file={item} />)}</section>
        <section className="space-y-3"><h3 className="text-lg font-semibold">Belgeler</h3>{documents.slice(0, 2).map((item) => <DocumentCard key={item.id} document={item} />)}</section>
        <section className="space-y-3"><h3 className="text-lg font-semibold">Finans özeti</h3>{financeItems.slice(0, 2).map((item) => <FinanceCard key={item.id} item={item} />)}</section>
      </div>
    </AppShell>
  )
}
