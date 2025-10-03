import { useEffect, useRef } from 'react'

interface InfiniteScrollOptions {
  fetchMore: () => void
  hasMore: boolean
  threshold?: number
  root?: HTMLElement | null
}

export function useInfiniteScroll({
  fetchMore,
  hasMore,
  threshold = 0.5,
  root = null
}: InfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const triggerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hasMore || !triggerRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore()
        }
      },
      { root, threshold }
    )

    observerRef.current.observe(triggerRef.current)

    return () => {
      if (observerRef.current && triggerRef.current) {
        observerRef.current.unobserve(triggerRef.current)
      }
    }
  }, [fetchMore, hasMore, root, threshold])

  return { triggerRef }
}
