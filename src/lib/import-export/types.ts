export interface ImportFailure {
  rowNumber: number
  values: Record<string, unknown>
  errors: string[]
}

export interface ImportResult<T> {
  valid: T[]
  invalid: ImportFailure[]
}

export interface ImportDefinition<T> {
  fileName: string
  sheetName: string
  headers: string[]
  instructions?: string[]
  toRow: (item: T) => Record<string, unknown>
  fromRow: (row: Record<string, unknown>, rowNumber: number) => { value?: T; errors?: string[] }
}

export interface CommitResult {
  inserted: number
  skipped: number
  failed: number
}
