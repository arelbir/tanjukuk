import { ImportDefinition } from './types'
import { createErrorWorkbook, createTemplateWorkbook, createWorkbookFromDefinition, downloadWorkbook, parseWorkbook } from './xlsx'

interface InsertResult {
  error?: { message: string } | null
}

type AwaitableInsertResult = PromiseLike<InsertResult> | InsertResult

interface ExecuteImportOptions<TParsed, TInsert = TParsed> {
  file: File
  definition: ImportDefinition<TParsed>
  insertRows: (rows: TInsert[]) => AwaitableInsertResult
  mapForInsert?: (item: TParsed) => TInsert
  errorFileName?: string
}

export function downloadTemplate<T>(definition: ImportDefinition<T>) {
  const workbook = createTemplateWorkbook(definition)
  downloadWorkbook(workbook, definition.fileName)
}

export function exportRows<T>(definition: ImportDefinition<T>, data: T[], fileName?: string) {
  const workbook = createWorkbookFromDefinition(definition, data)
  downloadWorkbook(workbook, fileName || definition.fileName)
}

export async function executeImport<TParsed, TInsert = TParsed>({
  file,
  definition,
  insertRows,
  mapForInsert,
  errorFileName,
}: ExecuteImportOptions<TParsed, TInsert>) {
  const parsed = await parseWorkbook(file, definition)

  if (parsed.invalid.length > 0) {
    const workbook = createErrorWorkbook(parsed.invalid)
    downloadWorkbook(workbook, errorFileName || `import-errors-${definition.sheetName}.xlsx`)
  }

  if (parsed.valid.length === 0) {
    return {
      inserted: 0,
      invalidCount: parsed.invalid.length,
      skipped: 0,
    }
  }

  const rows = mapForInsert ? parsed.valid.map(mapForInsert) : (parsed.valid as unknown as TInsert[])
  const { error } = await insertRows(rows)

  if (error) {
    throw new Error(error.message)
  }

  return {
    inserted: rows.length,
    invalidCount: parsed.invalid.length,
    skipped: 0,
  }
}
