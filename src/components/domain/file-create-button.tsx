'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, FolderPlus, Landmark, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { SelectField } from '@/components/primitives/select-field'
import { SegmentedControl } from '@/components/primitives/segmented-control'
import { UYAP_FILE_KIND_OPTIONS } from '@/lib/uyap-file-name'

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
  courtTypes: FileCreateOption[]
  enforcementTypes: FileCreateOption[]
  enforcementStatuses: FileCreateOption[]
}

interface FileCreateButtonProps {
  options: FileCreateOptions
}

type FileKind = 'case' | 'enforcement'

const TURKISH_CITY_OPTIONS: FileCreateOption[] = [
  'Adana',
  'Adıyaman',
  'Afyonkarahisar',
  'Ağrı',
  'Aksaray',
  'Amasya',
  'Ankara',
  'Antalya',
  'Ardahan',
  'Artvin',
  'Aydın',
  'Balıkesir',
  'Bartın',
  'Batman',
  'Bayburt',
  'Bilecik',
  'Bingöl',
  'Bitlis',
  'Bolu',
  'Burdur',
  'Bursa',
  'Çanakkale',
  'Çankırı',
  'Çorum',
  'Denizli',
  'Diyarbakır',
  'Düzce',
  'Edirne',
  'Elazığ',
  'Erzincan',
  'Erzurum',
  'Eskişehir',
  'Gaziantep',
  'Giresun',
  'Gümüşhane',
  'Hakkâri',
  'Hatay',
  'Iğdır',
  'Isparta',
  'İstanbul',
  'İzmir',
  'Kahramanmaraş',
  'Karabük',
  'Karaman',
  'Kars',
  'Kastamonu',
  'Kayseri',
  'Kırıkkale',
  'Kırklareli',
  'Kırşehir',
  'Kilis',
  'Kocaeli',
  'Konya',
  'Kütahya',
  'Malatya',
  'Manisa',
  'Mardin',
  'Mersin',
  'Muğla',
  'Muş',
  'Nevşehir',
  'Niğde',
  'Ordu',
  'Osmaniye',
  'Rize',
  'Sakarya',
  'Samsun',
  'Siirt',
  'Sinop',
  'Sivas',
  'Şanlıurfa',
  'Şırnak',
  'Tekirdağ',
  'Tokat',
  'Trabzon',
  'Tunceli',
  'Uşak',
  'Van',
  'Yalova',
  'Yozgat',
  'Zonguldak',
].map((city) => ({ value: city, label: city }))

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
  const [courtDistrict, setCourtDistrict] = useState('')
  const [courtTypeId, setCourtTypeId] = useState('')
  const [fileYear, setFileYear] = useState(new Date().getFullYear().toString())
  const [fileNo, setFileNo] = useState('')
  const [uyapFileKind, setUyapFileKind] = useState('E')
  const [enforcementTypeId, setEnforcementTypeId] = useState('')
  const [enforcementStatusId, setEnforcementStatusId] = useState('')
  const [courtCity, setCourtCity] = useState('')
  const [courtNo, setCourtNo] = useState('')
  const [officeCity, setOfficeCity] = useState('')
  const [enforcementOffice, setEnforcementOffice] = useState('')
  const [openedAt, setOpenedAt] = useState(today())
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const courtTypeOptions = useMemo(
    () => options.courtTypes.map((option) => ({
      ...option,
      label: option.label.includes('İcra Hukuk') ? `${option.label} (mahkeme)` : option.label,
    })),
    [options.courtTypes]
  )

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
    setCourtDistrict('')
    setCourtTypeId('')
    setFileYear(new Date().getFullYear().toString())
    setFileNo('')
    setUyapFileKind('E')
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

  function closeDrawer() {
    setOpen(false)
    reset()
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
          court_district: courtDistrict,
          court_type_id: courtTypeId,
          court_no: courtNo,
          file_year: fileYear,
          file_no: fileNo,
          uyap_file_kind: uyapFileKind,
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
          file_year: fileYear,
          file_no: fileNo,
          uyap_file_kind: uyapFileKind,
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
    <Drawer open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) reset() }} direction="right">
      <Button onClick={() => setOpen(true)}>
        <FolderPlus className="size-4" />
        Dosya aç
      </Button>

      <DrawerContent className="w-full sm:max-w-xl lg:max-w-2xl">
        <DrawerHeader className="flex items-start justify-between gap-3">
          <div>
            <DrawerTitle>Yeni dosya aç</DrawerTitle>
            <DrawerDescription>Dava veya icra dosyasını temel bilgilerle oluşturun. Detayları dosya ekranından tamamlayabilirsiniz.</DrawerDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={closeDrawer} aria-label="Kapat">
            <X className="size-4" />
          </Button>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <SegmentedControl<FileKind>
              value={kind}
              onChange={setKind}
              options={[
                { value: 'case', label: 'Mahkeme / dava dosyası' },
                { value: 'enforcement', label: 'İcra takibi' },
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
                  Mahkeme / dava bilgileri
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
                    <SelectField value={courtCity} onChange={setCourtCity} options={TURKISH_CITY_OPTIONS} placeholder="İl seçin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Adliye / yargı çevresi</p>
                    <Input value={courtDistrict} onChange={(event) => setCourtDistrict(event.target.value)} placeholder="İstanbul Anadolu" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Mahkeme türü</p>
                    <SelectField value={courtTypeId} onChange={setCourtTypeId} options={courtTypeOptions} placeholder="Mahkeme türü seçin" />
                    <p className="text-xs leading-5 text-muted-foreground">İcra Hukuk Mahkemesi, icra dairesi değil; icra işlemlerine ilişkin şikayet/itiraz yargılaması içindir.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Mahkeme no</p>
                    <Input value={courtNo} onChange={(event) => setCourtNo(event.target.value)} inputMode="numeric" placeholder="8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">UYAP dosya yılı</p>
                    <Input value={fileYear} onChange={(event) => setFileYear(event.target.value)} inputMode="numeric" placeholder="2026" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">UYAP dosya no</p>
                    <Input value={fileNo} onChange={(event) => setFileNo(event.target.value)} inputMode="numeric" placeholder="123" />
                  </div>

                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Landmark className="size-4 text-primary" />
                  İcra takibi bilgileri
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
                    <SelectField value={officeCity} onChange={setOfficeCity} options={TURKISH_CITY_OPTIONS} placeholder="İl seçin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">İcra dairesi</p>
                    <Input value={enforcementOffice} onChange={(event) => setEnforcementOffice(event.target.value)} placeholder="Bakırköy 7. İcra Dairesi" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">UYAP dosya yılı</p>
                    <Input value={fileYear} onChange={(event) => setFileYear(event.target.value)} inputMode="numeric" placeholder="2026" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">UYAP dosya no</p>
                    <Input value={fileNo} onChange={(event) => setFileNo(event.target.value)} inputMode="numeric" placeholder="456" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-sm font-medium">UYAP sıra türü</p>
                    <SelectField value={uyapFileKind} onChange={setUyapFileKind} options={UYAP_FILE_KIND_OPTIONS} />
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
        </div>

        <DrawerFooter>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={closeDrawer} disabled={busy}>Vazgeç</Button>
            <Button onClick={submit} disabled={busy || submitDisabled}>{kind === 'case' ? 'Dava dosyası aç' : 'İcra dosyası aç'}</Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
