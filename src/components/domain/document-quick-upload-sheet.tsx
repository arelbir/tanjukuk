'use client'

import { useState } from 'react'
import { FormSheet, SelectField } from '@/components/primitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export interface DocumentQuickUploadValues {
  relation: string
  fileName: string
  description: string
}

interface DocumentQuickUploadSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DocumentQuickUploadValues) => void
}

const relationOptions = [
  { value: 'DVA-2026-014 — Akdeniz Lojistik A.Ş.', label: 'DVA-2026-014 — Akdeniz Lojistik A.Ş.' },
  { value: 'ICR-2026-031 — Yıldız İnşaat', label: 'ICR-2026-031 — Yıldız İnşaat' },
  { value: 'Müvekkil genel', label: 'Müvekkil genel' },
]

export function DocumentQuickUploadSheet({ open, onOpenChange, onSubmit }: DocumentQuickUploadSheetProps) {
  const [relation, setRelation] = useState('DVA-2026-014 — Akdeniz Lojistik A.Ş.')
  const [fileName, setFileName] = useState('')
  const [description, setDescription] = useState('')

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setFileName(file?.name || '')
  }

  function handleSubmit() {
    onSubmit({
      relation,
      fileName,
      description: description.trim(),
    })
    setRelation('DVA-2026-014 — Akdeniz Lojistik A.Ş.')
    setFileName('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Belge yükle"
      description="Belgeyi ilgili dosya veya müvekkile bağlayın."
      footer={<Button className="w-full" onClick={handleSubmit}>Kaydet</Button>}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quick-document-relation">Bağlantı</Label>
          <SelectField id="quick-document-relation" value={relation} onChange={setRelation} options={relationOptions} placeholder="Bağlantı seç" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-document-file">Dosya</Label>
          <Input id="quick-document-file" type="file" onChange={handleFileChange} />
          {fileName ? <p className="text-xs text-muted-foreground">Seçilen dosya: {fileName}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-document-description">Açıklama</Label>
          <Textarea id="quick-document-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Kısa açıklama" />
        </div>
      </div>
    </FormSheet>
  )
}
