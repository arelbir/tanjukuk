'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { FormDrawer, useFormDrawer } from '@/components/form-drawer'
import { UnifiedSelect } from '@/components/unified-select'
import { USER_ROLE_MAPPING } from '@/types/mappings'
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

  const drawer = useFormDrawer<{ email: string; role: string; full_name: string }>({
    email: '',
    role: 'assistant',
    full_name: ''
  })

  useEffect(() => {
    async function loadUsers() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search.trim()) {
          params.set('search', search.trim())
        }

        const response = await fetch(`/api/admin/users${params.size ? `?${params.toString()}` : ''}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Kullanıcılar yüklenemedi')
        }

        setUsers(result.users || [])
      } catch (error: unknown) {
        const err = error as { message: string }
        toast.error('Hata: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    void loadUsers()
  }, [search])

  const handleInvite = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: drawer.values.email,
          role: drawer.values.role,
          fullName: drawer.values.full_name,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Davet işlemi başarısız oldu')
      }

      toast.success(`${drawer.values.email} adresine davet gönderildi!`)
      drawer.close()

      const refreshResponse = await fetch('/api/admin/users')
      const refreshResult = await refreshResponse.json()
      if (refreshResponse.ok) {
        setUsers(refreshResult.users || [])
      }
    } catch (error: unknown) {
      const err = error as { message: string }
      toast.error('Hata: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          is_active: !currentStatus,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Kullanıcı durumu güncellenemedi')
      }

      toast.success('Kullanıcı durumu güncellendi')
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: result.user.is_active } : u))
    } catch (error: unknown) {
      const err = error as { message: string }
      toast.error('Hata: ' + err.message)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Rol güncellenemedi')
      }

      toast.success('Rol güncellendi')
      setUsers(users.map(u => u.id === userId ? { ...u, role: result.user.role } : u))
    } catch (error: unknown) {
      const err = error as { message: string }
      toast.error('Hata: ' + err.message)
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-display">Kullanıcılar</h1>
        <Button onClick={() => drawer.openForCreate()}>
          <Plus className="h-4 w-4 mr-2" />
          Kullanıcı Davet Et
        </Button>
      </div>

      <FormDrawer
        open={drawer.open}
        onOpenChange={drawer.close}
        title="Yeni Kullanıcı Davet Et"
        description="Sisteme giriş yapacak kullanıcıya e-posta daveti gönderin"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Ad Soyad</Label>
            <Input
              id="full_name"
              placeholder="Örn: Ayşe Yılmaz"
              value={drawer.values.full_name}
              onChange={(e) => drawer.updateValues({ full_name: e.target.value })}
            />
          </div>
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
          <UnifiedSelect
            label="Rol"
            value={drawer.values.role}
            onChange={(v) => drawer.updateValues({ role: v || 'assistant' })}
            items={USER_ROLE_MAPPING.map(m => ({ id: m.value, label: m.label }))}
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleInvite}
              disabled={sending || !drawer.values.email || !drawer.values.full_name}
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
                    <UnifiedSelect
                      value={user.role || 'assistant'}
                      onChange={(v) => updateUserRole(user.id, v || 'assistant')}
                      items={USER_ROLE_MAPPING.map(m => ({ id: m.value, label: m.label }))}
                    />
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
