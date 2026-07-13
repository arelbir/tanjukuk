'use client'

import { useState } from 'react'
import { FormSheet, SelectField } from '@/components/primitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface ClientQuickFormValues {
  name: string
  type: string
  contact: string
}

interface ClientQuickFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ClientQuickFormValues) => void
}

const clientTypeOptions = [
  { value: 'Gerçek kişi', label: 'Gerçek kişi' },
  { value: 'Şirket', label: 'Şirket' },
  { value: 'Kurum', label: 'Kurum' },
]

export function ClientQuickFormSheet({ open, onOpenChange, onSubmit }: ClientQuickFormSheetProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('Gerçek kişi')
  const [contact, setContact] = useState('')

  function handleSubmit() {
    const values = {
      name: name.trim() || 'Yeni müvekkil',
      type,
      contact: contact.trim(),
    }
    onSubmit(values)
    setName('')
    setType('Gerçek kişi')
    setContact('')
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Müvekkil ekle"
      description="Temel müvekkil bilgisini girin."
      footer={<Button className="w-full" onClick={handleSubmit}>Kaydet</Button>}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quick-client-name">Ad</Label>
          <Input id="quick-client-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ad veya unvan" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-client-type">Tip</Label>
          <SelectField id="quick-client-type" value={type} onChange={setType} options={clientTypeOptions} placeholder="Tip seç" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-client-contact">İletişim</Label>
          <Input id="quick-client-contact" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Telefon veya e-posta" />
        </div>
      </div>
    </FormSheet>
  )
}
