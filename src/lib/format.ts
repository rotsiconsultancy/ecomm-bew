const CURRENCY_SYMBOLS: Record<string, string> = {
  KES: 'KES ',
  EUR: '€',
  USD: '$',
  GBP: '£',
}

export function formatCurrency(amount: number, currency = 'KES'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `
  return `${symbol}${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function timeAgo(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60)  return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)  return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30)     return `${days}d ago`

  return new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
}

export function shortenId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}
