'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface LookupItem {
  id: string
  label: string
  group_key: string
  sort_order: number
  is_active: boolean
  parent_id?: string | null
}

export interface TreeNode extends LookupItem {
  children: TreeNode[]
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

export function useLookupsAdmin() {
  const [lookups, setLookups] = useState<LookupItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadLookups = useCallback(async () => {
    const response = await fetch('/api/admin/lookups')
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Lookup verileri yüklenemedi')
    }

    setLookups(result.lookups || [])
    setLoading(false)
  }, [])

  const buildTree = useCallback((groupKey: string): TreeNode[] => {
    const groupItems = lookups.filter(l => l.group_key === groupKey)
    const itemMap = new Map<string, TreeNode>()
    
    // Initialize all nodes with empty children array
    groupItems.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] })
    })
    
    const rootItems: TreeNode[] = []

    groupItems.forEach(item => {
      const node = itemMap.get(item.id)!
      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id)!
        parent.children.push(node)
      } else {
        rootItems.push(node)
      }
    })

    return rootItems
  }, [lookups])

  const addLookup = useCallback(async (value: Omit<LookupItem, 'id'>) => {
    try {
      const response = await fetch('/api/admin/lookups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(value),
      })
      const result = await response.json()
      if (!response.ok) {
        return { error: { message: result.error || 'Lookup eklenemedi' } }
      }
      await loadLookups()
      return { error: null }
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Lookup eklenemedi' } }
    }
  }, [loadLookups])

  const toggleLookup = useCallback(async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/lookups', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, is_active: isActive }),
      })
      const result = await response.json()
      if (!response.ok) {
        return { error: { message: result.error || 'Lookup durumu güncellenemedi' } }
      }
      setLookups(prev => prev.map(l => l.id === id ? { ...l, is_active: result.lookup.is_active } : l))
      return { error: null }
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Lookup durumu güncellenemedi' } }
    }
  }, [])

  const deleteLookup = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/lookups?id=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!response.ok) {
        return { error: { message: result.error || 'Lookup silinemedi' } }
      }
      setLookups(prev => prev.filter(l => l.id !== id))
      return { error: null }
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Lookup silinemedi' } }
    }
  }, [])

  const updateLookup = useCallback(async (id: string, updates: Partial<LookupItem>) => {
    try {
      const response = await fetch('/api/admin/lookups', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      })
      const result = await response.json()
      if (!response.ok) {
        return { error: { message: result.error || 'Lookup güncellenemedi' } }
      }
      setLookups(prev => prev.map(l => l.id === id ? { ...l, ...result.lookup } : l))
      return { error: null }
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : 'Lookup güncellenemedi' } }
    }
  }, [])

  return { 
    lookups, 
    loading, 
    loadLookups, 
    addLookup, 
    toggleLookup, 
    deleteLookup,
    updateLookup,
    buildTree
  }
}
