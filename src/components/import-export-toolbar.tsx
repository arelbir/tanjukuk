'use client'

import { ChangeEvent, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Download, FileSpreadsheet } from 'lucide-react'

interface ImportExportToolbarProps {
  onDownloadTemplate: () => void
  onExport: () => void
  onImport: (file: File) => Promise<void> | void
  importLabel?: string
  exportLabel?: string
  templateLabel?: string
}

export function ImportExportToolbar({
  onDownloadTemplate,
  onExport,
  onImport,
  importLabel = 'Şablon Yükle',
  exportLabel = 'Excel Dışa Aktar',
  templateLabel = 'Şablon İndir',
}: ImportExportToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await onImport(file)
    event.target.value = ''
  }

  return (
    <div className="flex flex-wrap gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button variant="outline" onClick={onDownloadTemplate}>
        <Download className="h-4 w-4 mr-2" />
        {templateLabel}
      </Button>
      <Button variant="outline" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4 mr-2" />
        {importLabel}
      </Button>
      <Button variant="outline" onClick={onExport}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        {exportLabel}
      </Button>
    </div>
  )
}
