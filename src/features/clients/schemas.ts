import { z } from 'zod'

export const clientTypeSchema = z.enum(['individual', 'company'])

export const clientFormSchema = z.object({
  name: z.string().trim().min(2, 'Ad/Unvan en az 2 karakter olmalıdır'),
  type: clientTypeSchema,
  phone: z.string().trim().optional().default(''),
  email: z.string().trim().email('Geçerli bir e-posta girin').optional().or(z.literal('')).default(''),
  tax_number: z.string().trim().optional().default(''),
  national_id: z.string().trim().optional().default(''),
  company_representative: z.string().trim().optional().default(''),
  address: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
  is_active: z.boolean().default(true),
}).superRefine((values, ctx) => {
  if (values.type === 'individual' && values.national_id && values.national_id.length !== 11) {
    ctx.addIssue({
      code: 'custom',
      path: ['national_id'],
      message: 'T.C. kimlik numarası 11 haneli olmalıdır',
    })
  }

  if (values.type === 'company' && values.tax_number && values.tax_number.length < 10) {
    ctx.addIssue({
      code: 'custom',
      path: ['tax_number'],
      message: 'Vergi numarası en az 10 haneli olmalıdır',
    })
  }
})

export type ClientFormInput = z.input<typeof clientFormSchema>
export type ClientFormOutput = z.output<typeof clientFormSchema>

export const clientDefaultValues: ClientFormInput = {
  name: '',
  type: 'individual',
  phone: '',
  email: '',
  tax_number: '',
  national_id: '',
  company_representative: '',
  address: '',
  notes: '',
  is_active: true,
}
