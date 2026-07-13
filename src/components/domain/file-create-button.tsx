'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, FolderPlus, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogCloseButton, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SelectField } from '@/components/primitives/select-field'
import { SegmentedControl } from '@/components/primitives/segmented-control'

export interface FileCreateOption {
  value: string
  label: string
}

export interface FileCreateOptions {
  clients: FileCreateOption[]
  lawyers: FileCreateOption[]
  caseTypes: FileCreateOption[]
  caseStatuses: FileCreateOption[]
  clientRoles: FileCreateOption[]
  enforcementTypes: FileCreateOption[]
  enforcementStatuses: FileCreateOption[]
}

interface FileCreateButtonProps {
  options: FileCreateOptions
}

type FileKind = 'case' | 'enforcement'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function FileCreateButton({ options }: FileCreateButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<FileKind>('case')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientId, setClientId] = useState('')
  const [lawyerId, setLawyerId] = useState('')
  const [opposingParty, setOpposingParty] = useState('')
  const [debtorParty, setDebtorParty] = useState('')
  const [clientRoleId, setClientRoleId] = useState('')
  const [clientPosition, setClientPosition] = useState('creditor')
  const [caseTypeId, setCaseTypeId] = useState('')
  const [caseStatusId, setCaseStatusId] = useState('')
  const [enforcementTypeId, setEnforcementTypeId] = useState('')
  const [enforcementStatusId, setEnforcementStatusId] = useState('')
  const [courtCity, setCourtCity] = useState('')
  const [courtNo, setCourtNo] = useState('')
  const [officeCity, setOfficeCity] = useState('')
  const [enforcementOffice, setEnforcementOffice] = useState('')
  const [openedAt, setOpenedAt] = useState(today())
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const submitDisabled = useMemo(() => {
    if (!clientId) return true
    if (kind === 'case') return opposingParty.trim().length < 2
    return debtorParty.trim().length < 2
  }, [clientId, debtorParty, kind, opposingParty])

  function reset() {
    setClientId('')
    setLawyerId('')
    setOpposingParty('')
    setDebtorParty('')
    setClientRoleId('')
    setClientPosition('creditor')
    setCaseTypeId('')
    setCaseStatusId('')
    setEnforcementTypeId('')
    setEnforcementStatusId('')
    setCourtCity('')
    setCourtNo('')
    setOfficeCity('')
    setEnforcementOffice('')
    setOpenedAt(today())
    setAmount('')
    setDescription('')
    setError(null)
  }

  async function submit() {
    setBusy(true)
    setError(null)

    const endpoint = kind === 'case' ? '/api/cases' : '/api/enforcements'
    const body = kind === 'case'
      ? {
          client_id: clientId,
          lawyer_id: lawyerId,
          opposing_party: opposingParty,
          client_role_id: clientRoleId,
          case_type_id: caseTypeId,
          status_id: caseStatusId,
          court_city: courtCity,
          court_district: '',
          court_type_id: '',
          court_no: courtNo,
          file_year: '',
          file_no: '',
          opened_at: openedAt,
          case_value: amount,
          currency: 'TRY',
          description,
          notes: '',
        }
      : {
          client_id: clientId,
          lawyer_id: lawyerId,
          debtor_party: debtorParty,
          client_position: clientPosition,
          enforcement_type_id: enforcementTypeId,
          status_id: enforcementStatusId,
          office_city: officeCity,
          enforcement_office: enforcementOffice,
          file_year: '',
          file_no: '',
          opened_at: openedAt,
          principal_amount: amount,
          interest_amount: '',
          expense_amount: '',
          collected_amount: '',
          currency: 'TRY',
          description,
          notes: '',
        }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(payload.error || 'Dosya oluşturulamadı')
      setBusy(false)
      return
    }

    const created = kind === 'case' ? payload.caseFile : payload.enforcementFile
    setBusy(false)
    setOpen(false)
    reset()
    router.refresh()
    if (created?.id) {
      router.push(`/files/${kind}/${created.id}`)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <FolderPlus className="size-4" />
        Dosya aç
      </Button>

      <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) reset() }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogCloseButton onClick={() => setOpen(false)} />
          <DialogHeader>
            <DialogTitle>Yeni dosya aç</DialogTitle>
            <DialogDescription>Dava veya icra dosyasını temel bilgilerle hızlıca oluşturun. Detayları dosya ekranından tamamlayabilirsiniz.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <SegmentedControl<FileKind>
              value={kind}
              onChange={setKind}
              options={[
                { value: 'case', label: 'Dava dosyası' },
                { value: 'enforcement', label: 'İcra dosyası' },
              ]}
              ariaLabel="Dosya türü"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Müvekkil</p>
                <SelectField value={clientId} onChange={setClientId} options={options.clients} placeholder="Müvekkil seçin" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Sorumlu</p>
                <SelectField value={lawyerId} onChange={setLawyerId} options={options.lawyers} placeholder="Sorumlu seçin" />
              </div>
            </div>

            {kind === 'case' ? (
              <div className="space-y-4 rounded-2xl border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Briefcase className="size-4 text-primary" />
                  Dava bilgileri
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Karşı taraf</p>
                    <Input value={opposingParty} onChange={(event) => setOpposingParty(event.target.value)} placeholder="Karşı taraf adı" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Müvekkil sıfatı</p>
                    <SelectField value={clientRoleId} onChange={setClientRoleId} options={options.clientRoles} placeholder="Sıfat seçin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Dava türü</p>
                    <SelectField value={caseTypeId} onChange={setCaseTypeId} options={options.caseTypes} placeholder="Dava türü seçin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Durum</p>
                    <SelectField value={caseStatusId} onChange={setCaseStatusId} options={options.caseStatuses} placeholder="Durum seçin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Mahkeme ili</p>
                    <Input value={courtCity} onChange={(event) => setCourtCity(event.target.value)} placeholder="İstanbul" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Mahkeme / esas bilgisi</p>
                    <Input value={courtNo} onChange={(event) => setCourtNo(event.target.value)} placeholder="4. Asliye Ticaret" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Landmark className="size-4 text-primary" />
                  İcra bilgileri
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Borçlu taraf</p>
                    <Input value={debtorParty} onChange={(event) => setDebtorParty(event.target.value)} placeholder="Borçlu adı" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Müvekkil pozisyonu</p>
                    <SelectField value={clientPosition} onChange={setClientPosition} options={[{ value: 'creditor', label: 'Alacaklı' }, { value: 'debtor', label: 'Borçlu' }]} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Takip türü</p>
                    <SelectField value={enforcementTypeId} onChange={setEnforcementTypeId} options={options.enforcementTypes} placeholder="Takip türü seçin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Durum</p>
                    <SelectField value={enforcementStatusId} onChange={setEnforcementStatusId} options={options.enforcementStatuses} placeholder="Durum seçin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">İcra ili</p>
                    <Input value={officeCity} onChange={(event) => setOfficeCity(event.target.value)} placeholder="İstanbul" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">İcra dairesi</p>
                    <Input value={enforcementOffice} onChange={(event) => setEnforcementOffice(event.target.value)} placeholder="Bakırköy 7. İcra Dairesi" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Açılış tarihi</p>
                <Input type="date" value={openedAt} onChange={(event) => setOpenedAt(event.target.value)} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Tutar / değer</p>
                <Input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="0" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Açıklama</p>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Kısa not veya dosya özeti" />
            </div>

            {error ? <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Vazgeç</Button>
            <Button onClick={submit} disabled={busy || submitDisabled}>{kind === 'case' ? 'Dava dosyası aç' : 'İcra dosyası aç'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
