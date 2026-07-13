'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUp } from 'lucide-react'
import { toast } from 'sonner'
import { FormSheet, SelectField } from '@/components/primitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { DocumentFormOptions } from '@/features/documents/types'

type EntityType = 'client' | 'case_file' | 'enforcement_file'

export function DocumentUploadButton({ options }: { options: DocumentFormOptions }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [entityType, setEntityType] = useState<EntityType>('client')
  const [entityId, setEntityId] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const entityOptions = useMemo(() => {
    if (entityType === 'case_file') return options.caseFiles.map((item) => ({ value: item.id, label: item.label }))
    if (entityType === 'enforcement_file') return options.enforcementFiles.map((item) => ({ value: item.id, label: item.label }))
    return options.clients.map((item) => ({ value: item.id, label: item.label }))
  }, [entityType, options])

  function changeEntityType(value: string) {
    setEntityType(value as EntityType)
    setEntityId('')
  }

  async function submit() {
    if (!file) {
      toast.error('Dosya seçin')
      return
    }
    if (!entityId) {
      toast.error('Bağlantı seçin')
      return
    }

    setSubmitting(true)
    try {
      const metadataResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          description,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || 'application/octet-stream',
        }),
      })

      const metadata = await metadataResponse.json().catch(() => null)
      if (!metadataResponse.ok) {
        toast.error(metadata?.error || 'Belge kaydı oluşturulamadı')
        return
      }

      const uploadResponse = await fetch(metadata.upload.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      })

      if (!uploadResponse.ok) {
        toast.error('Dosya yüklenemedi')
        return
      }

      toast.success('Belge yüklendi', { description: file.name })
      setOpen(false)
      setDescription('')
      setEntityId('')
      setFile(null)
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button size="icon" aria-label="Belge yükle" onClick={() => setOpen(true)}>
        <FileUp className="size-4" />
      </Button>
      <FormSheet open={open} onOpenChange={setOpen} title="Belge yükle" footer={<Button className="w-full" disabled={submitting} onClick={submit}>{submitting ? 'Yükleniyor...' : 'Yükle'}</Button>}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-entity-type">Bağlantı türü</Label>
            <SelectField id="document-entity-type" value={entityType} onChange={changeEntityType} options={[{ value: 'client', label: 'Müvekkil' }, { value: 'case_file', label: 'Dava dosyası' }, { value: 'enforcement_file', label: 'İcra dosyası' }]} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="document-entity-id">Bağlantı</Label>
            <SelectField id="document-entity-id" value={entityId} onChange={setEntityId} options={entityOptions} placeholder="Kayıt seç" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="document-file">Dosya</Label>
            <Input id="document-file" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="document-description">Açıklama</Label>
            <Textarea id="document-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Kısa açıklama" />
          </div>
        </div>
      </FormSheet>
    </>
  )
}
