'use client'

import { useState } from 'react'
import { FormSheet, SelectField } from '@/components/primitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type AgendaFormMode = 'task' | 'hearing'

export interface AgendaFormValues {
  title: string
  type: string
  dateTime: string
  file: string
  responsible: string
  description: string
}

interface AgendaFormSheetProps {
  open: boolean
  mode: AgendaFormMode
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AgendaFormValues) => void
}

const eventTypeOptions = [
  { value: 'Görev', label: 'Görev' },
  { value: 'Duruşma', label: 'Duruşma' },
  { value: 'Randevu', label: 'Randevu' },
  { value: 'Son tarih', label: 'Son tarih' },
]

const fileOptions = [
  { value: 'DVA-2026-014', label: 'DVA-2026-014 — Akdeniz Lojistik A.Ş.' },
  { value: 'ICR-2026-031', label: 'ICR-2026-031 — Yıldız İnşaat' },
  { value: 'DVA-2025-118', label: 'DVA-2025-118 — Mavi Teknoloji' },
]

const responsibleOptions = [
  { value: 'Av. Deniz Kaya', label: 'Av. Deniz Kaya' },
  { value: 'Av. Selin Arslan', label: 'Av. Selin Arslan' },
  { value: 'Av. Mert Yılmaz', label: 'Av. Mert Yılmaz' },
]

const hearingLocationOptions = [
  { value: 'İstanbul 4. Asliye Ticaret — Salon 2', label: 'İstanbul 4. Asliye Ticaret — Salon 2' },
  { value: 'Bakırköy 7. İcra Dairesi', label: 'Bakırköy 7. İcra Dairesi' },
  { value: 'Ankara İş Mahkemesi — Salon 1', label: 'Ankara İş Mahkemesi — Salon 1' },
]

export function AgendaFormSheet({ open, mode, onOpenChange, onSubmit }: AgendaFormSheetProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState(mode === 'hearing' ? 'Duruşma' : 'Görev')
  const [dateTime, setDateTime] = useState('')
  const [file, setFile] = useState('DVA-2026-014')
  const [responsible, setResponsible] = useState('Av. Deniz Kaya')
  const [hearingLocation, setHearingLocation] = useState('İstanbul 4. Asliye Ticaret — Salon 2')
  const [description, setDescription] = useState('')
  const isHearing = type === 'Duruşma'


  function handleSubmit() {
    const fallbackTitle = isHearing ? 'Yeni duruşma' : 'Yeni görev'
    onSubmit({
      title: title.trim() || fallbackTitle,
      type,
      dateTime,
      file,
      responsible,
      description: isHearing && hearingLocation ? `${hearingLocation}${description ? ` — ${description}` : ''}` : description,
    })
    setTitle('')
    setDateTime('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'hearing' ? 'Duruşma ekle' : 'Görev ekle'}
      description="Konu, tarih ve sorumlu bilgilerini girin."
      footer={<Button className="w-full" onClick={handleSubmit}>Kaydet</Button>}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="agenda-type">Tür</Label>
          <SelectField id="agenda-type" value={type} onChange={setType} options={eventTypeOptions} placeholder="Tür seç" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agenda-title">Konu</Label>
          <Input id="agenda-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={isHearing ? 'Duruşma konusu' : 'Görev konusu'} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agenda-datetime">Tarih/saat</Label>
          <Input id="agenda-datetime" type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agenda-file">Sorumlu dosya</Label>
          <SelectField id="agenda-file" value={file} onChange={setFile} options={fileOptions} placeholder="Dosya seç" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agenda-responsible">Sorumlu kişi</Label>
          <SelectField id="agenda-responsible" value={responsible} onChange={setResponsible} options={responsibleOptions} placeholder="Sorumlu seç" />
        </div>
        {isHearing ? (
          <div className="space-y-2">
            <Label htmlFor="agenda-hearing-location">Mahkeme / salon</Label>
            <SelectField id="agenda-hearing-location" value={hearingLocation} onChange={setHearingLocation} options={hearingLocationOptions} placeholder="Mahkeme veya salon seç" />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="agenda-description">Açıklama</Label>
          <Textarea id="agenda-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Kısa not" />
        </div>
      </div>
    </FormSheet>
  )
}
