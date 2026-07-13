import { redirect } from 'next/navigation'

export default function CasesRedirectPage() {
  redirect('/files?type=case')
}
