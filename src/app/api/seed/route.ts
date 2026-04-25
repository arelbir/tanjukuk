import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      supabase,
    }
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      supabase,
    }
  }

  return { supabase, error: null }
}

const LOOKUP_VALUES = [
  { group_key: 'entity_type', label: 'Gerçek Kişi', sort_order: 1, is_active: true },
  { group_key: 'entity_type', label: 'Tüzel Kişi', sort_order: 2, is_active: true },
  { group_key: 'client_role', label: 'Davacı', sort_order: 1, is_active: true },
  { group_key: 'client_role', label: 'Davalı', sort_order: 2, is_active: true },
  { group_key: 'client_role', label: 'Müdahil', sort_order: 3, is_active: true },
  { group_key: 'client_role', label: 'Şikayetçi', sort_order: 4, is_active: true },
  { group_key: 'client_role', label: 'Şüpheli', sort_order: 5, is_active: true },
  { group_key: 'client_type', label: 'Bireysel', sort_order: 1, is_active: true },
  { group_key: 'client_type', label: 'Şirket', sort_order: 2, is_active: true },
  { group_key: 'payment_status', label: 'Ödendi', sort_order: 1, is_active: true },
  { group_key: 'payment_status', label: 'Bekliyor', sort_order: 2, is_active: true },
  { group_key: 'payment_status', label: 'Kısmi', sort_order: 3, is_active: true },
  { group_key: 'payment_method', label: 'Nakit', sort_order: 1, is_active: true },
  { group_key: 'payment_method', label: 'Havale', sort_order: 2, is_active: true },
  { group_key: 'payment_method', label: 'Kart', sort_order: 3, is_active: true },
  { group_key: 'currency', label: 'TRY', sort_order: 1, is_active: true },
  { group_key: 'currency', label: 'USD', sort_order: 2, is_active: true },
  { group_key: 'currency', label: 'EUR', sort_order: 3, is_active: true },
  { group_key: 'court_instance', label: 'Yerel Mahkeme', sort_order: 1, is_active: true },
  { group_key: 'court_instance', label: 'İstinaf', sort_order: 2, is_active: true },
  { group_key: 'court_instance', label: 'Temyiz', sort_order: 3, is_active: true },
  { group_key: 'court_instance', label: 'Kesinleşti', sort_order: 4, is_active: true },
  { group_key: 'court_instance', label: 'Kapandı', sort_order: 5, is_active: true },
  { group_key: 'user_role', label: 'Admin', sort_order: 1, is_active: true },
  { group_key: 'user_role', label: 'Avukat', sort_order: 2, is_active: true },
  { group_key: 'user_role', label: 'Asistan', sort_order: 3, is_active: true },
  { group_key: 'city', label: 'Adana', sort_order: 1, is_active: true },
  { group_key: 'city', label: 'Adıyaman', sort_order: 2, is_active: true },
  { group_key: 'city', label: 'Afyon', sort_order: 3, is_active: true },
  { group_key: 'city', label: 'Ağrı', sort_order: 4, is_active: true },
  { group_key: 'city', label: 'Aksaray', sort_order: 5, is_active: true },
  { group_key: 'city', label: 'Amasya', sort_order: 6, is_active: true },
  { group_key: 'city', label: 'Ankara', sort_order: 7, is_active: true },
  { group_key: 'city', label: 'Antalya', sort_order: 8, is_active: true },
  { group_key: 'city', label: 'Ardahan', sort_order: 9, is_active: true },
  { group_key: 'city', label: 'Artvin', sort_order: 10, is_active: true },
  { group_key: 'city', label: 'Aydın', sort_order: 11, is_active: true },
  { group_key: 'city', label: 'Balıkesir', sort_order: 12, is_active: true },
  { group_key: 'city', label: 'Bartın', sort_order: 13, is_active: true },
  { group_key: 'city', label: 'Batman', sort_order: 14, is_active: true },
  { group_key: 'city', label: 'Bayburt', sort_order: 15, is_active: true },
  { group_key: 'city', label: 'Bilecik', sort_order: 16, is_active: true },
  { group_key: 'city', label: 'Bingöl', sort_order: 17, is_active: true },
  { group_key: 'city', label: 'Bitlis', sort_order: 18, is_active: true },
  { group_key: 'city', label: 'Bolu', sort_order: 19, is_active: true },
  { group_key: 'city', label: 'Burdur', sort_order: 20, is_active: true },
  { group_key: 'city', label: 'Bursa', sort_order: 21, is_active: true },
  { group_key: 'city', label: 'Çanakkale', sort_order: 22, is_active: true },
  { group_key: 'city', label: 'Çankırı', sort_order: 23, is_active: true },
  { group_key: 'city', label: 'Çorum', sort_order: 24, is_active: true },
  { group_key: 'city', label: 'Denizli', sort_order: 25, is_active: true },
  { group_key: 'city', label: 'Diyarbakır', sort_order: 26, is_active: true },
  { group_key: 'city', label: 'Düzce', sort_order: 27, is_active: true },
  { group_key: 'city', label: 'Edirne', sort_order: 28, is_active: true },
  { group_key: 'city', label: 'Elazığ', sort_order: 29, is_active: true },
  { group_key: 'city', label: 'Erzincan', sort_order: 30, is_active: true },
  { group_key: 'city', label: 'Erzurum', sort_order: 31, is_active: true },
  { group_key: 'city', label: 'Eskişehir', sort_order: 32, is_active: true },
  { group_key: 'city', label: 'Gaziantep', sort_order: 33, is_active: true },
  { group_key: 'city', label: 'Giresun', sort_order: 34, is_active: true },
  { group_key: 'city', label: 'Gümüşhane', sort_order: 35, is_active: true },
  { group_key: 'city', label: 'Hakkari', sort_order: 36, is_active: true },
  { group_key: 'city', label: 'Hatay', sort_order: 37, is_active: true },
  { group_key: 'city', label: 'Isparta', sort_order: 38, is_active: true },
  { group_key: 'city', label: 'Mersin', sort_order: 39, is_active: true },
  { group_key: 'city', label: 'İstanbul', sort_order: 40, is_active: true },
  { group_key: 'city', label: 'İzmir', sort_order: 41, is_active: true },
  { group_key: 'city', label: 'Kars', sort_order: 42, is_active: true },
  { group_key: 'city', label: 'Kastamonu', sort_order: 43, is_active: true },
  { group_key: 'city', label: 'Kayseri', sort_order: 44, is_active: true },
  { group_key: 'city', label: 'Kırklareli', sort_order: 45, is_active: true },
  { group_key: 'city', label: 'Kırşehir', sort_order: 46, is_active: true },
  { group_key: 'city', label: 'Kilis', sort_order: 47, is_active: true },
  { group_key: 'city', label: 'Kocaeli', sort_order: 48, is_active: true },
  { group_key: 'city', label: 'Konya', sort_order: 49, is_active: true },
  { group_key: 'city', label: 'Kütahya', sort_order: 50, is_active: true },
  { group_key: 'city', label: 'Malatya', sort_order: 51, is_active: true },
  { group_key: 'city', label: 'Manisa', sort_order: 52, is_active: true },
  { group_key: 'city', label: 'Kahramanmaraş', sort_order: 53, is_active: true },
  { group_key: 'city', label: 'Mardin', sort_order: 54, is_active: true },
  { group_key: 'city', label: 'Muğla', sort_order: 55, is_active: true },
  { group_key: 'city', label: 'Muş', sort_order: 56, is_active: true },
  { group_key: 'city', label: 'Nevşehir', sort_order: 57, is_active: true },
  { group_key: 'city', label: 'Niğde', sort_order: 58, is_active: true },
  { group_key: 'city', label: 'Ordu', sort_order: 59, is_active: true },
  { group_key: 'city', label: 'Osmaniye', sort_order: 60, is_active: true },
  { group_key: 'city', label: 'Rize', sort_order: 61, is_active: true },
  { group_key: 'city', label: 'Samsun', sort_order: 62, is_active: true },
  { group_key: 'city', label: 'Şanlıurfa', sort_order: 63, is_active: true },
  { group_key: 'city', label: 'Şırnak', sort_order: 64, is_active: true },
  { group_key: 'city', label: 'Tekirdağ', sort_order: 65, is_active: true },
  { group_key: 'city', label: 'Tokat', sort_order: 66, is_active: true },
  { group_key: 'city', label: 'Trabzon', sort_order: 67, is_active: true },
  { group_key: 'city', label: 'Tunceli', sort_order: 68, is_active: true },
  { group_key: 'city', label: 'Uşak', sort_order: 69, is_active: true },
  { group_key: 'city', label: 'Van', sort_order: 70, is_active: true },
  { group_key: 'city', label: 'Yalova', sort_order: 71, is_active: true },
  { group_key: 'city', label: 'Zonguldak', sort_order: 72, is_active: true },
]

export async function POST() {
  const { supabase, error } = await requireAdmin()

  if (error) return error

  try {
    const { data: existing } = await supabase
      .from('lookup_values')
      .select('group_key, label')
      .in('group_key', ['entity_type', 'client_role', 'client_type', 'payment_status', 'payment_method', 'currency', 'court_instance', 'user_role', 'city'])

    const existingKeys = new Set(existing?.map((e) => `${e.group_key}:${e.label}`) || [])
    const toInsert = LOOKUP_VALUES.filter((v) => !existingKeys.has(`${v.group_key}:${v.label}`))

    if (toInsert.length === 0) {
      return NextResponse.json({ message: 'Tüm değerler zaten mevcut', inserted: 0 })
    }

    const { data, error: insertError } = await supabase
      .from('lookup_values')
      .insert(toInsert)
      .select()

    if (insertError) throw insertError

    return NextResponse.json({
      message: `${data?.length || toInsert.length} değer eklendi`,
      inserted: data?.length || toInsert.length,
      groups: [...new Set(toInsert.map((t) => t.group_key))],
    })
  } catch (routeError) {
    return NextResponse.json(
      {
        error: routeError instanceof Error ? routeError.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  const { supabase, error } = await requireAdmin()

  if (error) return error

  const { data } = await supabase
    .from('lookup_values')
    .select('group_key, label')
    .order('group_key')
    .order('sort_order')

  const grouped = data?.reduce((acc, curr) => {
    if (!acc[curr.group_key]) acc[curr.group_key] = []
    acc[curr.group_key].push(curr.label)
    return acc
  }, {} as Record<string, string[]>)

  return NextResponse.json(grouped)
}
