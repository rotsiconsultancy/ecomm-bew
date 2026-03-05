import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtext: string
  subtextColor?: 'green' | 'red' | 'gray'
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
}

export function StatCard({
  title,
  value,
  subtext,
  subtextColor = 'gray',
  icon: Icon,
  iconBg = 'bg-blue-50',
  iconColor = 'text-[#003366]',
}: StatCardProps) {
  return (
    <Card className="p-6 rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-5">
        <div className={cn('p-2.5 rounded-xl', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-[#003366] leading-none">{value}</p>
      <p className="text-sm text-gray-500 mt-1.5 font-medium">{title}</p>
      <p
        className={cn('text-xs mt-2 font-semibold', {
          'text-green-600': subtextColor === 'green',
          'text-red-500':   subtextColor === 'red',
          'text-gray-400':  subtextColor === 'gray',
        })}
      >
        {subtext}
      </p>
    </Card>
  )
}
