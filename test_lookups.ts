import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data } = await supabase.from('lookup_values').select('group_key').limit(100)
  const keys = [...new Set(data?.map(d => d.group_key))]
  console.log("Distinct Group Keys:", keys)
}
test()
