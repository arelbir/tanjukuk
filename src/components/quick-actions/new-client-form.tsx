'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface NewClientFormProps {
  onClose: () => void
}

export function NewClientForm({ onClose }: NewClientFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Müvekkil oluşturuldu')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-name">Ad/Unvan</Label>
        <Input id="client-name" placeholder="Müvekkil adı girin" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-phone">Telefon</Label>
        <Input id="client-phone" placeholder="Telefon numarası" />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Kaydet</Button>
        <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
      </div>
    </form>
  )
}
