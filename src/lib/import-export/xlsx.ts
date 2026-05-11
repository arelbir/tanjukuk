import * as XLSX from 'xlsx'
import { ImportColumnDefinition, ImportDefinition, ImportFailure, ImportResult, ParsedImportRow } from './types'

const METADATA_SHEET_NAME = '_meta'
const DEFAULT_TEMPLATE_DATA_START_ROW = 4
const DEFAULT_TEMPLATE_SAMPLE_ROW = 2
const DEFAULT_TEMPLATE_DESCRIPTION_ROW = 3
const DEFAULT_TEMPLATE_INPUT_ROW_COUNT = 200
const DEFAULT_COLUMN_WIDTH = 18

type Worksheet = XLSX.WorkSheet

interface TemplateMetadata {
  sampleRowNumber: number
  descriptionRowNumber: number
  dataStartRowNumber: number
}

interface ErrorWorkbookOptions<T> {
  definition?: ImportDefinition<T>
  invalid: ImportFailure[]
}

interface TemplateWorkbookOptions<T> {
  definition: ImportDefinition<T>
  includeExampleRow?: boolean
}

function getColumns<T>(definition: ImportDefinition<T>): ImportColumnDefinition[] {
  if (definition.columns && definition.columns.length > 0) {
    return definition.columns
  }

  return definition.headers.map((header, index) => ({
    key: `column_${index + 1}`,
    header,
  }))
}

function getMetadata(): TemplateMetadata {
  return {
    sampleRowNumber: DEFAULT_TEMPLATE_SAMPLE_ROW,
    descriptionRowNumber: DEFAULT_TEMPLATE_DESCRIPTION_ROW,
    dataStartRowNumber: DEFAULT_TEMPLATE_DATA_START_ROW,
  }
}

function createInstructionsSheet(definition: { instructions?: string[] }) {
  const instructionRows = (definition.instructions || ['Bu şablonu doldurup tekrar sisteme yükleyin.']).map((message, index) => ({
    sira: index + 1,
    aciklama: message,
  }))

  const worksheet = XLSX.utils.json_to_sheet(instructionRows, { header: ['sira', 'aciklama'] })
  worksheet['!cols'] = [{ wch: 8 }, { wch: 100 }]
  return worksheet
}

function createMetadataSheet(metadata: TemplateMetadata) {
  const worksheet = XLSX.utils.json_to_sheet([
    {
      sampleRowNumber: metadata.sampleRowNumber,
      descriptionRowNumber: metadata.descriptionRowNumber,
      dataStartRowNumber: metadata.dataStartRowNumber,
    },
  ])

  worksheet['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 20 }]
  return worksheet
}

function applyCellComment(worksheet: Worksheet, cellAddress: string, text: string) {
  const cell = worksheet[cellAddress]
  if (!cell) return
  cell.c = cell.c || []
  cell.c.hidden = true
  cell.c.push({ a: 'OpenCode', t: text })
}

function applyTemplateWorksheetFormatting<T>(worksheet: Worksheet, definition: ImportDefinition<T>, includeExampleRow: boolean) {
  const columns = getColumns(definition)
  const metadata = getMetadata()

  worksheet['!cols'] = columns.map((column) => {
    const headerLength = column.header.length
    const descriptionLength = column.description?.length || 0
    const exampleLength = column.example == null ? 0 : String(column.example).length
    const optionLength = column.options?.reduce((max, option) => Math.max(max, option.length), 0) || 0

    return {
      wch: Math.max(DEFAULT_COLUMN_WIDTH, headerLength + 4, descriptionLength / 2, exampleLength + 4, optionLength + 4),
    }
  })

  worksheet['!rows'] = worksheet['!rows'] || []
  worksheet['!rows'][0] = { hpt: 24 }
  worksheet['!rows'][metadata.sampleRowNumber - 1] = { hpt: 24, hidden: !includeExampleRow }
  worksheet['!rows'][metadata.descriptionRowNumber - 1] = { hpt: 42 }

  columns.forEach((column, index) => {
    const headerCellAddress = XLSX.utils.encode_cell({ r: 0, c: index })
    const sampleCellAddress = XLSX.utils.encode_cell({ r: metadata.sampleRowNumber - 1, c: index })
    const descriptionCellAddress = XLSX.utils.encode_cell({ r: metadata.descriptionRowNumber - 1, c: index })

    const headerCell = worksheet[headerCellAddress]
    if (headerCell) {
      headerCell.v = column.required ? `${column.header} *` : column.header
      headerCell.t = 's'
      headerCell.s = {
        font: { bold: true, color: { rgb: column.required ? 'B91C1C' : '111827' } },
        fill: { fgColor: { rgb: column.required ? 'FEE2E2' : 'E5E7EB' } },
        alignment: { vertical: 'center', horizontal: 'center' },
      }
    }

    const sampleCell = worksheet[sampleCellAddress]
    if (sampleCell) {
      sampleCell.s = {
        fill: { fgColor: { rgb: 'EFF6FF' } },
        font: { italic: true, color: { rgb: '1D4ED8' } },
      }
    }

    const descriptionCell = worksheet[descriptionCellAddress]
    if (descriptionCell) {
      descriptionCell.s = {
        fill: { fgColor: { rgb: 'FFFBEB' } },
        font: { color: { rgb: '92400E' } },
        alignment: { wrapText: true, vertical: 'top' },
      }
    }

    const descriptionParts = [
      column.required ? 'Zorunlu alan' : 'Opsiyonel alan',
      column.description,
      column.options && column.options.length > 0 ? `Geçerli değerler: ${column.options.join(', ')}` : null,
    ].filter(Boolean)

    applyCellComment(worksheet, headerCellAddress, descriptionParts.join('\n'))
  })

  const autoFilterEnd = XLSX.utils.encode_col(Math.max(columns.length - 1, 0))
  worksheet['!autofilter'] = { ref: `A1:${autoFilterEnd}1` }
  worksheet['!ref'] = `A1:${autoFilterEnd}${metadata.dataStartRowNumber + DEFAULT_TEMPLATE_INPUT_ROW_COUNT}`
}

function buildTemplateRows<T>(definition: ImportDefinition<T>, includeExampleRow: boolean) {
  const columns = getColumns(definition)
  const headerRow = columns.map((column) => column.header)
  const sampleRow = columns.map((column) => (includeExampleRow ? column.example ?? '' : ''))
  const descriptionRow = columns.map((column) => {
    const parts = [
      column.required ? 'Zorunlu' : 'Opsiyonel',
      column.description,
      column.options && column.options.length > 0 ? `Seçenekler: ${column.options.join(', ')}` : null,
    ].filter(Boolean)

    return parts.join(' • ')
  })

  return [headerRow, sampleRow, descriptionRow]
}

function sanitizeParsedRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  )
}

function getTemplateMetadataFromWorkbook(workbook: XLSX.WorkBook): TemplateMetadata {
  const metadataSheet = workbook.Sheets[METADATA_SHEET_NAME]
  if (!metadataSheet) {
    return {
      sampleRowNumber: DEFAULT_TEMPLATE_SAMPLE_ROW,
      descriptionRowNumber: DEFAULT_TEMPLATE_DESCRIPTION_ROW,
      dataStartRowNumber: 2,
    }
  }

  const [metadataRow] = XLSX.utils.sheet_to_json<Record<string, unknown>>(metadataSheet, { defval: '' })
  if (!metadataRow) {
    return getMetadata()
  }

  return {
    sampleRowNumber: Number(metadataRow.sampleRowNumber) || DEFAULT_TEMPLATE_SAMPLE_ROW,
    descriptionRowNumber: Number(metadataRow.descriptionRowNumber) || DEFAULT_TEMPLATE_DESCRIPTION_ROW,
    dataStartRowNumber: Number(metadataRow.dataStartRowNumber) || DEFAULT_TEMPLATE_DATA_START_ROW,
  }
}

function getJsonRowsFromWorksheet(worksheet: Worksheet, rangeStartRow: number) {
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    range: rangeStartRow - 1,
  })
}

function isRowCompletelyEmpty(row: Record<string, unknown>) {
  return Object.values(row).every((value) => String(value ?? '').trim().length === 0)
}

export function createWorkbookFromDefinition<T>(definition: ImportDefinition<T>, data: T[]) {
  const rows = data.map((item) => definition.toRow(item))
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: definition.headers })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, definition.sheetName)
  XLSX.utils.book_append_sheet(workbook, createInstructionsSheet(definition), 'Instructions')
  return workbook
}

export function createTemplateWorkbook<T>(definition: ImportDefinition<T>, options: Omit<TemplateWorkbookOptions<T>, 'definition'> = {}) {
  const { includeExampleRow = false } = options
  const rows = buildTemplateRows(definition, includeExampleRow)
  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  const metadata = getMetadata()

  applyTemplateWorksheetFormatting(worksheet, definition, includeExampleRow)

  XLSX.utils.book_append_sheet(workbook, worksheet, definition.sheetName)
  XLSX.utils.book_append_sheet(workbook, createInstructionsSheet(definition), 'Instructions')
  XLSX.utils.book_append_sheet(workbook, createMetadataSheet(metadata), METADATA_SHEET_NAME)
  XLSX.utils.book_set_sheet_visibility(workbook, workbook.SheetNames.length - 1, 2)
  return workbook
}

export function createErrorWorkbook<T>({ definition, invalid }: ErrorWorkbookOptions<T>) {
  const columns = definition ? getColumns(definition) : []
  const columnHeaders = columns.map((column) => column.header)
  const worksheet = XLSX.utils.json_to_sheet(
    invalid.map((item) => {
      const rowValues = columns.length > 0
        ? Object.fromEntries(columns.map((column) => [column.header, item.values[column.header] ?? '']))
        : item.values

      return {
        'Satır No': item.rowNumber > 0 ? item.rowNumber : 'Bilinmiyor',
        'Durum': 'Hatalı',
        'Hata Açıklaması': item.errors.join(' | '),
        ...rowValues,
      }
    }),
    {
      header: ['Satır No', 'Durum', 'Hata Açıklaması', ...columnHeaders],
    }
  )

  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 12 },
    { wch: 60 },
    ...columnHeaders.map((header) => ({ wch: Math.max(DEFAULT_COLUMN_WIDTH, header.length + 4) })),
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hatalar')
  if (definition) {
    XLSX.utils.book_append_sheet(workbook, createInstructionsSheet(definition), 'Açıklamalar')
  }
  return workbook
}

export function parseWorkbook<T>(file: File, definition: ImportDefinition<T>): Promise<ImportResult<T>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result
        if (!data) {
          reject(new Error('Dosya içeriği okunamadı'))
          return
        }

        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[definition.sheetName] || workbook.Sheets[workbook.SheetNames[0]]

        if (!worksheet) {
          reject(new Error('Excel çalışma sayfası bulunamadı'))
          return
        }

        const metadata = getTemplateMetadataFromWorkbook(workbook)
        const rows = getJsonRowsFromWorksheet(worksheet, metadata.dataStartRowNumber)
        const valid: T[] = []
        const validRows: ParsedImportRow<T>[] = []
        const invalid: ImportFailure[] = []

        rows.forEach((rawRow, index) => {
          const row = sanitizeParsedRow(rawRow)
          const rowNumber = metadata.dataStartRowNumber + index

          if (isRowCompletelyEmpty(row)) {
            return
          }

          const result = definition.fromRow(row, rowNumber)

          if (result.value && !(result.errors && result.errors.length > 0)) {
            valid.push(result.value)
            validRows.push({
              rowNumber,
              source: row,
              value: result.value,
            })
          } else {
            invalid.push({
              rowNumber,
              values: row,
              errors: result.errors || ['Geçersiz satır'],
            })
          }
        })

        resolve({ valid, validRows, invalid })
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Excel dosyası işlenemedi'))
      }
    }

    reader.onerror = () => reject(new Error('Dosya okunurken hata oluştu'))
    reader.readAsArrayBuffer(file)
  })
}

export function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  XLSX.writeFile(workbook, fileName)
}
