import { createAdminClient } from '@/lib/supabase/admin'
import { AdminClient } from './admin-client'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = createAdminClient()

  // Fetch all psychologists with stats
  const { data: psychologists } = await admin
    .from('psychologists')
    .select('*')
    .order('created_at', { ascending: false })

  // For each psychologist, count patients
  const ids = (psychologists ?? []).map((p) => p.id)

  const { data: patientCounts } = ids.length
    ? await admin
        .from('patients')
        .select('psychologist_id')
        .in('psychologist_id', ids)
    : { data: [] }

  const countMap: Record<string, number> = {}
  for (const row of patientCounts ?? []) {
    countMap[row.psychologist_id] = (countMap[row.psychologist_id] ?? 0) + 1
  }

  const rows = (psychologists ?? []).map((p) => ({
    ...p,
    patient_count: countMap[p.id] ?? 0,
  }))

  return <AdminClient rows={rows} />
}
