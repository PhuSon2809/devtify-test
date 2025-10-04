import { useCallback, useEffect, useRef, useState } from 'react'
import type { InforModelMerge } from '@/model'
import { STATUS_LABEL } from '@/shared/utils'
import { toast } from 'sonner'

export type ColumnDef = { key: keyof InforModelMerge | 'rowNumber'; label: string }

export const infoColumns: ColumnDef[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'bio', label: 'Bio' },
  { key: 'language', label: 'Language' },
  { key: 'version', label: 'Version' },
  { key: 'status', label: 'Status' },
  { key: 'createAt', label: 'Created date' }
]

const escapeCsv = (v: unknown) => {
  if (v === null || v === undefined) return ''
  const s = String(v)
  const needQuote = /[",\n]/.test(s)
  const escaped = s.replace(/"/g, '""')
  return needQuote ? `"${escaped}"` : escaped
}

const rowToCells = (r: InforModelMerge, cols: ColumnDef[], idx: number) =>
  cols
    .map((c) => {
      if (c.key === 'rowNumber') return escapeCsv(idx + 1)
      const k = c.key as keyof InforModelMerge
      if (k === 'status') return escapeCsv(STATUS_LABEL[r.status])
      return escapeCsv(r[k])
    })
    .join(',')

const tick = () => new Promise((res) => setTimeout(res))

type Options = {
  columns?: ColumnDef[]
  filename?: string
  chunkSize?: number
  prebuild?: boolean
  onProgress?: (p: number) => void
}

function requestIdle(cb: () => void) {
  const ric = typeof window !== 'undefined' && window.requestIdleCallback
  if (ric) {
    ric(() => cb())
  } else {
    setTimeout(cb, 0)
  }
}

async function buildCsvBlob(
  data: InforModelMerge[],
  columns: ColumnDef[],
  signal?: AbortSignal,
  chunkSize = 1000,
  onProgress?: (p: number) => void
): Promise<Blob> {
  const parts: string[] = []
  parts.push('\uFEFF')

  parts.push(columns.map((c) => escapeCsv(c.label)).join(','), '\n')

  const total = data.length
  for (let i = 0; i < total; i += chunkSize) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const slice = data.slice(i, Math.min(i + chunkSize, total))
    const lines = slice.map((row, j) => rowToCells(row, columns, i + j)).join('\n')
    parts.push(lines, '\n')
    onProgress?.(Math.min(1, (i + slice.length) / total))
    await tick()
  }

  return new Blob(parts, { type: 'text/csv;charset=utf-8;' })
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

export function useDownloadInfos(
  infos: InforModelMerge[],
  {
    columns = infoColumns,
    filename = `infor-list-${Date.now()}.csv`,
    chunkSize = 1000,
    prebuild = false,
    onProgress
  }: Options = {}
) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  // prebuilt blob url (nếu bật prebuild)
  const urlRef = useRef<string | null>(null)

  // cleanup blob URL khi unmount / đổi dữ liệu
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
  }, [])

  // Prebuild khi rảnh (optional)
  useEffect(() => {
    if (!prebuild) {
      // huỷ prebuild cũ
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
      return
    }
    // build lại khi infos/columns đổi
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setIsLoading(true)
    setProgress(0)

    requestIdle(() => {
      buildCsvBlob(infos, columns, ctrl.signal, chunkSize, (p) => {
        setProgress(p)
        onProgress?.(p)
      })
        .then((blob) => {
          if (ctrl.signal.aborted) return
          urlRef.current = URL.createObjectURL(blob)
        })
        .finally(() => {
          if (!ctrl.signal.aborted) setIsLoading(false)
        })
    })

    return () => {
      ctrl.abort()
    }
  }, [prebuild, infos, columns, chunkSize])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(false)
  }, [])

  const download = useCallback(async () => {
    // nếu đã prebuild xong thì tải ngay
    if (urlRef.current) {
      triggerDownload(urlRef.current, filename)
      return
    }
    // build tại thời điểm click
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setIsLoading(true)
    setProgress(0)
    try {
      const blob = await buildCsvBlob(infos, columns, ctrl.signal, chunkSize, (p) => {
        setProgress(p)
        onProgress?.(p)
      })
      const url = URL.createObjectURL(blob)
      triggerDownload(url, filename)
      URL.revokeObjectURL(url)
      toast.success('Export file successfull')
    } catch (error: any) {
      console.log('ERROR EXPORT FILE', error)
      toast.error(error.message ?? 'Export file faild')
    } finally {
      if (!ctrl.signal.aborted) setIsLoading(false)
    }
  }, [infos, columns, filename, chunkSize, onProgress])

  return { isLoading, progress, download, cancel }
}
