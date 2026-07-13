import { z } from 'zod'

export const calendarEventFormSchema = z.object({
  title: z.string().trim().min(2, 'Başlık en az 2 karakter olmalıdır'),
  description: z.string().trim().optional().default(''),
  event_type: z.string().trim().min(1, 'Etkinlik türü seçin'),
  starts_at: z.string().min(1, 'Başlangıç tarihi seçin'),
  ends_at: z.string().optional().default(''),
  is_all_day: z.boolean().default(false),
  location: z.string().trim().optional().default(''),
  priority: z.string().trim().optional().default('normal'),
  reminder_at: z.string().optional().default(''),
  assigned_to: z.string().uuid().or(z.literal('')).default(''),
  client_id: z.string().uuid().or(z.literal('')).default(''),
  case_file_id: z.string().uuid().or(z.literal('')).default(''),
  enforcement_file_id: z.string().uuid().or(z.literal('')).default(''),
  court_room: z.string().trim().optional().default(''),
  hearing_result: z.string().trim().optional().default(''),
  interim_decision: z.string().trim().optional().default(''),
  next_step: z.string().trim().optional().default(''),
  next_hearing_at: z.string().optional().default(''),
}).refine((value) => !(value.case_file_id && value.enforcement_file_id), {
  message: 'Bir etkinlik aynı anda hem dava hem icra dosyasına bağlanamaz',
  path: ['case_file_id'],
})

export type CalendarEventFormInput = z.input<typeof calendarEventFormSchema>
export type CalendarEventFormOutput = z.output<typeof calendarEventFormSchema>

export const calendarEventDefaultValues: CalendarEventFormInput = {
  title: '',
  description: '',
  event_type: 'task',
  starts_at: '',
  ends_at: '',
  is_all_day: false,
  location: '',
  priority: 'normal',
  reminder_at: '',
  assigned_to: '',
  client_id: '',
  case_file_id: '',
  enforcement_file_id: '',
  court_room: '',
  hearing_result: '',
  interim_decision: '',
  next_step: '',
  next_hearing_at: '',
}
