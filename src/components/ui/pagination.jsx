import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

export function Pagination({ currentPage, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i)
  }

  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <p className="text-sm text-ink-500">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages[0] > 1 && (
          <>
            <PageBtn page={1} current={currentPage} onClick={onPageChange} />
            {pages[0] > 2 && <span className="px-1 text-ink-400 text-sm">...</span>}
          </>
        )}

        {pages.map((p) => (
          <PageBtn key={p} page={p} current={currentPage} onClick={onPageChange} />
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-ink-400 text-sm">...</span>}
            <PageBtn page={totalPages} current={currentPage} onClick={onPageChange} />
          </>
        )}

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function PageBtn({ page, current, onClick }) {
  return (
    <Button
      variant={page === current ? 'primary' : 'outline'}
      size="icon-sm"
      onClick={() => onClick(page)}
    >
      {page}
    </Button>
  )
}
