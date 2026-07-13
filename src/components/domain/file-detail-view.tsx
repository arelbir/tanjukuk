'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Landmark, UserRound, WalletCards } from 'lucide-react'
import { AgendaItemCard, DocumentCard, FinanceCard } from '@/components/domain/cards'
import { FileArchiveButton } from '@/components/domain/file-archive-button'
import { agenda, documents, financeItems, type files } from '@/components/domain/demo-data'
import { SegmentedControl } from '@/components/primitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type FileItem = (typeof files)[number]

type DetailTab = 'overview' | 'agenda' | 'finance' | 'documents' | 'history'

interface FileDetailViewProps {
  file: FileItem
}

export function FileDetailView({ file }: FileDetailViewProps) {
  const [tab, setTab] = useState<DetailTab>('overview')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="size-4" />
          Geri
        </Button>
        <div className="flex items-center gap-2">
          <FileArchiveButton id={file.id} type={file.type} label={file.code} redirectTo="/files" />
          <Link href="/files" className="text-sm font-medium text-primary hover:underline">Tüm dosyalar</Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border bg-primary px-4 py-4 text-primary-foreground">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-85">Dosya</p>
                  <h1 className="mt-1 text-xl font-semibold tracking-tight">{file.code}</h1>
                </div>
                <Badge variant="secondary">{file.type === 'case' ? 'Dava' : 'İcra'}</Badge>
              </div>
              <p className="mt-2 text-sm opacity-90">{file.client}</p>
            </div>
            <div className="space-y-3 p-4 text-sm">
              <div className="flex items-start gap-2">
                <UserRound className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Sorumlu</p>
                  <p className="font-medium">{file.responsible}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Landmark className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Mahkeme / daire</p>
                  <p className="font-medium">{file.court}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <WalletCards className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tutar / değer</p>
                  <p className="font-medium">{file.amount}</p>
                </div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs text-muted-foreground">Durum</p>
                <p className="font-medium">{file.status}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Kısa özet</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {file.counterparty} karşı taraflı dosyada sonraki ajanda: {file.nextAgenda}. Finans özeti: {file.finance}.
            </p>
          </Card>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="sticky top-[4.25rem] z-20 -mx-4 border-y border-border bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <SegmentedControl<DetailTab>
              value={tab}
              onChange={setTab}
              options={[
                { value: 'overview', label: 'Genel' },
                { value: 'agenda', label: 'Ajanda', count: agenda.length },
                { value: 'finance', label: 'Finans', count: financeItems.length },
                { value: 'documents', label: 'Belgeler', count: documents.length },
                { value: 'history', label: 'Geçmiş' },
              ]}
              ariaLabel="Dosya detay bölümleri"
            />
          </div>

          {tab === 'overview' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Müvekkil</p>
                <p className="mt-1 text-lg font-semibold">{file.client}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Karşı taraf</p>
                <p className="mt-1 text-lg font-semibold">{file.counterparty}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Sonraki ajanda</p>
                <p className="mt-1 font-semibold">{file.nextAgenda}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Finans özeti</p>
                <p className="mt-1 font-semibold">{file.finance}</p>
              </Card>
            </div>
          ) : null}

          {tab === 'agenda' ? <div className="space-y-3">{agenda.map((item) => <AgendaItemCard key={item.id} item={item} />)}</div> : null}
          {tab === 'finance' ? <div className="space-y-3">{financeItems.map((item) => <FinanceCard key={item.id} item={item} />)}</div> : null}
          {tab === 'documents' ? <div className="space-y-3">{documents.map((item) => <DocumentCard key={item.id} document={item} />)}</div> : null}
          {tab === 'history' ? (
            <div className="space-y-3">
              {['Dosya özeti görüntülendi', 'Duruşma tarihi eklendi', 'Tahsilat beklentisi oluşturuldu'].map((item, index) => (
                <Card key={item} className="flex items-start gap-3 p-4">
                  <span className="mt-1 flex size-8 items-center justify-center rounded-md bg-muted text-xs font-semibold">{index + 1}</span>
                  <div>
                    <p className="font-medium">{item}</p>
                    <p className="text-sm text-muted-foreground">Demo Yönetici · Bugün</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
