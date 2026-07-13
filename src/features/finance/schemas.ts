import { z } from 'zod'

const optionalUuid = z.string().uuid().or(z.literal('')).default('')
const amountString = z.string().min(1, 'Tutar girin').refine((value) => Number(value) > 0, 'Tutar 0’dan büyük olmalı')

export const receivableFormSchema = z
  .object({
    client_id: z.string().uuid('Müvekkil seçin'),
    category_id: optionalUuid,
    case_file_id: optionalUuid,
    enforcement_file_id: optionalUuid,
    due_date: z.string().default(''),
    expected_amount: amountString,
    currency: z.string().min(3).max(3).default('TRY'),
    description: z.string().default(''),
  })
  .refine((value) => !(value.case_file_id && value.enforcement_file_id), {
    path: ['case_file_id'],
    message: 'Beklenen ödeme aynı anda hem dava hem icra dosyasına bağlanamaz',
  })

export const paymentFormSchema = z
  .object({
    client_id: z.string().uuid('Müvekkil seçin'),
    receivable_id: optionalUuid,
    category_id: optionalUuid,
    payment_method_id: optionalUuid,
    case_file_id: optionalUuid,
    enforcement_file_id: optionalUuid,
    payment_date: z.string().min(1, 'Ödeme tarihi girin'),
    amount: amountString,
    currency: z.string().min(3).max(3).default('TRY'),
    description: z.string().default(''),
  })
  .refine((value) => !(value.case_file_id && value.enforcement_file_id), {
    path: ['case_file_id'],
    message: 'Tahsilat aynı anda hem dava hem icra dosyasına bağlanamaz',
  })

export const expenseFormSchema = z
  .object({
    scope: z.string().min(1, 'Gider kapsamı seçin').default('office'),
    category_id: optionalUuid,
    sub_category_id: optionalUuid,
    payment_method_id: optionalUuid,
    case_file_id: optionalUuid,
    enforcement_file_id: optionalUuid,
    expense_date: z.string().min(1, 'Gider tarihi girin'),
    amount: amountString,
    currency: z.string().min(3).max(3).default('TRY'),
    is_billable_to_client: z.boolean().default(false),
    document_ref: z.string().default(''),
    description: z.string().default(''),
  })
  .refine((value) => !(value.case_file_id && value.enforcement_file_id), {
    path: ['case_file_id'],
    message: 'Gider aynı anda hem dava hem icra dosyasına bağlanamaz',
  })

export type ReceivableFormInput = z.input<typeof receivableFormSchema>
export type ReceivableFormOutput = z.output<typeof receivableFormSchema>
export type PaymentFormInput = z.input<typeof paymentFormSchema>
export type PaymentFormOutput = z.output<typeof paymentFormSchema>
export type ExpenseFormInput = z.input<typeof expenseFormSchema>
export type ExpenseFormOutput = z.output<typeof expenseFormSchema>

export const receivableDefaultValues = {
  client_id: '',
  category_id: '',
  case_file_id: '',
  enforcement_file_id: '',
  due_date: '',
  expected_amount: '',
  currency: 'TRY',
  description: '',
}

export const paymentDefaultValues = {
  client_id: '',
  receivable_id: '',
  category_id: '',
  payment_method_id: '',
  case_file_id: '',
  enforcement_file_id: '',
  payment_date: new Date().toISOString().split('T')[0],
  amount: '',
  currency: 'TRY',
  description: '',
}

export const expenseDefaultValues = {
  scope: 'office',
  category_id: '',
  sub_category_id: '',
  payment_method_id: '',
  case_file_id: '',
  enforcement_file_id: '',
  expense_date: new Date().toISOString().split('T')[0],
  amount: '',
  currency: 'TRY',
  is_billable_to_client: false,
  document_ref: '',
  description: '',
}
