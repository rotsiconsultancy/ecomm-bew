import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams: Record<string, string | string[] | undefined>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams()
    
    // Copy existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          params.append(key, value as string)
        }
      }
    })
    
    // Add new page param
    if (page > 1) {
      params.set('page', page.toString())
    }
    
    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  const getPageNumbers = () => {
    const pages = []
    const showMax = 5
    
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      let start = Math.max(1, currentPage - 2)
      let end = Math.min(totalPages, start + showMax - 1)
      
      if (end === totalPages) {
        start = Math.max(1, end - showMax + 1)
      }
      
      for (let i = start; i <= end; i++) pages.push(i)
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-12">
      {/* Previous */}
      <Link
        href={createPageUrl(currentPage - 1)}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:border-brand-orange hover:text-brand-orange",
          currentPage <= 1 && "pointer-events-none opacity-50"
        )}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center space-x-2">
        {getPageNumbers().map((page) => (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg border text-sm font-bold transition-all",
              currentPage === page
                ? "bg-brand-navy border-brand-navy text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange"
            )}
          >
            {page}
          </Link>
        ))}
      </div>

      {/* Next */}
      <Link
        href={createPageUrl(currentPage + 1)}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-600 transition-all hover:border-brand-orange hover:text-brand-orange",
          currentPage >= totalPages && "pointer-events-none opacity-50"
        )}
        aria-disabled={currentPage >= totalPages}
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  )
}
