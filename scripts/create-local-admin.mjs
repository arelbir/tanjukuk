import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY tanımlı değil. .env.local içindeki yerel anahtarı kullanın.')
  process.exit(1)
}

const email = (process.env.LOCAL_ADMIN_EMAIL ?? 'admin@hukuk.local').trim().toLowerCase()
const password = process.env.LOCAL_ADMIN_PASSWORD ?? 'LocalAdmin123!'
const fullName = process.env.LOCAL_ADMIN_NAME ?? 'Yerel Admin'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function upsertAdminProfile(userId) {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role: 'admin',
        is_active: true,
      },
      { onConflict: 'id' }
    )

  if (error) {
    throw new Error(`Yerel admin profili güncellenemedi: ${error.message}`)
  }
}

const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()

if (listError) {
  console.error(`Yerel kullanıcılar okunamadı: ${listError.message}`)
  process.exit(1)
}

const existingUser = usersData.users.find((user) => user.email?.toLowerCase() === email)

if (existingUser) {
  const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'admin',
    },
  })

  if (updateError) {
    console.error(`Yerel admin güncellenemedi: ${updateError.message}`)
    process.exit(1)
  }

  try {
    await upsertAdminProfile(existingUser.id)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  console.log(`Yerel admin güncellendi: ${email}`)
  process.exit(0)
}

const { data: createdData, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    full_name: fullName,
    role: 'admin',
  },
})

if (createError) {
  console.error(`Yerel admin oluşturulamadı: ${createError.message}`)
  process.exit(1)
}

if (!createdData.user) {
  console.error('Yerel admin oluşturuldu ancak kullanıcı bilgisi dönmedi.')
  process.exit(1)
}

try {
  await upsertAdminProfile(createdData.user.id)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

console.log(`Yerel admin oluşturuldu: ${createdData.user.email}`)
