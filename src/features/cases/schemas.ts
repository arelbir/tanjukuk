import { z } from 'zod'

export const caseFileFormSchema = z.object({
  client_id: z.string().uuid('Müvekkil seçin'),
  lawyer_id: z.string().uuid('Sorumlu avukat seçin').or(z.literal('')).default(''),
  opposing_party: z.string().trim().min(2, 'Karşı taraf en az 2 karakter olmalıdır'),
  client_role_id: z.string().uuid().or(z.literal('')).default(''),
  court_city: z.string().trim().optional().default(''),
  court_district: z.string().trim().optional().default(''),
  court_type_id: z.string().uuid().or(z.literal('')).default(''),
  court_no: z.string().trim().optional().default(''),
  file_year: z.string().trim().optional().default(''),
  file_no: z.string().trim().optional().default(''),
  case_type_id: z.string().uuid().or(z.literal('')).default(''),
  status_id: z.string().uuid().or(z.literal('')).default(''),
  opened_at: z.string().optional().default(''),
  case_value: z.string().optional().default(''),
  currency: z.string().trim().min(3).max(3).default('TRY'),
  description: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
})

export type CaseFileFormInput = z.input<typeof caseFileFormSchema>
export type CaseFileFormOutput = z.output<typeof caseFileFormSchema>

export const caseFileDefaultValues: CaseFileFormInput = {
  client_id: '',
  lawyer_id: '',
  opposing_party: '',
  client_role_id: '',
  court_city: '',
  court_district: '',
  court_type_id: '',
  court_no: '',
  file_year: '',
  file_no: '',
  case_type_id: '',
  status_id: '',
  opened_at: '',
  case_value: '',
  currency: 'TRY',
  description: '',
  notes: '',
}
