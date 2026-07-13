import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-8 text-foreground">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <WifiOff className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Çevrimdışısınız</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          İnternet bağlantısı yok. Hukuki ve finansal veriler güvenlik nedeniyle çevrimdışı cache’lenmez. Bağlantınız geldiğinde tekrar deneyin.
        </p>
      </section>
    </main>
  )
}
