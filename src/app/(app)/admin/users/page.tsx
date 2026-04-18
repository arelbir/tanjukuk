'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormDrawer, useFormDrawer } from '@/components/form-drawer'
import { useLookup } from '@/hooks/useLookups'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const supabase = createClient()
  const { items: roleOptions } = useLookup('user_role')

  const drawer = useFormDrawer<{ email: string; role: string }>({
    email: '',
    role: 'assistant'
  })

  useEffect(() => {
    async function loadUsers() {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data } = await query
      setUsers(data || [])
      setLoading(false)
    }
    loadUsers()
  }, [supabase, search])

  const handleInvite = async () => {
    setSending(true)
    try {
      const { error } = await supabase.from('users').insert({
        email: drawer.values.email,
        full_name: 'Yeni Kullanıcı',
        role: drawer.values.role,
        is_active: true
      })

      if (error) throw error

      toast.success(`${drawer.values.email} kullanıcı eklendi!`)
      drawer.close()
      
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
      setUsers(data || [])
    } catch (error: unknown) {
      const err = error as { message: string }
      toast.error('Hata: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (error) {
      toast.error('Hata: ' + error.message)
      return
    }

    toast.success('Kullanıcı durumu güncellendi')
    setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error('Hata: ' + error.message)
      return
    }

    toast.success('Rol güncellendi')
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-display">Kullanıcılar</h1>
        <Button onClick={drawer.openForCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Kullanıcı Davet Et
        </Button>
      </div>

      <FormDrawer
        open={drawer.open}
        onOpenChange={drawer.close}
        title="Yeni Kullanıcı Davet Et"
        description="Sisteme davet edilecek kullanıcının bilgilerini girin"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="email@example.com"
              value={drawer.values.email} 
              onChange={(e) => drawer.updateValues({ email: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select 
              value={drawer.values.role} 
              onValueChange={(v) => drawer.updateValues({ role: v || 'assistant' })}
            >
              <SelectTrigger id="role"><SelectValue /></SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.id} value={role.label}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={handleInvite} 
              disabled={sending || !drawer.values.email}
            >
              {sending ? 'Gönderiliyor...' : 'Davet Gönder'}
            </Button>
            <Button variant="outline" onClick={drawer.close}>İptal</Button>
          </div>
        </div>
      </FormDrawer>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kullanıcı ara..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Kullanıcı bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select value={user.role || roleOptions[0]?.label || 'assistant'} onValueChange={(v) => updateUserRole(user.id, v || 'assistant')}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.id} value={role.label}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>
                    <Button 
                      variant={user.is_active ? 'outline' : 'default'} 
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                    >
                      {user.is_active ? 'Pasife Al' : 'Aktifleştir'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}