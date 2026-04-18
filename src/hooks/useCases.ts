'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Case, CaseFilters } from '@/types'

export const DEFAULT_FILTERS: CaseFilters = {
  search: '',
  statusFilter: null,
  lawyerFilter: null,
  page: 1,
}

const PAGE_SIZE = 50

export function useCases(initialFilters: CaseFilters = DEFAULT_FILTERS) {
  const [cases, setCases] = useState<Case[]>([])
  const [lawyers, setLawyers] = useState<{id: string; full_name: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  
  const [filters, setFilters] = useState<CaseFilters>(initialFilters)
  const supabase = createClient()

  const fetchLawyers = useCallback(async () => {
    const { data } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'lawyer')
      .eq('is_active', true)
      .order('full_name')
    setLawyers(data || [])
  }, [supabase])

  const fetchCases = useCallback(async () => {
    setLoading(true)
    
    let query = supabase
      .from('cases')
      .select(`
        *,
        lawyer:users!cases_lawyer_id_fkey(full_name),
        client:clients(name),
        case_type:lookup_values!cases_case_type_id_fkey(label),
        status:lookup_values!cases_status_id_fkey(label)
      `, { count: 'exact' })

    if (filters.search) {
      query = query.or(`
        case_code.ilike.%${filters.search}%,
        opposing_party.ilike.%${filters.search}%,
        client.name.ilike.%${filters.search}%
      `)
    }
    
    if (filters.statusFilter && filters.statusFilter !== 'all') {
      query = query.eq('status_id', filters.statusFilter)
    }
    
    if (filters.lawyerFilter && filters.lawyerFilter !== 'all') {
      query = query.eq('lawyer_id', filters.lawyerFilter)
    }

    const from = (filters.page - 1) * PAGE_SIZE
    query = query
      .range(from, from + PAGE_SIZE - 1)
      .order('created_at', { ascending: false })

    const { data, count, error } = await query
    
    if (!error) {
      setCases(data || [])
      setTotalCount(count || 0)
    }
    
    setLoading(false)
  }, [supabase, filters])

  const updateFilters = (updates: Partial<CaseFilters>) => {
    setFilters(prev => ({ ...prev, ...updates, page: updates.page ?? 1 }))
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const goToPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  useEffect(() => {
    fetchLawyers()
  }, [fetchLawyers])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return {
    cases,
    lawyers,
    loading,
    totalCount,
    filters,
    totalPages,
    updateFilters,
    resetFilters,
    goToPage,
    refetch: fetchCases,
  }
}