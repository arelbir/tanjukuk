'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Search, Check, ChevronDown } from 'lucide-react'

interface Client {
  id: string
  name: string
  type: 'individual' | 'company'
  phone: string | null
  email: string | null
}

interface ClientSelectProps {
  value: string
  onChange: (clientId: string, clientName: string) => void
  label?: string
  required?: boolean
}

export function ClientSelect({ value, onChange, label = 'Müvekkil', required }: ClientSelectProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newClient, setNewClient] = useState<{ name: string; type: 'individual' | 'company'; phone: string; email: string }>({
    name: '',
    type: 'individual',
    phone: '',
    email: ''
  })
  const [selectedClientName, setSelectedClientName] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from('clients')
        .select('id, name, type, phone, email')
        .order('name')
      setClients(data || [])
    }
    loadClients()
  }, [supabase])

  useEffect(() => {
    if (value && clients.length > 0) {
      const client = clients.find(c => c.id === value)
      if (client) setSelectedClientName(client.name)
    }
  }, [value, clients])

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (client: Client) => {
    onChange(client.id, client.name)
    setSelectedClientName(client.name)
    setSearch('')
    setOpen(false)
  }

  const handleCreate = async () => {
    if (!newClient.name.trim()) return
    setLoading(true)
    
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: newClient.name,
        type: newClient.type,
        phone: newClient.phone || null,
        email: newClient.email || null
      })
      .select()
      .single()

    if (error) {
      setLoading(false)
      return
    }

    const created = data as Client
    onChange(created.id, created.name)
    setSelectedClientName(created.name)
    setNewClient({ name: '', type: 'individual', phone: '', email: '' })
    setShowNewForm(false)
    setLoading(false)
    
    setClients(prev => [created, ...prev])
  }

  const handleOpenDropdown = () => {
    setOpen(true)
    if (!value) {
      setSelectedClientName('')
    }
  }

  return (
    <div className="space-y-2" ref={inputRef}>
      {showNewForm ? (
        <div className="space-y-4 p-4 border rounded-xl bg-muted/30">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Yeni Müvekkil</Label>
            <Button variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Ad/Unvan *</Label>
              <Input 
                placeholder="Müvekkil adı"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tip</Label>
              <Select value={newClient.type} onValueChange={(v) => setNewClient({ ...newClient, type: v as 'individual' | 'company' })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Bireysel</SelectItem>
                  <SelectItem value="company">Şirket</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telefon</Label>
              <Input 
                placeholder="0555..."
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">E-posta</Label>
              <Input 
                placeholder="email@..."
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={loading || !newClient.name.trim()} className="flex-1">
              {loading ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Label className="text-sm font-medium">
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          
          {value ? (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-background">
              <div className="flex-1">
                <p className="font-medium">{selectedClientName}</p>
                <p className="text-xs text-muted-foreground">
                  {clients.find(c => c.id === value)?.type === 'individual' ? 'Bireysel' : 'Şirket'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onChange('', '')}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between h-11"
                onClick={handleOpenDropdown}
              >
                <span className="text-muted-foreground">Seçin...</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>

              {open && (
                <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-xl max-h-80 overflow-hidden">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Müvekkil ara..."
                        className="pl-9 h-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Müvekkil bulunamadı
                      </div>
                    ) : (
                      filteredClients.slice(0, 10).map((client) => (
                        <div
                          key={client.id}
                          className="px-3 py-2.5 hover:bg-accent cursor-pointer flex items-center justify-between"
                          onClick={() => handleSelect(client)}
                        >
                          <div>
                            <p className="font-medium text-sm">{client.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {client.type === 'individual' ? 'Bireysel' : 'Şirket'}
                            </p>
                          </div>
                          {client.id === value && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center text-sm"
                      onClick={() => {
                        setOpen(false)
                        setShowNewForm(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Müvekkil Ekle
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}