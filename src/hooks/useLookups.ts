'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface LookupItem {
  id: string
  label: string
  group_key: string
  sort_order: number
  is_active: boolean
}

export function useLookup(groupKey: string) {
  const [items, setItems] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadItems() {
      setLoading(true)
      const { data } = await supabase
        .from('lookup_values')
        .select('id, label, group_key, sort_order, is_active')
        .eq('group_key', groupKey)
        .eq('is_active', true)
        .order('sort_order')
      setItems(data || [])
      setLoading(false)
    }

    void loadItems()
  }, [groupKey])

  return { items, loading }
}

export function useMultipleLookups(groupKeys: string[]) {
  const [lookups, setLookups] = useState<Record<string, LookupItem[]>>({})
  const [loading, setLoading] = useState(true)
  const groupKeySignature = groupKeys.join(',')

  useEffect(() => {
    const supabase = createClient()
    const keys = groupKeySignature ? groupKeySignature.split(',') : []

    async function loadAll() {
      setLoading(true)
      const results = await Promise.all(
        keys.map((key) =>
          supabase
            .from('lookup_values')
            .select('id, label, group_key, sort_order, is_active')
            .eq('group_key', key)
            .eq('is_active', true)
            .order('sort_order')
            .then((res) => ({ key, data: res.data || [] }))
        )
      )

      const lookupMap: Record<string, LookupItem[]> = {}
      results.forEach(({ key, data }) => {
        lookupMap[key] = data
      })
      setLookups(lookupMap)
      setLoading(false)
    }

    void loadAll()
  }, [groupKeySignature])

  return { lookups, loading }
}
