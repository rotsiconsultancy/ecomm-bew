import { createServiceClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecentOrder {
  id: string
  total_amount: number
  currency: string
  status: string
  created_at: string
  customer_name: string
}

export interface RecentQuote {
  id: string
  full_name: string
  company: string | null
  status: string
  created_at: string
  item_count: number
}

export interface LowStockProduct {
  id: string
  name: string
  slug: string
  stock: number
  category: string | null
}

export interface DashboardData {
  revenue: {
    total: number
    this_month: number
    last_month: number
    change_percent: number
  }
  orders: {
    total: number
    pending: number
    processing: number
    shipped: number
    delivered: number
    this_month: number
    recent: RecentOrder[]
  }
  quotes: {
    total: number
    pending: number
    converted: number
    conversion_rate: number
    recent: RecentQuote[]
  }
  products: {
    total: number
    out_of_stock: number
    quote_only: number
    low_stock_count: number
    low_stock: LowStockProduct[]
  }
  users: {
    total: number
    new_this_month: number
    wholesale: number
  }
  blog: {
    total: number
    published: number
    draft: number
  }
}

// ─── Data Fetcher ─────────────────────────────────────────────────────────────

export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = await createServiceClient()

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  // day 0 of current month = last day of previous month
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  // ── 23 queries fired in parallel ────────────────────────────────────────────
  const [
    revResult,            // 0  — all non-cancelled orders (for revenue aggregation)
    totalOrdersRes,       // 1
    pendingOrdersRes,     // 2
    processingOrdersRes,  // 3
    shippedOrdersRes,     // 4
    deliveredOrdersRes,   // 5
    thisMonthOrdersRes,   // 6
    recentOrdersRes,      // 7
    totalQuotesRes,       // 8
    pendingQuotesRes,     // 9
    convertedQuotesRes,   // 10
    recentQuotesRes,      // 11
    totalProductsRes,     // 12
    outOfStockRes,        // 13
    quoteOnlyRes,         // 14
    lowStockCountRes,     // 15
    lowStockListRes,      // 16
    totalUsersRes,        // 17
    newUsersRes,          // 18
    wholesaleUsersRes,    // 19
    totalPostsRes,        // 20
    publishedPostsRes,    // 21
    draftPostsRes,        // 22
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total_amount, created_at')
      .neq('status', 'cancelled'),

    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'processing']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'shipped'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', startOfThisMonth.toISOString()),

    supabase
      .from('orders')
      .select('id, total_amount, currency, status, created_at, shipping_address, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5),

    supabase.from('quotes').select('*', { count: 'exact', head: true }),
    supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'converted'),

    supabase
      .from('quotes')
      .select('id, full_name, company, status, created_at, items')
      .order('created_at', { ascending: false })
      .limit(5),

    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0).eq('is_active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('pricing_type', 'quote'),
    supabase.from('products').select('*', { count: 'exact', head: true }).gt('stock', 0).lte('stock', 10).eq('is_active', true),

    supabase
      .from('products')
      .select('id, name, slug, stock, category')
      .gt('stock', 0)
      .lte('stock', 10)
      .eq('is_active', true)
      .order('stock', { ascending: true }),

    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfThisMonth.toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'wholesale'),

    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
  ])

  // ── Revenue aggregation (computed in JS from fetched rows) ─────────────────
  const revOrders = revResult.data ?? []

  const total_revenue = revOrders.reduce((s, o) => s + Number(o.total_amount ?? 0), 0)

  const revenue_this_month = revOrders
    .filter((o) => new Date(o.created_at) >= startOfThisMonth)
    .reduce((s, o) => s + Number(o.total_amount ?? 0), 0)

  const revenue_last_month = revOrders
    .filter((o) => {
      const d = new Date(o.created_at)
      return d >= startOfLastMonth && d <= endOfLastMonth
    })
    .reduce((s, o) => s + Number(o.total_amount ?? 0), 0)

  const revenue_change_percent =
    revenue_last_month === 0
      ? revenue_this_month > 0 ? 100 : 0
      : ((revenue_this_month - revenue_last_month) / revenue_last_month) * 100

  // ── Recent orders — resolve customer name ──────────────────────────────────
  const recentOrders: RecentOrder[] = (recentOrdersRes.data ?? []).map((o) => {
    const profile = (o as unknown as { profiles: { full_name?: string } | null }).profiles
    const addr    = o.shipping_address as { full_name?: string } | null
    return {
      id:            o.id,
      total_amount:  Number(o.total_amount),
      currency:      o.currency,
      status:        o.status,
      created_at:    o.created_at,
      customer_name: profile?.full_name ?? addr?.full_name ?? 'Guest',
    }
  })

  // ── Recent quotes ──────────────────────────────────────────────────────────
  const recentQuotes: RecentQuote[] = (recentQuotesRes.data ?? []).map((q) => ({
    id:         q.id,
    full_name:  q.full_name,
    company:    q.company ?? null,
    status:     q.status,
    created_at: q.created_at,
    item_count: Array.isArray(q.items) ? q.items.length : 0,
  }))

  // ── Low stock products ─────────────────────────────────────────────────────
  const lowStockProducts: LowStockProduct[] = (lowStockListRes.data ?? []).map((p) => ({
    id:       p.id,
    name:     p.name,
    slug:     p.slug,
    stock:    p.stock,
    category: p.category ?? null,
  }))

  // ── Counts ─────────────────────────────────────────────────────────────────
  const totalQuotes    = totalQuotesRes.count ?? 0
  const convertedCount = convertedQuotesRes.count ?? 0

  return {
    revenue: {
      total:          total_revenue,
      this_month:     revenue_this_month,
      last_month:     revenue_last_month,
      change_percent: revenue_change_percent,
    },
    orders: {
      total:       totalOrdersRes.count ?? 0,
      pending:     pendingOrdersRes.count ?? 0,
      processing:  processingOrdersRes.count ?? 0,
      shipped:     shippedOrdersRes.count ?? 0,
      delivered:   deliveredOrdersRes.count ?? 0,
      this_month:  thisMonthOrdersRes.count ?? 0,
      recent:      recentOrders,
    },
    quotes: {
      total:           totalQuotes,
      pending:         pendingQuotesRes.count ?? 0,
      converted:       convertedCount,
      conversion_rate: totalQuotes === 0 ? 0 : (convertedCount / totalQuotes) * 100,
      recent:          recentQuotes,
    },
    products: {
      total:           totalProductsRes.count ?? 0,
      out_of_stock:    outOfStockRes.count ?? 0,
      quote_only:      quoteOnlyRes.count ?? 0,
      low_stock_count: lowStockCountRes.count ?? 0,
      low_stock:       lowStockProducts,
    },
    users: {
      total:          totalUsersRes.count ?? 0,
      new_this_month: newUsersRes.count ?? 0,
      wholesale:      wholesaleUsersRes.count ?? 0,
    },
    blog: {
      total:     totalPostsRes.count ?? 0,
      published: publishedPostsRes.count ?? 0,
      draft:     draftPostsRes.count ?? 0,
    },
  }
}
