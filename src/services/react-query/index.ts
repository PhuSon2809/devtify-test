import type { InfiniteData, UseInfiniteQueryOptions, UseQueryOptions } from '@tanstack/react-query'

type InferQueryFnReturnType<T extends (...args: any) => any> = Awaited<ReturnType<T>>

interface BaseQueryOptions<TQueryFn extends () => Promise<any>>
  extends Omit<
    UseQueryOptions<
      InferQueryFnReturnType<TQueryFn>,
      Error,
      InferQueryFnReturnType<TQueryFn>,
      readonly unknown[]
    >,
    'queryKey' | 'queryFn'
  > {
  queryKey: readonly unknown[]
  queryFn: TQueryFn
}

export default function createQueryOptions<TQueryFn extends () => Promise<any>>(
  opts: BaseQueryOptions<TQueryFn>
): UseQueryOptions<
  InferQueryFnReturnType<TQueryFn>,
  Error,
  InferQueryFnReturnType<TQueryFn>,
  readonly unknown[]
> {
  return {
    staleTime: 1000 * 60 * 5, // 10 phút
    gcTime: 1000 * 60 * 10, // 10 phút
    retry: 1,
    ...opts
  }
}

// =================== INFINITE QUERY ===================
interface BaseInfiniteQueryOptions<
  TQueryFn extends (context: { pageParam: number | undefined }) => Promise<any>
> extends Omit<
    UseInfiniteQueryOptions<
      InferQueryFnReturnType<TQueryFn>,
      Error,
      InfiniteData<InferQueryFnReturnType<TQueryFn>>,
      readonly unknown[],
      number
    >,
    'queryKey' | 'queryFn'
  > {
  queryKey: readonly unknown[]
  queryFn: TQueryFn
}

export function createInfiniteQueryOptions<
  TQueryFn extends (context: { pageParam: number | undefined }) => Promise<any>
>(opts: BaseInfiniteQueryOptions<TQueryFn>) {
  return {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    ...opts,
    queryFn: async (context: { pageParam: number | undefined }) => {
      try {
        return await opts.queryFn(context)
      } catch (error) {
        console.error('[React InfiniteQuery Error]', error)
        throw error
      }
    }
  }
}
