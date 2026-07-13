import { z } from 'zod'

export const enforcementFileFormSchema = z.object({
  client_id: z.string().uuid('Müvekkil seçin'),
  lawyer_id: z.string().uuid('Sorumlu avukat seçin').or(z.literal('')).default(''),
  debtor_party: z.string().trim().min(2, 'Borçlu taraf en az 2 karakter olmalıdır'),
  client_position: z.string().trim().min(1, 'Müvekkil pozisyonu seçin').default('creditor'),
  enforcement_type_id: z.string().uuid().or(z.literal('')).default(''),
  status_id: z.string().uuid().or(z.literal('')).default(''),
  office_city: z.string().trim().optional().default(''),
  enforcement_office: z.string().trim().optional().default(''),
  file_year: z.string().trim().optional().default(''),
  file_no: z.string().trim().optional().default(''),
  opened_at: z.string().optional().default(''),
  principal_amount: z.string().optional().default(''),
  interest_amount: z.string().optional().default(''),
  expense_amount: z.string().optional().default(''),
  collected_amount: z.string().optional().default(''),
  currency: z.string().trim().min(3).max(3).default('TRY'),
  description: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
})

export type EnforcementFileFormInput = z.input<typeof enforcementFileFormSchema>
export type EnforcementFileFormOutput = z.output<typeof enforcementFileFormSchema>

export const enforcementFileDefaultValues: EnforcementFileFormInput = {
  client_id: '',
  lawyer_id: '',
  debtor_party: '',
  client_position: 'creditor',
  enforcement_type_id: '',
  status_id: '',
  office_city: '',
  enforcement_office: '',
  file_year: '',
  file_no: '',
  opened_at: '',
  principal_amount: '',
  interest_amount: '',
  expense_amount: '',
  collected_amount: '',
  currency: 'TRY',
  description: '',
  notes: '',
}
