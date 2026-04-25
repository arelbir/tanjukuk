'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Client } from '@/types/client'

interface ClientCaseSummary {
  id: string
  case_code: string
  opposing_party: string
  opened_at: string
  status?: { label: string } | null
}

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [cases, setCases] = useState<ClientCaseSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadClientDetails() {
      const [{ data: clientData }, { data: caseData }] = await Promise.all([
        supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single(),
        supabase
          .from('cases')
          .select('id, case_code, opposing_party, opened_at, status:lookup_values!cases_status_id_fkey(label)')
          .eq('client_id', clientId)
          .order('opened_at', { ascending: false }),
      ])

      setClient(clientData || null)
      setCases((caseData as ClientCaseSummary[] | null) || [])
      setLoading(false)
    }

    void loadClientDetails()
  }, [clientId])

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Yükleniyor...</div>
  }

  if (!client) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Müvekkil bulunamadı</div>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display">{client.name}</h1>
          <p className="text-sm text-muted-foreground">
            {client.type === 'individual' ? 'Bireysel Müvekkil' : 'Şirket Müvekkil'}
          </p>
        </div>
        <Link href="/clients">
          <Button variant="outline">Listeye Dön</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>İletişim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Telefon:</span> {client.phone || '-'}</p>
            <p><span className="font-medium">E-posta:</span> {client.email || '-'}</p>
            <p><span className="font-medium">Vergi No:</span> {client.tax_no || '-'}</p>
            <p><span className="font-medium">Adres:</span> {client.address || '-'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kayıt Bilgisi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Kayıt Tarihi:</span> {new Date(client.created_at).toLocaleDateString('tr-TR')}</p>
            <p><span className="font-medium">Son Güncelleme:</span> {client.updated_at ? new Date(client.updated_at).toLocaleDateString('tr-TR') : '-'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İlgili Dosyalar</CardTitle>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <div className="text-sm text-muted-foreground">Bu müvekkile bağlı dosya bulunamadı.</div>
          ) : (
            <div className="space-y-3">
              {cases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}`}
                  className="block rounded-lg border p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{caseItem.case_code}</p>
                      <p className="text-sm text-muted-foreground">Karşı taraf: {caseItem.opposing_party}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{caseItem.status?.label || '-'}</p>
                      <p>{new Date(caseItem.opened_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
