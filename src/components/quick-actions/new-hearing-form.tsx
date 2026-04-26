'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface NewHearingFormProps {
  onClose: () => void
}

export function NewHearingForm({ onClose }: NewHearingFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Duruşma oluşturuldu')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hearing-date">Tarih</Label>
        <Input id="hearing-date" type="date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hearing-case">Dosya</Label>
        <Input id="hearing-case" placeholder="Dosya seçin" />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Kaydet</Button>
        <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
      </div>
    </form>
  )
}
