import { NextRequest, NextResponse } from 'next/server'
import { findReminderCandidates } from '@/lib/reminders/candidates'
import { batchDispatchReminders } from '@/lib/reminders/dispatch'

const CRON_SECRET = process.env.CRON_SECRET

function authorize(request: NextRequest) {
  if (!CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET yapılandırılmamış' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  const cronHeader = request.headers.get('x-cron-secret')
  const valid = authHeader === `Bearer ${CRON_SECRET}` || cronHeader === CRON_SECRET

  if (!valid) {
    return NextResponse.json({ error: 'Yetkisiz istek' }, { status: 401 })
  }

  return null
}

export async function POST(request: NextRequest) {
  const unauthorized = authorize(request)
  if (unauthorized) return unauthorized

  const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true'

  try {
    const candidates = await findReminderCandidates({
      lookbackMinutes: 60,
      lookforwardMinutes: 1440 * 7,
    })

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        scanned_count: candidates.length,
        candidates,
      })
    }

    const result = await batchDispatchReminders(candidates)

    return NextResponse.json({
      success: true,
      scanned_count: result.scanned,
      created_notification_count: result.created,
      duplicate_count: result.duplicates,
      failed_count: result.failed,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Reminder cron error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Hatırlatma üretimi çalıştırılamadı',
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}
