'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FormDrawer } from '@/components/form-drawer'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CalendarIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FormFieldSelectWithId } from '@/components/form-field-select'
import { Switch } from '@/components/ui/switch'

interface LookupOption {
  id: string
  label: string
}

interface CaseActivity {
  id: string
  case_id: string
  title: string
  description: string | null
  activity_type_id: string | null
  scheduled_at: string
  duration_minutes: number | null
  location: string | null
  is_completed: boolean
  completed_at: string | null
}

interface ActivityFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: string
  activity?: CaseActivity | null
  isAdmin?: boolean
  onSuccess: (activity: CaseActivity) => void
}

export function ActivityFormDrawer({ open, onOpenChange, caseId, activity, onSuccess }: ActivityFormDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lookups, setLookups] = useState<Record<string, LookupOption[]>>({})
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activityTypeId, setActivityTypeId] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>('09:00')
  const [duration, setDuration] = useState<string>('60')
  const [location, setLocation] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const isEditing = !!activity
  const supabase = createClient()

  useEffect(() => {
    const timeout = setTimeout(() => {
      void (async () => {
        const { data } = await supabase
          .from('lookup_values')
          .select('*')
          .eq('group_key', 'activity_type')
          .order('sort_order', { ascending: true })

        if (data) setLookups({ activity_type: data as LookupOption[] })
      })()
    }, 0)

    return () => clearTimeout(timeout)
  }, [supabase])

  useEffect(() => {
    if (activity) {
      setTitle(activity.title)
      setDescription(activity.description || '')
      setActivityTypeId(activity.activity_type_id || '')
      setDate(new Date(activity.scheduled_at))
      setTime(new Date(activity.scheduled_at).toTimeString().slice(0, 5))
      setDuration(String(activity.duration_minutes || 60))
      setLocation(activity.location || '')
      setIsCompleted(activity.is_completed)
    } else {
      setTitle('')
      setDescription('')
      setActivityTypeId('')
      setDate(undefined)
      setTime('09:00')
      setDuration('60')
      setLocation('')
      setIsCompleted(false)
    }
  }, [activity, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date) {
      toast.error('Lütfen bir tarih seçin')
      return
    }
    if (!title.trim()) {
      toast.error('Lütfen bir başlık girin')
      return
    }

    setIsSubmitting(true)

    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const scheduledAt = `${dateStr}T${time}:00`

      if (isEditing) {
        const { data, error } = await supabase
          .from('case_activities')
          .update({
            title: title.trim(),
            description: description || null,
            activity_type_id: activityTypeId || null,
            scheduled_at: scheduledAt,
            duration_minutes: parseInt(duration) || 60,
            location: location || null,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq('id', activity.id)
          .select()
          .single()

        if (error) throw error
        toast.success('Aktivite güncellendi')
        onSuccess(data)
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('case_activities')
          .insert({
            case_id: caseId,
            title: title.trim(),
            description: description || null,
            activity_type_id: activityTypeId || null,
            scheduled_at: scheduledAt,
            duration_minutes: parseInt(duration) || 60,
            location: location || null,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) throw error
        toast.success('Aktivite eklendi')
        onSuccess(data)
      }

      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error:', error)
      toast.error('Hata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite Ekle'}
      description={isEditing ? 'Aktivite bilgilerini güncelleyin.' : 'Bu dosya için yeni bir aktivite oluşturun.'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Başlık <span className="text-destructive">*</span></Label>
          <Input
            placeholder="Örn: Müvekkil ile toplantı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <FormFieldSelectWithId
          label="Aktivite Türü"
          value={activityTypeId}
          onValueChange={(value) => setActivityTypeId(value || '')}
          items={lookups['activity_type'] || []}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label>Tarih <span className="text-destructive">*</span></Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'w-full pl-3 text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                {date ? format(date, 'd MMMM yyyy', { locale: tr }) : <span>Tarih seçin</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Saat</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Süre (dk)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Yer</Label>
            <Input placeholder="Ofis, Mahkeme..." value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Açıklama</Label>
          <Textarea
            placeholder="Aktivite ile ilgili notlar..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <Switch checked={isCompleted} onCheckedChange={setIsCompleted} />
            <Label className="cursor-pointer" onClick={() => setIsCompleted(!isCompleted)}>
              {isCompleted ? 'Tamamlandı' : 'Tamamlandı olarak işaretle'}
            </Label>
            {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </form>
    </FormDrawer>
  )
}
