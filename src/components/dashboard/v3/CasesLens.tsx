'use client'

import { CasesLensProps } from '@/types/dashboard-v3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export function CasesLens({ stats }: CasesLensProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/cases">
          <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FolderKanban className="w-4 h-4" />
                Aktif Dosyalar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-foreground">
                {stats.activeCases}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Toplam: {stats.totalCases}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-border/50 bg-card/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
                Toplam Müvekkiller
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">
              {stats.totalClients}
            </div>
          </CardContent>
        </Card>

        <Link href="/cases/new">
          <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Yeni Dosya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Hızlı dosya açma
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Cases Placeholder */}
      <Card className="border-border/50 bg-card/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Son Dosyalar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            Dosya verileri yükleniyor...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
