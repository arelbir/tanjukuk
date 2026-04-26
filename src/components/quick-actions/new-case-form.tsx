'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface NewCaseFormProps {
  onClose: () => void
}

export function NewCaseForm({ onClose }: NewCaseFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Dosya oluşturuldu')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="case-title">Dosya Başlığı</Label>
        <Input id="case-title" placeholder="Dosya başlığı girin" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="case-client">Müvekkil</Label>
        <Input id="case-client" placeholder="Müvekkil seçin" />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Kaydet</Button>
        <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
      </div>
    </form>
  )
}
