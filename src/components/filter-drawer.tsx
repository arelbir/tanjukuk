'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormDrawer } from '@/components/form-drawer'
import { FormFieldSelectWithId } from '@/components/form-field-select'
import { CaseFilters } from '@/types/case'

interface FilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: CaseFilters
  onApply: (filters: CaseFilters) => void
  onClear: () => void
  lawyers: { id: string; full_name: string }[]
  statusOptions?: { id: string; label: string }[]
}

export function FilterDrawer({ open, onOpenChange, filters, onApply, onClear, lawyers, statusOptions = [] }: FilterDrawerProps) {
  const lawyerItems = [
    { id: 'all', label: 'Tüm Avukatlar' },
    ...lawyers.map(l => ({ id: l.id, label: l.full_name }))
  ]

  const statusItems = [
    { id: 'all', label: 'Tüm Durumlar' },
    ...statusOptions
  ]

  const handleApply = () => {
    onApply(filters)
    onOpenChange(false)
  }

  const handleClear = () => {
    onClear()
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Dosya Filtrele"
      description="Listeyi filtrelemek için kriterleri belirleyin"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Arama</Label>
          <Input
            placeholder="Dosya kodu, müvekkil, karşı taraf ara..."
            value={filters.search}
            onChange={(e) => onApply({ ...filters, search: e.target.value })}
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormFieldSelectWithId
            label="Avukat"
            value={filters.lawyerFilter || 'all'}
            onValueChange={(v) => onApply({ ...filters, lawyerFilter: v || 'all' })}
            items={lawyerItems}
            placeholder="Seçin"
          />
          <FormFieldSelectWithId
            label="Durum"
            value={filters.statusFilter || 'all'}
            onValueChange={(v) => onApply({ ...filters, statusFilter: v || 'all' })}
            items={statusItems}
            placeholder="Seçin"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1 h-11" onClick={handleApply}>Uygula</Button>
          <Button variant="outline" className="h-11" onClick={handleClear}>Temizle</Button>
        </div>
      </div>
    </FormDrawer>
  )
}
