'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
  user: import('@supabase/supabase-js').User | null
  role: 'admin' | 'lawyer' | 'assistant' | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  })

  const supabase = createClient()

  useEffect(() => {
    async function getAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setState({
          user,
          role: data?.role as AuthState['role'],
          loading: false,
        })
      } else {
        setState({ user: null, role: null, loading: false })
      }
    }

    getAuth()
  }, [supabase])

  return {
    ...state,
    isAdmin: state.role === 'admin',
    isLawyer: state.role === 'lawyer',
    isAssistant: state.role === 'assistant',
  }
}
