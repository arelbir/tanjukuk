'use client'

import { CalendarLensProps } from '@/types/dashboard-v3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export function CalendarLens({ stats }: CalendarLensProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Bugünkü Etkinlikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">
              {stats.todayHearings}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Haftalık Etkinlikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">
              {stats.weekHearings}
            </div>
          </CardContent>
        </Card>

        <Link href="/calendar">
          <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Tüm Etkinlikler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Detaylı takvim için tıklayın
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Events Placeholder */}
      <Card className="border-border/50 bg-card/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Yaklaşan Etkinlikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            Etkinlik verileri yükleniyor...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
