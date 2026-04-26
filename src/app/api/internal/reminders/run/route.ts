import { NextRequest, NextResponse } from 'next/server'
import { findReminderCandidates } from '@/lib/reminders/candidates'
import { batchDispatchReminders } from '@/lib/reminders/dispatch'

// Secret key to protect the endpoint
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  // Verify secret key
  const authHeader = request.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check for dry-run mode
  const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true'

  try {
    // Find reminder candidates
    const candidates = await findReminderCandidates(
      15, // lookback 15 minutes
      1440 * 7 // lookforward 7 days
    )

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        scanned_count: candidates.length,
        candidates: candidates.map((c) => ({
          eventId: c.eventId,
          eventTitle: c.eventTitle,
          eventType: c.eventType,
          scheduledAt: c.scheduledAt,
          policiesCount: c.policies.length,
        })),
      })
    }

    // Dispatch reminders
    const result = await batchDispatchReminders(candidates)

    return NextResponse.json({
      success: true,
      scanned_count: candidates.length,
      candidate_count: candidates.reduce((sum, c) => sum + c.policies.length, 0),
      created_notification_count: result.created,
      duplicate_count: result.duplicates,
      failed_count: result.failed,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Error in reminder cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also support GET for testing
export async function GET(request: NextRequest) {
  return POST(request)
}
