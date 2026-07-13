import { redirect } from 'next/navigation'

export default function EnforcementsRedirectPage() {
  redirect('/files?type=enforcement')
}
