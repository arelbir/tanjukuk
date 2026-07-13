'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createTypedBrowserSupabaseClient } from '@/lib/supabase/client'

export function SignOutButton() {
  async function signOut() {
    const supabase = createTypedBrowserSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <Button variant="outline" type="button" onClick={signOut}>
      <LogOut className="size-4" />
      Çıkış
    </Button>
  )
}
