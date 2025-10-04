import { DataTable, DetailSheet, StatusBadge, Toolbar } from '@/components/feature'
import type { StatusFilterValue } from '@/components/feature/toolbar'
import type { InforModelMerge } from '@/model'
import { useGetAllDummyData, useInfiniteScroll } from '@/shared/hooks'
import { normalize, STATUS_LABEL, wait } from '@/shared/utils'
import { Loader } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

const buildSearchText = (r: InforModelMerge) => {
  return [r.id, r.name, r.language, r.bio].map(normalize).join(' | ')
}

const Home = () => {
  const { data: infos = [], isLoading } = useGetAllDummyData()

  const fetchLockRef = useRef(false)
  const [limit, setLimit] = useState<number>(50)
  const [query, setQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all')
  const [rowSize, setRowSize] = useState<'comfortable' | 'compact'>('comfortable')

  const [openDetail, setOpenDetail] = useState(false)
  const [selected, setSelected] = useState<InforModelMerge | null>(null)

  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false)

  const q = useMemo(() => normalize(query), [query])

  const filtered = useMemo(() => {
    const byStatus = statusFilter === 'all' ? infos : infos.filter((r) => r.status === statusFilter)

    if (!q) return byStatus
    return byStatus.filter((r) => buildSearchText(r).includes(q))
  }, [infos, statusFilter, q])

  const infosRender = useMemo(() => filtered.slice(0, limit), [filtered, limit])

  useEffect(() => {
    setHasMore(limit < filtered.length)
  }, [limit, filtered])

  useEffect(() => {
    setLimit(50)
  }, [q, statusFilter])

  const fetchMore = async () => {
    if (!hasMore || fetchLockRef.current) return
    fetchLockRef.current = true
    try {
      setIsFetchingMore(true)
      await wait(600)
      setLimit((v) => Math.min(v + 50, filtered.length))
    } finally {
      setIsFetchingMore(false)
      fetchLockRef.current = false
    }
  }

  const { triggerRef } = useInfiniteScroll({
    fetchMore,
    hasMore,
    threshold: 0.6,
    root: null
  })

  const columns = [
    {
      key: 'rowNumber',
      label: '#',
      width: 56,
      sortable: false
    },
    { key: 'id', label: 'ID', width: 200, sortable: true },
    {
      key: 'bio',
      label: 'Bio',
      width: 280,
      sortable: true,
      render: (r: InforModelMerge) => <p className="line-clamp-2">{r.bio}</p>
    },
    { key: 'name', label: 'Name', width: 180, sortable: true },
    { key: 'language', label: 'Language', width: 140, sortable: true },
    { key: 'version', label: 'Version', width: 160, sortable: true },
    {
      key: 'status',
      label: 'Status',
      width: 140,
      sortable: true,
      render: (r: InforModelMerge) => (
        <StatusBadge value={r.status} label={STATUS_LABEL[r.status]} />
      ),
      getValue: (r: InforModelMerge) => r.status,
      compare: (a: InforModelMerge, b: InforModelMerge) => a.status - b.status
    },
    {
      key: 'createAt',
      label: 'Created Date',
      width: 180,
      sortable: true,
      getValue: (r: InforModelMerge) => Date.parse(r.createAt),
      compare: (a: InforModelMerge, b: InforModelMerge) =>
        Date.parse(a.createAt) - Date.parse(b.createAt)
    }
  ]

  const handleRowClick = (row: InforModelMerge) => {
    setSelected(row)
    setOpenDetail(true)
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <Toolbar
        infos={infosRender}
        onSearch={setQuery}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        rowSize={rowSize}
        onRowSizeChange={setRowSize}
      />

      <div className="min-h-0 flex-1 p-4">
        <DataTable
          fillParent
          columns={columns.map((c) => ({
            ...c,
            label:
              c.key === 'id' ? (
                <div className="flex items-center gap-1">
                  ID <span className="text-muted-foreground text-xs">Primary</span>
                </div>
              ) : (
                c.label
              )
          }))}
          rows={infosRender}
          isLoading={isLoading}
          triggerRef={triggerRef}
          onRowClick={handleRowClick}
          rowSize={rowSize}
          selectedRowId={selected?.id ?? null}
        />
      </div>
      {isFetchingMore && (
        <div className="flex items-center justify-center pb-3">
          <Loader className="size-4 animate-spin text-gray-600" />
        </div>
      )}
      <DetailSheet open={openDetail} onOpenChange={setOpenDetail} data={selected} />
    </div>
  )
}

export default Home
