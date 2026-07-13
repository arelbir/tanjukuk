'use client'

import { useState } from 'react'
import { Check, Edit2, Plus, ShieldCheck, UserX, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogCloseButton, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/primitives/select-field'
import type { Database } from '@/types/database.generated'

type ProfileRow = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'email' | 'full_name' | 'role' | 'is_active' | 'created_at'>

interface UserManagementPanelProps {
  initialUsers: ProfileRow[]
  currentUserId: string
}

const roles = [
  { value: 'admin', label: 'Yönetici', description: 'Tüm yönetim ve ayar ekranlarına erişebilir.' },
  { value: 'lawyer', label: 'Avukat', description: 'Dosya, müvekkil ve ajanda süreçlerini yönetir.' },
  { value: 'assistant', label: 'Asistan', description: 'Operasyonel kayıtları ve takipleri yönetir.' },
  { value: 'finance', label: 'Finans', description: 'Finans kayıtları ve raporlarına odaklanır.' },
]

function roleLabel(role: string | null) {
  return roles.find((item) => item.value === role)?.label || role || 'Rol yok'
}

export function UserManagementPanel({ initialUsers, currentUserId }: UserManagementPanelProps) {
  const [users, setUsers] = useState(initialUsers)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [pendingStatusUser, setPendingStatusUser] = useState<ProfileRow | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newRole, setNewRole] = useState('assistant')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function updateUser(userId: string, updates: { role?: string; is_active?: boolean }) {
    setBusy(true)
    setError(null)

    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(payload.error || 'Kullanıcı güncellenemedi')
      setBusy(false)
      return
    }

    setUsers((current) => current.map((user) => (user.id === userId ? payload.user : user)))
    setEditingUserId(null)
    setSelectedRole('')
    setPendingStatusUser(null)
    setBusy(false)
  }

  async function createUser() {
    setBusy(true)
    setError(null)

    const response = await fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'create',
        fullName,
        email,
        password,
        role: newRole,
      }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(payload.error || 'Kullanıcı oluşturulamadı')
      setBusy(false)
      return
    }

    setUsers((current) => [payload.user, ...current.filter((user) => user.id !== payload.user.id)])
    setFullName('')
    setEmail('')
    setPassword('')
    setNewRole('assistant')
    setCreateOpen(false)
    setBusy(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setError(null); setCreateOpen(true) }}>
          <Plus className="size-4" />
          Kullanıcı oluştur
        </Button>
      </div>

      <Card className="border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 text-blue-700" />
          <p>
            Kullanıcıyı manuel oluşturduğunuzda e-posta daveti beklemeden belirlediğiniz geçici şifreyle giriş yapabilir. İlk girişten sonra şifreyi değiştirmesini ayrıca iletin.
          </p>
        </div>
      </Card>

      {error ? <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}

      <div className="space-y-3">
        {users.map((item) => {
          const editing = editingUserId === item.id
          const isSelf = item.id === currentUserId
          const selectedRoleInfo = roles.find((role) => role.value === (editing ? selectedRole : item.role))

          return (
            <Card key={item.id} className="space-y-4 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{item.full_name || item.email}</h2>
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Aktif' : 'Pasif'}</Badge>
                    {isSelf ? <Badge variant="outline">Siz</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{roleLabel(item.role)}</Badge>
                  {!editing ? (
                    <Button size="sm" variant="outline" onClick={() => { setEditingUserId(item.id); setSelectedRole(item.role || '') }}>
                      <Edit2 className="size-4" />
                      Rol değiştir
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={() => setPendingStatusUser(item)} disabled={busy || isSelf}>
                    <UserX className="size-4" />
                    {item.is_active ? 'Pasife al' : 'Aktifleştir'}
                  </Button>
                </div>
              </div>

              {editing ? (
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Yeni rol</p>
                      <SelectField
                        value={selectedRole}
                        onChange={setSelectedRole}
                        options={roles.map((role) => ({ value: role.value, label: role.label }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateUser(item.id, { role: selectedRole })} disabled={busy || !selectedRole || (isSelf && selectedRole !== 'admin')}>
                        <Check className="size-4" />
                        Kaydet
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingUserId(null)} disabled={busy}>
                        <X className="size-4" />
                        Vazgeç
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedRoleInfo?.description}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{selectedRoleInfo?.description}</p>
              )}
            </Card>
          )
        })}

        {users.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">Henüz kullanıcı bulunamadı.</Card>
        ) : null}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogCloseButton onClick={() => setCreateOpen(false)} />
          <DialogHeader>
            <DialogTitle>Manuel kullanıcı oluştur</DialogTitle>
            <DialogDescription>
              Kullanıcı hemen oluşturulur ve belirlediğiniz şifreyle giriş yapabilir. Bu şifreyi güvenli bir kanaldan kullanıcıya iletin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Ad soyad</p>
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Örn. Av. Ayşe Yılmaz" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">E-posta</p>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="kullanici@ornek.com" type="email" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Geçici şifre</p>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="En az 8 karakter" type="password" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Rol</p>
              <SelectField value={newRole} onChange={setNewRole} options={roles.map((role) => ({ value: role.value, label: role.label }))} />
              <p className="text-xs text-muted-foreground">{roles.find((role) => role.value === newRole)?.description}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={busy}>Vazgeç</Button>
            <Button onClick={createUser} disabled={busy || !email.trim() || !password.trim() || password.trim().length < 8}>
              Kullanıcı oluştur
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingStatusUser)} onOpenChange={(open) => !open && setPendingStatusUser(null)}>
        <DialogContent>
          <DialogCloseButton onClick={() => setPendingStatusUser(null)} />
          <DialogHeader>
            <DialogTitle>{pendingStatusUser?.is_active ? 'Kullanıcıyı pasife alalım mı?' : 'Kullanıcıyı tekrar aktifleştirelim mi?'}</DialogTitle>
            <DialogDescription>
              {pendingStatusUser?.is_active
                ? 'Pasif kullanıcı uygulamaya giriş yapamaz. Mevcut kayıtları silinmez.'
                : 'Aktif kullanıcı rolünün izin verdiği ekranlara tekrar erişebilir.'}
            </DialogDescription>
          </DialogHeader>
          {pendingStatusUser ? (
            <div className="rounded-xl border border-border bg-muted p-3 text-sm">
              <p className="font-semibold">{pendingStatusUser.full_name || pendingStatusUser.email}</p>
              <p className="mt-1 text-muted-foreground">{pendingStatusUser.email}</p>
            </div>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPendingStatusUser(null)} disabled={busy}>Vazgeç</Button>
            <Button onClick={() => pendingStatusUser && updateUser(pendingStatusUser.id, { is_active: !pendingStatusUser.is_active })} disabled={busy || pendingStatusUser?.id === currentUserId}>
              {pendingStatusUser?.is_active ? 'Pasife al' : 'Aktifleştir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
