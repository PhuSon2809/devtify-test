import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { StatusEnum, type InforModelMerge } from '@/model'
import { useDownloadInfos } from '@/shared/hooks'
import { cn, STATUS_LABEL } from '@/shared/utils'
import { Download, Funnel, Plus, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export type StatusFilterValue = 'all' | StatusEnum
export type RowSize = 'comfortable' | 'compact'

export interface ToolbarProps {
  infos: InforModelMerge[]
  className?: string
  onSearch?: (value: string) => void
  defaultSearch?: string
  onAddRow?: () => void
  status?: StatusFilterValue
  onStatusChange?: (value: StatusFilterValue) => void
  /** NEW: đổi mật độ dòng */
  rowSize?: RowSize
  onRowSizeChange?: (size: RowSize) => void
}

const STATUS_OPTIONS: Array<{ value: StatusFilterValue; label: string }> = [
  { value: 'all', label: 'All' },
  { value: StatusEnum.active, label: STATUS_LABEL[StatusEnum.active] },
  { value: StatusEnum.needsReview, label: STATUS_LABEL[StatusEnum.needsReview] },
  { value: StatusEnum.inactive, label: STATUS_LABEL[StatusEnum.inactive] }
]

export function Toolbar({
  infos,
  className,
  onSearch,
  defaultSearch = '',
  onAddRow,
  status = 'all',
  onStatusChange,
  rowSize = 'comfortable',
  onRowSizeChange
}: ToolbarProps) {
  const [search, setSearch] = useState(defaultSearch)
  useEffect(() => setSearch(defaultSearch), [defaultSearch])

  const { isLoading, progress, download, cancel } = useDownloadInfos(infos, {
    prebuild: false,
    chunkSize: 1000,
    filename: 'infor-list.csv'
  })
  const pct = Math.round(progress * 100)

  return (
    <div className={cn('flex flex-wrap items-center gap-2 border-b bg-white p-3', className)}>
      {/* Logo gradient */}
      <p className="text-2xl leading-none font-semibold">
        <span className="text-[#0B1B45]">devtif</span>
        <span className="bg-[linear-gradient(135deg,#FF2E83_0%,#D54CFF_50%,#7B61FF_100%)] bg-clip-text text-transparent">
          y
        </span>
      </p>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => {
            const v = e.target.value
            setSearch(v)
            onSearch?.(v)
          }}
          placeholder="Search by id, name, language..."
          className="pl-8"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Chip đếm rows */}
        <span className="text-muted-foreground inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500" />
          Showing {infos.length.toLocaleString()} rows
        </span>

        {/* Density toggle */}
        <div className="hidden rounded-lg border p-1 md:flex">
          <Button
            variant={rowSize === 'comfortable' ? 'default' : 'ghost'}
            size="sm"
            className="h-8"
            onClick={() => onRowSizeChange?.('comfortable')}
          >
            Comfort
          </Button>
          <Button
            variant={rowSize === 'compact' ? 'default' : 'ghost'}
            size="sm"
            className="h-8"
            onClick={() => onRowSizeChange?.('compact')}
          >
            Compact
          </Button>
        </div>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Funnel className="size-4" />
              <span className="hidden sm:inline">
                Status: {STATUS_OPTIONS.find((o) => o.value === status)?.label}
              </span>
              <span className="sm:hidden">
                {STATUS_OPTIONS.find((o) => o.value === status)?.label}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={String(status)}
              onValueChange={(val) => {
                const option = STATUS_OPTIONS.find((o) => String(o.value) === val)
                if (option) onStatusChange?.(option.value)
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuRadioItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add row */}
        {onAddRow && (
          <Button onClick={onAddRow} className="gap-2">
            <Plus className="size-4" />
            Add
          </Button>
        )}

        {/* Export CSV */}
        {!isLoading ? (
          <Button
            onClick={download}
            disabled={!infos?.length}
            className="gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white hover:from-fuchsia-500 hover:to-indigo-500"
            title={infos?.length ? 'Export CSV' : 'No data'}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" disabled>
              <Download className="size-4 animate-pulse" />
              Preparing {pct}%
            </Button>
            <Button variant="ghost" size="icon" onClick={cancel} title="Cancel export">
              <X className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Toolbar
