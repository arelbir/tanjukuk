'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Edit } from 'lucide-react'
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
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Client>>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
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
  }, [clientId, supabase])

  const handleEditClick = () => {
    if (client) {
      setEditFormData(client)
      setIsEditDrawerOpen(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!client) return
    setSaving(true)

    const { error } = await supabase
      .from('clients')
      .update({
        name: editFormData.name,
        type: editFormData.type,
        phone: editFormData.phone,
        email: editFormData.email,
        tax_no: editFormData.tax_no,
        address: editFormData.address,
      })
      .eq('id', clientId)

    setSaving(false)

    if (error) {
      toast.error('Müvekkil güncellenirken hata oluştu')
      return
    }

    toast.success('Müvekkil başarıyla güncellendi')
    setIsEditDrawerOpen(false)

    const { data: updatedClient } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    setClient(updatedClient || null)
  }

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
          <Link href="/clients">
            <Button variant="outline">Listeye Dön</Button>
          </Link>
        </div>
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

      <Dialog open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Müvekkil Düzenle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Ad</Label>
              <Input
                id="name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tür</Label>
              <select
                id="type"
                value={editFormData.type || 'individual'}
                onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as 'individual' | 'company' })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="individual">Bireysel</option>
                <option value="company">Şirket</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tax_no">Vergi No</Label>
              <Input
                id="tax_no"
                value={editFormData.tax_no || ''}
                onChange={(e) => setEditFormData({ ...editFormData, tax_no: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDrawerOpen(false)}>İptal</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
