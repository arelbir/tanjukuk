'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string | null
  is_active: boolean | null
}

function isStrongPassword(password: string) {
  return password.length >= 8
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  useEffect(() => {
    async function loadSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('users')
        .select('id, email, full_name, role, is_active')
        .eq('id', user.id)
        .single()

      if (!profileData) {
        toast.error('Kullanıcı profili bulunamadı')
        router.replace('/login')
        return
      }

      setProfile(profileData)
      setFullName(profileData.full_name || '')
      setLoading(false)
    }

    void loadSession()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      toast.error('Ad soyad zorunludur')
      return
    }

    if (!isStrongPassword(password)) {
      toast.error('Şifre en az 8 karakter olmalıdır')
      return
    }

    if (password !== passwordConfirm) {
      toast.error('Şifreler eşleşmiyor')
      return
    }

    if (!profile) {
      toast.error('Kullanıcı profili yüklenemedi')
      return
    }

    setSaving(true)

    try {
      const { error: authError } = await supabase.auth.updateUser({
        password,
        data: {
          full_name: fullName.trim(),
        },
      })

      if (authError) {
        throw authError
      }

      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          is_active: true,
        })
        .eq('id', profile.id)

      if (profileError) {
        throw profileError
      }

      toast.success('Hesabınız hazır!')
      router.replace('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Onboarding tamamlanamadı')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Yükleniyor...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Hesabınızı Tamamlayın</CardTitle>
          <CardDescription>
            Davetiniz kabul edildi. Sisteme giriş yapmadan önce ad soyad ve şifrenizi belirleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input value={profile?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Yeni Şifre</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Şifre Tekrar</Label>
              <Input id="passwordConfirm" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Hesabı Aktifleştir'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
