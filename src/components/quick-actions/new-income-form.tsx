'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface NewIncomeFormProps {
  onClose: () => void
}

export function NewIncomeForm({ onClose }: NewIncomeFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Kayıt oluşturuldu')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="income-amount">Tutar</Label>
        <Input id="income-amount" type="number" placeholder="0.00" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="income-client">Müvekkil</Label>
        <Input id="income-client" placeholder="Müvekkil seçin" />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Kaydet</Button>
        <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
      </div>
    </form>
  )
}
