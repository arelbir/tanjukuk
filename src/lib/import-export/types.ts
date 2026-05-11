export interface ImportFailure {
  rowNumber: number
  values: Record<string, unknown>
  errors: string[]
}

export interface ParsedImportRow<T> {
  rowNumber: number
  source: Record<string, unknown>
  value: T
}

export interface ImportResult<T> {
  valid: T[]
  validRows: ParsedImportRow<T>[]
  invalid: ImportFailure[]
}

export interface ImportColumnDefinition {
  key: string
  header: string
  required?: boolean
  description?: string
  example?: string | number | boolean | null
  options?: string[]
}

export interface ImportDefinition<T> {
  fileName: string
  sheetName: string
  headers: string[]
  columns?: ImportColumnDefinition[]
  instructions?: string[]
  toRow: (item: T) => Record<string, unknown>
  fromRow: (row: Record<string, unknown>, rowNumber: number) => { value?: T; errors?: string[] }
}

export interface CommitResult {
  inserted: number
  skipped: number
  failed: number
}
