'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Search,
  Menu,
  UserCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [userName, setUserName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function getUserName() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (data) setUserName(data.full_name)
      }
    }
    getUserName()
  }, [supabase])

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/50 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-foreground"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Ara..."
            className="w-64 rounded-xl border-border/50 bg-background/50 pl-10"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        
        <div className="flex items-center gap-2 rounded-xl bg-background/50 px-3 py-2 border border-border/50">
          <UserCircle className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium hidden sm:block">{userName || 'Kullanıcı'}</span>
        </div>
      </div>
    </header>
  )
}