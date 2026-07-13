'use client'

import { useState } from 'react'
import { AgendaOperationSection, type AgendaOperationItem } from '@/components/domain/agenda-operation-section'
import { SegmentedControl } from '@/components/primitives'
import type { UserContext } from '@/lib/auth'

export function CalendarView({ user, items, initialSegment = 'today' }: { user: UserContext; items: AgendaOperationItem[]; initialSegment?: string }) {
  const [segment, setSegment] = useState(initialSegment)

  return (
    <>
      <SegmentedControl value={segment} onChange={setSegment} options={[{ value: 'today', label: 'Bugün' }, { value: 'week', label: 'Bu Hafta' }, { value: 'overdue', label: 'Gecikmiş' }, { value: 'all', label: 'Tümü' }]} />
      <AgendaOperationSection user={user} mode="calendar" segment={segment} initialItems={items} />
    </>
  )
}
