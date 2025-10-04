import { cn } from '@/shared/utils'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Loader } from 'lucide-react'

export interface Column {
  key: string
  label: React.ReactNode
  width?: number
  render?: (row: any, idx?: number) => React.ReactNode
  sortable?: boolean
  getValue?: (row: any) => unknown
  compare?: (a: any, b: any) => number
}

interface DataTableProps {
  columns: Column[]
  rows: any[]
  isLoading?: boolean
  triggerRef?: React.RefObject<HTMLDivElement | null>
  onRowClick?: (row: any, idx: number) => void
  rowSize?: 'comfortable' | 'compact'
  selectedRowId?: string | null
  fillParent?: boolean
  loadingMore?: boolean
}

type SortDir = 'asc' | 'desc' | null

const DataTable = memo(
  ({
    columns = [],
    rows = [],
    isLoading,
    triggerRef,
    onRowClick,
    rowSize = 'comfortable',
    selectedRowId = null,
    fillParent = false,
    loadingMore = false
  }: DataTableProps) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
      const el = scrollRef.current
      if (!el) return
      const onScroll = () => setScrolled(el.scrollTop > 0)
      el.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
      return () => el.removeEventListener('scroll', onScroll)
    }, [])

    // sort
    const [sortKey, setSortKey] = useState<string | null>(null)
    const [sortDir, setSortDir] = useState<SortDir>(null)
    const cycleDir = (p: SortDir): SortDir => (p === null ? 'asc' : p === 'asc' ? 'desc' : null)
    const handleSortClick = (col: Column) => {
      if (!col.sortable) return
      setSortKey((k) => {
        if (k !== col.key) {
          setSortDir('asc')
          return col.key
        }
        setSortDir((d) => cycleDir(d))
        return col.key
      })
    }
    const defaultCompare = (va: unknown, vb: unknown) => {
      if (typeof va === 'number' && typeof vb === 'number') return va - vb
      const da = Date.parse(String(va)),
        db = Date.parse(String(vb))
      if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db
      return String(va ?? '').localeCompare(String(vb ?? ''), undefined, { sensitivity: 'base' })
    }
    const sortedRows = useMemo(() => {
      if (!sortKey || !sortDir) return rows
      const col = columns.find((c) => c.key === sortKey)
      if (!col) return rows
      const getVal = col.getValue ?? ((r: any) => (r as any)[col.key])
      const cmp = col.compare ?? ((a: any, b: any) => defaultCompare(getVal(a), getVal(b)))
      return [...rows].sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)))
    }, [rows, columns, sortKey, sortDir])

    const cellPad = rowSize === 'compact' ? 'px-3 py-2' : 'px-4 py-3'
    const headPad = rowSize === 'compact' ? 'px-3 py-2.5' : 'px-4 py-3.5'

    return (
      <div
        className={cn('overflow-hidden rounded-md border', fillParent && 'flex h-full flex-col')}
      >
        <div
          ref={scrollRef}
          className={cn('overflow-auto', fillParent ? 'min-h-0 flex-1' : 'max-h-[83vh]')}
        >
          <table
            className={cn(
              'w-full table-fixed border-separate border-spacing-0',
              '[&_th]:border-border [&_td]:border-border [&_td]:border-b [&_th]:border-b',
              '[&_tbody_tr:last-child_td]:border-b-0'
            )}
          >
            <thead className={cn(scrolled && 'shadow-sm', 'sticky top-0 z-30 bg-white')}>
              <tr className="bg-white/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
                {columns.map((c, ci) => {
                  const active = sortKey === c.key ? sortDir : null
                  return (
                    <th
                      key={c.key}
                      className={cn(
                        ci === 0 && 'text-center',
                        'whitespace-nowrap',
                        c.sortable && 'cursor-pointer select-none'
                      )}
                      style={{ width: c.width ? `${c.width}px` : undefined }}
                      onClick={() => handleSortClick(c)}
                      scope="col"
                    >
                      <div className={cn('flex items-center gap-1 font-medium', headPad)}>
                        {c.label}
                        {c.sortable && (
                          <span className="text-muted-foreground text-xs">
                            {active === 'asc' && '▲'}
                            {active === 'desc' && '▼'}
                            {!active && '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-6 text-center">
                    <Loader className="mx-auto animate-spin" />
                  </td>
                </tr>
              ) : sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-10 text-center">
                    <div className="text-muted-foreground text-sm">No data</div>
                  </td>
                </tr>
              ) : (
                sortedRows.map((r, rowIdx) => (
                  <tr
                    key={(r && (r.id ?? rowIdx)) ?? rowIdx}
                    onClick={() => onRowClick?.(r, rowIdx)}
                    data-selected={selectedRowId && String(selectedRowId) === String(r?.id)}
                    className={cn(
                      'group relative',
                      'even:bg-muted/30 odd:bg-white',
                      'hover:bg-primary/5 transition-colors',
                      onRowClick && 'cursor-pointer',
                      'data-[selected=true]:bg-primary/10 data-[selected=true]:outline-primary/30 data-[selected=true]:outline-1'
                    )}
                  >
                    {columns.map((c) => {
                      const isIndexCol = c.key === 'rowNumber'
                      return (
                        <td
                          key={c.key}
                          className={cn(
                            cellPad,
                            isIndexCol && 'border-r bg-inherit text-center',
                            c.key === 'bio' ? 'whitespace-normal' : 'truncate'
                          )}
                        >
                          {isIndexCol
                            ? rowIdx + 1
                            : c.render
                              ? c.render(r, rowIdx) // truyền rowIdx
                              : String((r as any)?.[c.key] ?? '')}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}

              {triggerRef && (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    <div
                      ref={triggerRef}
                      className="text-muted-foreground flex items-center justify-center gap-2 py-2 text-xs"
                    >
                      {loadingMore && <Loader className="size-4 animate-spin" />}
                      {loadingMore ? 'Loading more…' : ''}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

export default DataTable
