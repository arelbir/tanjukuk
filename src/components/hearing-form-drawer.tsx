'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FormDrawer } from '@/components/form-drawer'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Hearing {
  id: string
  hearing_at: string
  location: string | null
  result: string | null
  next_step: string | null
  is_completed: boolean | null
}

interface HearingFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: string
  hearing?: Hearing | null
  isAdmin?: boolean
  onSuccess: (newHearing: Hearing) => void
}

export function HearingFormDrawer({ open, onOpenChange, caseId, hearing, isAdmin = false, onSuccess }: HearingFormDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!hearing
  const isPastHearing = hearing ? new Date(hearing.hearing_at) < new Date() : false
  const canSave = !isPastHearing || isAdmin
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>('09:00')
  const [location, setLocation] = useState('')
  const [result, setResult] = useState('')
  const [nextStep, setNextStep] = useState('')

  useEffect(() => {
    if (hearing) {
      setDate(new Date(hearing.hearing_at))
      setTime(new Date(hearing.hearing_at).toTimeString().slice(0, 5))
      setLocation(hearing.location || '')
      setResult(hearing.result || '')
      setNextStep(hearing.next_step || '')
    } else {
      setDate(undefined)
      setTime('09:00')
      setLocation('')
      setResult('')
      setNextStep('')
    }
  }, [hearing, open])

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date) {
      toast.error('Lütfen bir duruşma tarihi seçin')
      return
    }

    setIsSubmitting(true)

    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const hearingAt = `${dateStr}T${time}:00`

      if (isEditing) {
        const { data, error } = await supabase
          .from('hearings')
          .update({
            hearing_at: hearingAt,
            location: location || null,
            result: result || null,
            next_step: nextStep || null,
          })
          .eq('id', hearing.id)
          .select()
          .single()

        if (error) throw error
        toast.success('Duruşma başarıyla güncellendi')
        onSuccess(data)
      } else {
        const { data, error } = await supabase
          .from('hearings')
          .insert({
            case_id: caseId,
            hearing_at: hearingAt,
            location: location || null,
            result: result || null,
            next_step: nextStep || null,
            is_completed: false
          })
          .select()
          .single()

        if (error) throw error
        toast.success('Duruşma başarıyla eklendi')
        onSuccess(data)
      }
      
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error saving hearing:', error)
      toast.error('Duruşma kaydedilirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Duruşmayı Düzenle' : 'Yeni Duruşma Ekle'}
      description={isEditing ? 'Duruşma bilgilerini güncelleyin.' : 'Bu dava dosyası için yeni bir duruşma kaydı oluşturun.'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 flex flex-col">
            <Label>Duruşma Tarihi <span className="text-destructive">*</span></Label>
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
            <Label>Duruşma Saati <span className="text-destructive">*</span></Label>
            <Input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Duruşma Yeri / Salonu</Label>
          <Input 
            type="text" 
            placeholder="Örn: 1. Asliye Hukuk Mahkemesi - 2. Kat" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Beklenen Sonuç / Notlar</Label>
          <Textarea 
            placeholder="Duruşma ile ilgili eklemek istedikleriniz..." 
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Sonraki Adım</Label>
          <Input 
            type="text" 
            placeholder="Duruşma sonrası yapılması planlanan işlem..." 
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || (isEditing && !canSave)}
            title={isEditing && !canSave ? "Geçmiş duruşmaları sadece admin düzenleyebilir" : undefined}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </form>
    </FormDrawer>
  )
}
