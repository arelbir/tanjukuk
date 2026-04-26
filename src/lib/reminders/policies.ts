// Reminder policies - defines when reminders should be sent for different event types

export interface ReminderPolicy {
  offsetMinutes: number
  channel: 'in_app' | 'email' | 'push' | 'sms'
  enabled: boolean
}

export interface EventReminderPolicies {
  [eventType: string]: ReminderPolicy[]
}

export interface ReminderOffset {
  minutes: number
  channel: 'in_app' | 'email' | 'push' | 'sms'
  enabled: boolean
}

export interface EventWithReminders {
  event_type: string
  reminder_offsets?: ReminderOffset[]
}

// Default reminder policies for different event types
export const DEFAULT_REMINDER_POLICIES: EventReminderPolicies = {
  hearing: [
    { offsetMinutes: 1440, channel: 'push', enabled: true }, // 1 day before (push)
    { offsetMinutes: 60, channel: 'push', enabled: true }, // 1 hour before (push)
    { offsetMinutes: 15, channel: 'push', enabled: true }, // 15 minutes before (push)
    { offsetMinutes: 1440, channel: 'in_app', enabled: true }, // 1 day before (in-app)
    { offsetMinutes: 60, channel: 'in_app', enabled: true }, // 1 hour before (in-app)
    { offsetMinutes: 15, channel: 'in_app', enabled: true }, // 15 minutes before (in-app)
  ],
  activity: [
    { offsetMinutes: 60, channel: 'push', enabled: true }, // 1 hour before (push)
    { offsetMinutes: 60, channel: 'in_app', enabled: true }, // 1 hour before (in-app)
  ],
  deadline: [
    { offsetMinutes: 1440, channel: 'push', enabled: true }, // 1 day before (push)
    { offsetMinutes: 60, channel: 'push', enabled: true }, // 1 hour before (push)
    { offsetMinutes: 1440, channel: 'in_app', enabled: true }, // 1 day before (in-app)
    { offsetMinutes: 60, channel: 'in_app', enabled: true }, // 1 hour before (in-app)
  ],
}

// Get reminder policies for a specific event type
export function getReminderPolicies(eventType: string): ReminderPolicy[] {
  return DEFAULT_REMINDER_POLICIES[eventType] || []
}

// Check if a reminder should be sent based on event's custom reminder_offsets
export function getCustomReminderPolicies(event: EventWithReminders): ReminderPolicy[] {
  if (!event.reminder_offsets || !Array.isArray(event.reminder_offsets)) {
    return []
  }

  return event.reminder_offsets.map((offset: ReminderOffset) => ({
    offsetMinutes: offset.minutes || 0,
    channel: offset.channel || 'in_app',
    enabled: offset.enabled !== false,
  }))
}

// Merge default and custom policies (custom takes precedence)
export function getEffectiveReminderPolicies(event: EventWithReminders): ReminderPolicy[] {
  const defaultPolicies = getReminderPolicies(event.event_type)
  const customPolicies = getCustomReminderPolicies(event)

  if (customPolicies.length === 0) {
    return defaultPolicies.filter(p => p.enabled)
  }

  // Use custom policies only if they exist
  return customPolicies.filter(p => p.enabled)
}
