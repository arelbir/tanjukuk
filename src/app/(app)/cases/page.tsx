'use client'

import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { LeanBadge } from '@/components/lean-badge'
import { FormFieldSelectWithId } from '@/components/form-field-select'
import { useCases } from '@/hooks'
import { useMultipleLookups } from '@/hooks/useLookups'
import { Plus, Search } from 'lucide-react'

export default function CasesPage() {
  const { lookups } = useMultipleLookups(['case_status'])
  const statusOptions = lookups['case_status'] || []
  
  const {
    cases,
    lawyers,
    loading,
    totalCount,
    filters,
    totalPages,
    updateFilters,
    goToPage,
  } = useCases()

  const lawyerFilterItems = [
    { id: 'all', label: 'Tüm Avukatlar' },
    ...lawyers.map(l => ({ id: l.id, label: l.full_name }))
  ]

  const statusFilterItems = [
    { id: 'all', label: 'Tüm Durumlar' },
    ...statusOptions
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-display">Dosyalar</h1>
        <div className="flex gap-3">
          <Link href="/cases/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Dosya
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dosya kodu, müvekkil, karşı taraf ara..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>
            <FormFieldSelectWithId
              value={filters.lawyerFilter || 'all'}
              onValueChange={(v) => updateFilters({ lawyerFilter: v || 'all' })}
              items={lawyerFilterItems}
              placeholder="Avukat"
              triggerClassName="w-full sm:w-48"
            />
            <FormFieldSelectWithId
              value={filters.statusFilter || 'all'}
              onValueChange={(v) => updateFilters({ statusFilter: v || 'all' })}
              items={statusFilterItems}
              placeholder="Durum"
              triggerClassName="w-full sm:w-48"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dosya Kodu</TableHead>
              <TableHead>Avukat</TableHead>
              <TableHead>Müvekkil</TableHead>
              <TableHead>Karşı Taraf</TableHead>
              <TableHead>Dava Türü</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Sonraki Duruşma</TableHead>
              <TableHead>L/A</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Dosya bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              cases.map((c) => (
                <TableRow 
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50 border-l-4 border-transparent hover:border-l-primary"
                  onClick={() => window.location.href = `/cases/${c.id}`}
                >
                  <TableCell className="font-medium">{c.case_code}</TableCell>
                  <TableCell>{c.lawyer?.full_name}</TableCell>
                  <TableCell>{c.client?.name}</TableCell>
                  <TableCell>{c.opposing_party}</TableCell>
                  <TableCell>{c.case_type?.label || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.status?.label || '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    {c.next_hearing_at ? new Date(c.next_hearing_at).toLocaleDateString('tr-TR') : '-'}
                  </TableCell>
                  <TableCell>
                    <LeanBadge value={c.lean_against} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Toplam {totalCount} kayıttan {(filters.page - 1) * 50 + 1}-{Math.min(filters.page * 50, totalCount)} arası
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={filters.page === 1} onClick={() => goToPage(filters.page - 1)}>
              Önceki
            </Button>
            <Button variant="outline" size="sm" disabled={filters.page >= totalPages} onClick={() => goToPage(filters.page + 1)}>
              Sonraki
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}