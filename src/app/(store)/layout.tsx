import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { full_name: string | null; role: string } | null = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .maybeSingle()
    profile = data
  }

  const authUser = user
    ? { id: user.id, email: user.email ?? '' }
    : null

  return (
    <>
      <Header user={authUser} profile={profile} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
