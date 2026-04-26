'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
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
import { UnifiedSelect } from '@/components/unified-select'
import { useCases } from '@/hooks'
import { useMultipleLookups } from '@/hooks/useLookups'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { LEAN_COLORS } from '@/types/case'
import { ImportExportToolbar } from '@/components/import-export-toolbar'
import {
  buildClientNameResolverMap,
  buildLookupResolverMap,
  buildUserEmailResolverMap,
  caseImportDefinition,
  createTemplateWorkbook,
  createWorkbookFromDefinition,
  downloadWorkbook,
  executeResolvedImport,
} from '@/lib/import-export'

export default function CasesPage() {
  const router = useRouter()
  const supabase = createClient()
  const { lookups } = useMultipleLookups(['case_status', 'case_type'])
  const statusOptions = lookups['case_status'] || []
  const caseTypeOptions = lookups['case_type'] || []
  
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

  const caseTypeFilterItems = [
    { id: 'all', label: 'Tüm Dava Türleri' },
    ...caseTypeOptions
  ]

  const handleDownloadTemplate = () => {
    const workbook = createTemplateWorkbook(caseImportDefinition)
    downloadWorkbook(workbook, caseImportDefinition.fileName)
  }

  const handleExport = () => {
    const workbook = createWorkbookFromDefinition(
      caseImportDefinition,
      cases.map((item) => ({
        lawyer_email: item.lawyer?.full_name || '',
        client_name: item.client?.name || '',
        opposing_party: item.opposing_party,
        client_role_label: item.client_role?.label || null,
        entity_type: item.entity_type,
        court_city: item.court_city,
        court_district: item.court_district,
        court_type_label: item.court_type?.label || null,
        court_no: item.court_no,
        file_year: item.file_year,
        file_no: item.file_no,
        file_type_label: item.file_type?.label || null,
        case_type_label: item.case_type?.label || null,
        status_label: item.status?.label || null,
        opened_at: item.opened_at,
        case_value: item.case_value,
        currency: item.currency,
        description: item.description,
        notes: item.notes,
      }))
    )
    downloadWorkbook(workbook, `dosyalar-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const handleImport = async (file: File) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const [lawyerMap, clientMap, caseTypeMap, statusMap, courtTypeMap, fileTypeMap, clientRoleMap] = await Promise.all([
      buildUserEmailResolverMap(supabase, 'lawyer'),
      buildClientNameResolverMap(supabase),
      buildLookupResolverMap(supabase, 'case_type'),
      buildLookupResolverMap(supabase, 'case_status'),
      buildLookupResolverMap(supabase, 'court_type'),
      buildLookupResolverMap(supabase, 'file_type'),
      buildLookupResolverMap(supabase, 'client_role'),
    ])

    const result = await executeResolvedImport({
      file,
      definition: caseImportDefinition,
      resolveRow: async (row) => {
        const errors: string[] = []
        const lawyerId = lawyerMap.get(row.lawyer_email.trim().toLocaleLowerCase('tr-TR')) || null
        const clientId = clientMap.get(row.client_name.trim().toLocaleLowerCase('tr-TR')) || null
        const caseTypeId = row.case_type_label ? caseTypeMap.get(row.case_type_label.trim().toLocaleLowerCase('tr-TR')) || null : null
        const statusId = row.status_label ? statusMap.get(row.status_label.trim().toLocaleLowerCase('tr-TR')) || null : null
        const courtTypeId = row.court_type_label ? courtTypeMap.get(row.court_type_label.trim().toLocaleLowerCase('tr-TR')) || null : null
        const fileTypeId = row.file_type_label ? fileTypeMap.get(row.file_type_label.trim().toLocaleLowerCase('tr-TR')) || null : null
        const clientRoleId = row.client_role_label ? clientRoleMap.get(row.client_role_label.trim().toLocaleLowerCase('tr-TR')) || null : null

        if (!lawyerId) errors.push('lawyer_email eşleşmedi')
        if (!clientId) errors.push('client_name eşleşmedi')
        if (row.case_type_label && !caseTypeId) errors.push('case_type_label eşleşmedi')
        if (row.status_label && !statusId) errors.push('status_label eşleşmedi')
        if (row.court_type_label && !courtTypeId) errors.push('court_type_label eşleşmedi')
        if (row.file_type_label && !fileTypeId) errors.push('file_type_label eşleşmedi')
        if (row.client_role_label && !clientRoleId) errors.push('client_role_label eşleşmedi')

        if (errors.length > 0) {
          return { errors }
        }

        return {
          value: {
            lawyer_id: lawyerId,
            client_id: clientId,
            opposing_party: row.opposing_party,
            client_role_id: clientRoleId,
            entity_type: row.entity_type,
            court_city: row.court_city,
            court_district: row.court_district,
            court_type_id: courtTypeId,
            court_no: row.court_no,
            file_year: row.file_year,
            file_no: row.file_no,
            file_type_id: fileTypeId,
            case_type_id: caseTypeId,
            status_id: statusId,
            opened_at: row.opened_at,
            case_value: row.case_value,
            currency: row.currency,
            description: row.description,
            notes: row.notes,
          },
        }
      },
      insertRows: (rows) =>
        supabase.from('cases').insert(
          rows.map((item) => ({
            ...item,
            created_by: user?.id,
          }))
        ),
      errorFileName: 'dosya-import-hatalari.xlsx',
    })

    if (result.invalidCount > 0) {
      toast.error(`${result.invalidCount} satır hatalı bulundu ve hata dosyası indirildi`)
    }

    if (result.inserted > 0) {
      toast.success(`${result.inserted} dosya içe aktarıldı`)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Dosyalar</h1>
        <div className="flex items-center gap-2">
          <div className="flex">
            <ImportExportToolbar
              onDownloadTemplate={handleDownloadTemplate}
              onExport={handleExport}
              onImport={handleImport}
              templateLabel="Şablon İndir"
              importLabel="Şablon Yükle"
              exportLabel="Dosyaları Dışa Aktar"
            />
            <Button variant="outline" onClick={() => router.push('/cases/new')} className="h-8 rounded-l-none border-l-0">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Dosya
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Filtreler</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dosya kodu, müvekkil, karşı taraf ara..."
                className="pl-9 h-8"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>
            <UnifiedSelect
              value={filters.lawyerFilter || 'all'}
              onChange={(v) => updateFilters({ lawyerFilter: v || 'all' })}
              items={lawyerFilterItems.map(i => ({ id: i.id, label: i.label || i.id }))}
              placeholder="Seçiniz"
            />
            <UnifiedSelect
              value={filters.statusFilter || 'all'}
              onChange={(v) => updateFilters({ statusFilter: v || 'all' })}
              items={statusFilterItems.map(i => ({ id: i.id, label: i.label || i.id }))}
              placeholder="Seçiniz"
            />
            <UnifiedSelect
              value={filters.caseTypeFilter || 'all'}
              onChange={(v) => updateFilters({ caseTypeFilter: v || 'all' })}
              items={caseTypeFilterItems.map(i => ({ id: i.id, label: i.label || i.id }))}
              placeholder="Seçiniz"
            />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-2">
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilters({ dateFrom: e.target.value || null })}
                className="flex-1 h-8"
                placeholder="Başlangıç"
              />
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilters({ dateTo: e.target.value || null })}
                className="flex-1 h-8"
                placeholder="Bitiş"
              />
            </div>
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
                <TableCell colSpan={8}>
                  <EmptyState message="Dosya bulunamadı" />
                </TableCell>
              </TableRow>
            ) : (
              cases.map((c) => (
                <TableRow
                  key={c.id}
                  className={`cursor-pointer hover:bg-muted/50 border-l-4 ${
                    c.lean_against ? LEAN_COLORS[c.lean_against]?.split(' ')[1] || 'border-transparent' : 'border-transparent'
                  } hover:border-l-primary`}
                  onClick={() => router.push(`/cases/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.case_code}</TableCell>
                  <TableCell>{c.lawyer?.full_name}</TableCell>
                  <TableCell>{c.client?.name}</TableCell>
                  <TableCell>{c.opposing_party}</TableCell>
                  <TableCell>{c.case_type?.label || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge label={c.status?.label || '-'} />
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