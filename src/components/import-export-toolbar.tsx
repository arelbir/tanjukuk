'use client'

import { ChangeEvent, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Upload, Download, FileSpreadsheet, ChevronDown } from 'lucide-react'

interface TemplateAction {
  key: string
  label: string
  description?: string
  onClick: () => void
}

interface ImportExportToolbarProps {
  onDownloadTemplate: () => void
  onDownloadExampleTemplate?: () => void
  onExport?: () => void
  onImport?: (file: File) => Promise<void> | void
  importLabel?: string
  exportLabel?: string
  templateLabel?: string
  exampleTemplateLabel?: string
  importDisabled?: boolean
  helperText?: string
}

export function ImportExportToolbar({
  onDownloadTemplate,
  onDownloadExampleTemplate,
  onExport,
  onImport,
  importLabel = 'Şablon Yükle',
  exportLabel = 'Excel Dışa Aktar',
  templateLabel = 'Şablon İndir',
  exampleTemplateLabel = 'Örnek Doldurulmuş Şablon',
  importDisabled = false,
  helperText,
}: ImportExportToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)

  const templateActions = useMemo<TemplateAction[]>(() => {
    const actions: TemplateAction[] = [
      {
        key: 'blank',
        label: templateLabel,
        description: 'Boş Excel şablonunu indir',
        onClick: onDownloadTemplate,
      },
    ]

    if (onDownloadExampleTemplate) {
      actions.push({
        key: 'example',
        label: exampleTemplateLabel,
        description: 'Örnek veri ile doldurulmuş şablon',
        onClick: onDownloadExampleTemplate,
      })
    }

    return actions
  }, [exampleTemplateLabel, onDownloadExampleTemplate, onDownloadTemplate, templateLabel])

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onImport) return

    setIsImporting(true)
    try {
      await onImport(file)
    } finally {
      event.target.value = ''
      setIsImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        {templateActions.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="h-8 rounded-l-md rounded-r-none border-r-0" />
              }
            >
              <Download className="h-4 w-4 mr-2" />
              {templateLabel}
              <ChevronDown className="h-4 w-4 ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-64">
              <DropdownMenuLabel>Şablon Seçenekleri</DropdownMenuLabel>
              {templateActions.map((action) => (
                <DropdownMenuItem key={action.key} onClick={action.onClick} className="flex flex-col items-start gap-0.5 py-2">
                  <span>{action.label}</span>
                  {action.description ? <span className="text-xs text-muted-foreground">{action.description}</span> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" onClick={onDownloadTemplate} className="h-8 rounded-l-md rounded-r-none border-r-0">
            <Download className="h-4 w-4 mr-2" />
            {templateLabel}
          </Button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={importDisabled || !onImport || isImporting}
          className="h-8 rounded-none border-r-0"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isImporting ? 'Yükleniyor...' : importLabel}
        </Button>
        {onExport && (
          <Button variant="outline" onClick={onExport} className="h-8 rounded-none">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {exportLabel}
          </Button>
        )}
      </div>

      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  )
}
