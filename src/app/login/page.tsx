'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Scale } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error('Giriş başarısız: ' + error.message)
      setLoading(false)
      return
    }

    toast.success('Giriş başarılı!')
    router.push('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--primary)_15%,transparent_50%),radial-gradient(ellipse_at_bottom_left,var(--primary)_10%,transparent_50%)] opacity-[0.03]" />
      
      <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA0OGMyLjIgMCA0LTIuMiA0LTRzLTIuMi00IDQtNCA0IDIuMiA0IDQtMi4yIDQtNHMtMi4yLTQtNC00LTQgMi4yLTQgNC0yLjIgNC00IDR6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.3]" />

      <div className="w-full max-w-md px-6">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl text-foreground">Hukuk Bürosu</h1>
          <p className="mt-2 text-sm text-muted-foreground">Yönetim Sistemi</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="avukat@hukukburo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-border/50 bg-background/50 transition-all focus:border-primary focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-border/50 bg-background/50 transition-all focus:border-primary focus:ring-primary/20"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="h-12 w-full rounded-xl font-medium transition-all hover:scale-[1.02]" 
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Hukuk Bürosu Yönetim Sistemi
        </p>
      </div>
    </div>
  )
}