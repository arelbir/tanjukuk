'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown, Check } from 'lucide-react'

interface Lawyer {
  id: string
  full_name: string
}

interface LawyerSelectProps {
  value: string
  onChange: (lawyerId: string) => void
  label?: string
  required?: boolean
}

export function LawyerSelect({ value, onChange, label = 'Avukat', required }: LawyerSelectProps) {
  const [lawyers, setLawyers] = useState< Lawyer[]>([])
  const [open, setOpen] = useState(false)
  const [selectedName, setSelectedName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadLawyers() {
      const { data } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'lawyer')
        .eq('is_active', true)
        .order('full_name')
      setLawyers(data || [])
    }
    loadLawyers()
  }, [supabase])

  useEffect(() => {
    if (value && lawyers.length > 0) {
      const lawyer = lawyers.find(l => l.id === value)
      if (lawyer) setSelectedName(lawyer.full_name)
    } else {
      setSelectedName('')
    }
  }, [value, lawyers])

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      {value ? (
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-background">
          <div className="flex-1">
            <p className="font-medium text-primary">{selectedName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange('')}>
            Değiştir
          </Button>
        </div>
      ) : (
        <Select value={value} onValueChange={(v) => onChange(v || '')} open={open} onOpenChange={setOpen}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Avukat seçin" />
          </SelectTrigger>
          <SelectContent>
            {lawyers.map((lawyer) => (
              <SelectItem key={lawyer.id} value={lawyer.id}>
                <div className="flex items-center gap-2">
                  <span>{lawyer.full_name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}