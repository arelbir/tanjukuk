'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FormDrawer } from '@/components/form-drawer'
import { UnifiedSelect } from '@/components/unified-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface CalendarCaseOption {
  id: string
  case_code: string
  client: { name: string } | { name: string }[] | null
}

interface CalendarHearingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate: Date | null
  onSuccess: () => void
}

export function CalendarHearingDrawer({
  open,
  onOpenChange,
  initialDate,
  onSuccess,
}: CalendarHearingDrawerProps) {
  const [cases, setCases] = useState<{ id: string; label: string }[]>([])
  const [caseId, setCaseId] = useState('')
  const [time, setTime] = useState('09:00')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!open) return

    const timeout = setTimeout(() => {
      void supabase
        .from('cases')
        .select('id, case_code, client:clients(name)')
        .order('case_code')
        .then(({ data }) => {
          const mappedCases = (data as CalendarCaseOption[] | null)?.map((c) => {
            const client = Array.isArray(c.client) ? c.client[0] : c.client
            return {
              id: c.id,
              label: `${c.case_code} – ${client?.name || ''}`,
            }
          })

          setCases(mappedCases || [])
        })
    }, 0)

    return () => clearTimeout(timeout)
  }, [open, supabase])

  useEffect(() => {
    setCaseId('')
    setTime('09:00')
    setLocation('')
  }, [initialDate])

  const handleSubmit = async () => {
    if (!caseId || !initialDate) {
      toast.error('Lütfen dosya seçin')
      return
    }

    setSubmitting(true)
    try {
      const dateStr = format(initialDate, 'yyyy-MM-dd')
      const hearingAt = `${dateStr}T${time}:00`

      const { data: caseData } = await supabase
        .from('cases')
        .select('lawyer_id')
        .eq('id', caseId)
        .single()

      const { error } = await supabase.from('events').insert({
        case_id: caseId,
        lawyer_id: caseData?.lawyer_id || null,
        event_type: 'activity',
        title: 'Duruşma',
        scheduled_at: hearingAt,
        location: location || null,
        is_completed: false,
      })

      if (error) throw error

      toast.success('Duruşma eklendi')
      onSuccess()
    } catch (err: unknown) {
      toast.error('Hata: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'))
    } finally {
      setSubmitting(false)
    }
  }

  const dateLabel = initialDate
    ? format(initialDate, 'd MMMM yyyy, EEEE', { locale: tr })
    : ''

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Yeni Duruşma"
      description={dateLabel ? `${dateLabel} tarihine duruşma ekle` : 'Duruşma ekle'}
    >
      <div className="space-y-4">
        <UnifiedSelect
          label="Dosya"
          value={caseId}
          onChange={(v) => setCaseId(v || '')}
          items={cases}
          placeholder="Dosya seçin..."
          required
        />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Saat</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Yer / Salon</Label>
          <Input
            placeholder="Örn: 3. Asliye Hukuk - 2. Kat"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 h-11"
            onClick={handleSubmit}
            disabled={submitting || !caseId}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
          <Button variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
        </div>
      </div>
    </FormDrawer>
  )
}
