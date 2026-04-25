'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Case, CaseFilters } from '@/types'

export const DEFAULT_FILTERS: CaseFilters = {
  search: '',
  statusFilter: 'all',
  lawyerFilter: 'all',
  page: 1,
}

const PAGE_SIZE = 50

export function useCases(initialFilters: CaseFilters = DEFAULT_FILTERS) {
  const [cases, setCases] = useState<Case[]>([])
  const [lawyers, setLawyers] = useState<{ id: string; full_name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState<CaseFilters>(initialFilters)

  const fetchLawyers = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('role', 'lawyer')
      .eq('is_active', true)
      .order('full_name')

    setLawyers(data || [])
  }, [])

  const fetchCases = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)

    let query = supabase
      .from('cases')
      .select(
        `
          *,
          lawyer:users!cases_lawyer_id_fkey(full_name),
          client:clients(name),
          case_type:lookup_values!cases_case_type_id_fkey(label),
          status:lookup_values!cases_status_id_fkey(label)
        `,
        { count: 'exact' }
      )

    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase()
      query = query.order('created_at', { ascending: false }).range(0, 999)
      const { data: allCases, count } = await query

      if (allCases) {
        const filteredCases = allCases.filter((item) => {
          const clientName = item.client?.name?.toLowerCase() || ''
          const caseCode = item.case_code?.toLowerCase() || ''
          const opposingParty = item.opposing_party?.toLowerCase() || ''
          return clientName.includes(searchTerm) || caseCode.includes(searchTerm) || opposingParty.includes(searchTerm)
        })

        setCases(filteredCases)
        setTotalCount(count || 0)
        setLoading(false)
        return
      }
    }

    if (filters.statusFilter && filters.statusFilter !== 'all') {
      query = query.eq('status_id', filters.statusFilter)
    }

    if (filters.lawyerFilter && filters.lawyerFilter !== 'all') {
      query = query.eq('lawyer_id', filters.lawyerFilter)
    }

    const from = (filters.page - 1) * PAGE_SIZE
    query = query.range(from, from + PAGE_SIZE - 1).order('created_at', { ascending: false })

    const { data, count, error } = await query

    if (!error) {
      setCases(data || [])
      setTotalCount(count || 0)
    }

    setLoading(false)
  }, [filters])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchLawyers()
    }, 0)

    return () => clearTimeout(timeout)
  }, [fetchLawyers])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchCases()
    }, 0)

    return () => clearTimeout(timeout)
  }, [fetchCases])

  const updateFilters = (updates: Partial<CaseFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }))
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

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
