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
import { UnifiedSelect } from '@/components/unified-select'
import { Switch } from '@/components/ui/switch'
import { SelectItem } from '@/components/unified-select'
import { Event } from '@/types/events'

interface LookupOption extends SelectItem {
  id: string
  label: string
}

interface EventFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: string
  event?: Event | null
  isAdmin?: boolean
  onSuccess: (newEvent: Event) => void
}

export function EventFormDrawer({ open, onOpenChange, caseId, event, isAdmin = false, onSuccess }: EventFormDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lookups, setLookups] = useState<Record<string, LookupOption[]>>({})
  
  // Common fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>('09:00')
  const [location, setLocation] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [activityTypeId, setActivityTypeId] = useState('')
  
  const isEditing = !!event
  const isPastEvent = event ? new Date(event.scheduled_at) < new Date() : false
  const canSave = !isPastEvent || isAdmin
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
    if (event) {
      setTitle(event.title || '')
      setDescription(event.description || '')
      setDate(new Date(event.scheduled_at))
      setTime(new Date(event.scheduled_at).toTimeString().slice(0, 5))
      setLocation(event.location || '')
      setIsCompleted(event.is_completed)
      setActivityTypeId(event.event_type_id || '')
    } else {
      setTitle('')
      setDescription('')
      setDate(undefined)
      setTime('09:00')
      setLocation('')
      setIsCompleted(false)
      setActivityTypeId('')
    }
  }, [event, open])

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
      
      const customFields = {}

      const eventData = {
        case_id: caseId,
        event_type: 'activity',
        title: title.trim(),
        description: description || null,
        event_type_id: activityTypeId || null,
        scheduled_at: scheduledAt,
        duration_minutes: 60,
        location: location || null,
        custom_fields: customFields,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      }

      if (isEditing) {
        const { data, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
          .select()
          .single()

        if (error) throw error
        toast.success('Etkinlik güncellendi')
        onSuccess(data)
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('events')
          .insert({
            ...eventData,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) throw error
        toast.success('Etkinlik eklendi')
        onSuccess(data)
      }
      
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error saving event:', error)
      toast.error('Kaydedilirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
      description={isEditing ? 'Etkinlik bilgilerini güncelleyin.' : 'Bu dosya için yeni bir etkinlik oluşturun.'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="space-y-2">
          <Label>Başlık <span className="text-destructive">*</span></Label>
          <Input
            placeholder="Örn: Duruşma, Müvekkil ile toplantı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <UnifiedSelect
          label="Etkinlik Türü"
          value={activityTypeId}
          onChange={(value) => setActivityTypeId(value || '')}
          items={lookups['activity_type'] || []}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label>Tarih <span className="text-destructive">*</span></Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full pl-3 text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(date, "d MMMM yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Saat <span className="text-destructive">*</span></Label>
            <Input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Yer</Label>
          <Input 
            type="text" 
            placeholder="Örn: 1. Asliye Hukuk Mahkemesi, Ofis..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>



        <div className="space-y-2">
          <Label>Açıklama / Notlar</Label>
          <Textarea
            placeholder="Etkinlik ile ilgili notlar..."
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
          <Button 
            type="submit" 
            disabled={isSubmitting || (isEditing && !canSave)}
            title={isEditing && !canSave ? "Geçmiş etkinlikleri sadece admin düzenleyebilir" : undefined}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </form>
    </FormDrawer>
  )
}
