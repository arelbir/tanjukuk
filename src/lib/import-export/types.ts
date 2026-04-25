export interface ImportResult<T> {
  valid: T[]
  invalid: Array<{ rowNumber: number; values: Record<string, unknown>; errors: string[] }>
}

export interface ImportDefinition<T> {
  fileName: string
  sheetName: string
  headers: string[]
  toRow: (item: T) => Record<string, unknown>
  fromRow: (row: Record<string, unknown>, rowNumber: number) => { value?: T; errors?: string[] }
}
