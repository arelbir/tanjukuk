import * as XLSX from 'xlsx'
import { ImportDefinition, ImportResult } from './types'

export function createWorkbookFromDefinition<T>(definition: ImportDefinition<T>, data: T[]) {
  const rows = data.map((item) => definition.toRow(item))
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: definition.headers })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, definition.sheetName)
  return workbook
}

export function createTemplateWorkbook<T>(definition: ImportDefinition<T>) {
  const worksheet = XLSX.utils.json_to_sheet([], { header: definition.headers })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, definition.sheetName)
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

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' })
        const valid: T[] = []
        const invalid: Array<{ rowNumber: number; values: Record<string, unknown>; errors: string[] }> = []

        rows.forEach((row, index) => {
          const rowNumber = index + 2
          const result = definition.fromRow(row, rowNumber)

          if (result.value && !(result.errors && result.errors.length > 0)) {
            valid.push(result.value)
          } else {
            invalid.push({
              rowNumber,
              values: row,
              errors: result.errors || ['Geçersiz satır'],
            })
          }
        })

        resolve({ valid, invalid })
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
