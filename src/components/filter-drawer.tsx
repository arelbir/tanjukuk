'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormDrawer } from '@/components/form-drawer'
import { CaseFilters, DEFAULT_FILTERS } from '@/types/case'

interface FilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: CaseFilters
  onApply: (filters: CaseFilters) => void
  onClear: () => void
  lawyers: { id: string; full_name: string }[]
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'Yerel Mahkeme', label: 'Yerel Mahkeme' },
  { value: 'İstinaf', label: 'İstinaf' },
  { value: 'Temyiz', label: 'Temyiz' },
  { value: 'Kesinleşti', label: 'Kesinleşti' },
  { value: 'Kapandı', label: 'Kapandı' },
]

export function FilterDrawer({ open, onOpenChange, filters, onApply, onClear, lawyers }: FilterDrawerProps) {
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
          <div className="space-y-2">
            <Label className="text-sm font-medium">Avukat</Label>
            <Select
              value={filters.lawyerFilter}
              onValueChange={(v) => onApply({ ...filters, lawyerFilter: v })}
            >
              <SelectTrigger className="h-11"><SelectValue placeholder="Seçin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Avukatlar</SelectItem>
                {lawyers.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Durum</Label>
            <Select
              value={filters.statusFilter}
              onValueChange={(v) => onApply({ ...filters, statusFilter: v })}
            >
              <SelectTrigger className="h-11"><SelectValue placeholder="Seçin" /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1 h-11" onClick={handleApply}>Uygula</Button>
          <Button variant="outline" className="h-11" onClick={handleClear}>Temizle</Button>
        </div>
      </div>
    </FormDrawer>
  )
}