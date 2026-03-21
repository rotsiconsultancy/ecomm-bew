'use client'

import { useState, useTransition } from 'react'
import { Loader2, Plus, X, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CompanionRow {
  id: string
  companion_product_id: string
  companion_name: string
  sort_order: number
}

interface SearchResult {
  id: string
  name: string
}

interface Props {
  productId: string
  companions: CompanionRow[]
}

export function CompanionEditor({ productId, companions: initial }: Props) {
  const [isPending, startTransition] = useTransition()
  const [companions, setCompanions] = useState(initial)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleSearch(query: string) {
    setSearch(query)
    if (query.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(query)}&exclude=${productId}`)
    const data = await res.json()
    setResults(data.products ?? [])
    setSearching(false)
  }

  function handleAdd(product: SearchResult) {
    if (companions.length >= 4) return
    if (companions.some((c) => c.companion_product_id === product.id)) return

    startTransition(async () => {
      const res = await fetch('/api/admin/product-companions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          companion_product_id: product.id,
          sort_order: companions.length,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCompanions((prev) => [
          ...prev,
          {
            id: data.id,
            companion_product_id: product.id,
            companion_name: product.name,
            sort_order: companions.length,
          },
        ])
        setSearch('')
        setResults([])
        setMsg('Added!')
        setTimeout(() => setMsg(null), 1500)
      }
    })
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await fetch(`/api/admin/product-companions?id=${id}`, { method: 'DELETE' })
      setCompanions((prev) => prev.filter((c) => c.id !== id))
      setMsg('Removed')
      setTimeout(() => setMsg(null), 1500)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-[#003366]">Companion Products</h3>
          <p className="text-xs text-gray-400">Up to 4 products shown during checkout (overrides category rules)</p>
        </div>
        {msg && <span className="text-xs font-bold text-green-600">{msg}</span>}
      </div>

      {/* Current companions */}
      <div className="space-y-2">
        {companions.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"
          >
            <GripVertical className="w-4 h-4 text-gray-300" />
            <span className="flex-1 text-sm font-semibold text-[#003366]">
              {c.companion_name}
            </span>
            <button
              onClick={() => handleRemove(c.id)}
              disabled={isPending}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {companions.length === 0 && (
          <p className="text-sm text-gray-400 py-2">No companion products set. Category rules will be used.</p>
        )}
      </div>

      {/* Search to add */}
      {companions.length < 4 && (
        <div className="relative">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products to add..."
              className="h-9 text-sm"
            />
            {searching && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>
          {results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleAdd(r)}
                  disabled={isPending}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-[#003366] font-medium border-b border-gray-50 last:border-0"
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
