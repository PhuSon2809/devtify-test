export type Query = Record<string, string | number | boolean | null | undefined> | URLSearchParams

export interface ApiClientOptions {
  baseURL: string
  defaultHeaders?: Record<string, string>
  timeoutMs?: number
  getToken?: () => string | null | undefined
}

export class ApiError<T = any> extends Error {
  status: number
  statusText: string
  data?: T

  constructor(status: number, statusText: string, message: string, data?: T) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

type BodyType = BodyInit | Record<string, any> | undefined

function buildUrl(baseURL: string, path: string, query?: Query) {
  const url = new URL(
    path.startsWith('http') ? path : `${baseURL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
  )

  if (query) {
    const params = query instanceof URLSearchParams ? query : new URLSearchParams()
    if (!(query instanceof URLSearchParams)) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== null && v !== undefined) params.append(k, String(v))
      })
    }
    params.forEach((value, key) => url.searchParams.append(key, value))
  }

  return url.toString()
}

function isJsonLike(body?: BodyType) {
  if (!body) return false
  if (typeof body === 'string') return false
  if (body instanceof FormData) return false
  if (body instanceof Blob) return false
  if (body instanceof URLSearchParams) return false
  if (body instanceof ArrayBuffer) return false
  if (ArrayBuffer.isView(body as any)) return false
  return typeof body === 'object'
}

export class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private timeoutMs?: number
  private getToken?: ApiClientOptions['getToken']

  constructor(opts: ApiClientOptions) {
    this.baseURL = opts.baseURL
    this.defaultHeaders = opts.defaultHeaders ?? { Accept: 'application/json' }
    this.timeoutMs = opts.timeoutMs
    this.getToken = opts.getToken
  }

  async request<T>(
    path: string,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      query?: Query
      body?: BodyType
      headers?: Record<string, string>
      signal?: AbortSignal
    }
  ): Promise<T> {
    const { method = 'GET', query, body, headers, signal } = options ?? {}

    const url = buildUrl(this.baseURL, path, query)

    const controller = new AbortController()
    const timer =
      this.timeoutMs && !signal ? setTimeout(() => controller.abort(), this.timeoutMs) : undefined

    if (signal) {
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }

    const token = this.getToken?.()

    const finalHeaders: Record<string, string> = {
      ...this.defaultHeaders,
      ...(headers ?? {})
    }

    let finalBody: BodyInit | undefined = undefined

    if (isJsonLike(body)) {
      finalHeaders['Content-Type'] = finalHeaders['Content-Type'] ?? 'application/json'
      finalBody = JSON.stringify(body)
    } else if (
      typeof body === 'string' ||
      (body as any) instanceof Blob ||
      body instanceof FormData ||
      body instanceof URLSearchParams
    ) {
      finalBody = body as BodyInit
    }

    if (token) {
      finalHeaders['Authorization'] = finalHeaders['Authorization'] ?? `Bearer ${token}`
    }

    try {
      const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: method === 'GET' || method === 'DELETE' ? undefined : finalBody,
        signal: controller.signal
      })

      if (res.status === 204) return undefined as unknown as T

      const contentType = res.headers.get('content-type') || ''

      let data: any = undefined
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => undefined)
      } else {
        const text = await res.text().catch(() => '')
        data = text
      }

      if (!res.ok) {
        throw new ApiError(res.status, res.statusText, `HTTP ${res.status} ${res.statusText}`, data)
      }

      return data as T
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new ApiError(0, 'AbortError', 'Request aborted by timeout or caller')
      }
      if (err instanceof ApiError) throw err
      throw new ApiError(0, 'NetworkError', err?.message ?? 'Network error')
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  get<T>(
    path: string,
    query?: Query,
    opts?: { headers?: Record<string, string>; signal?: AbortSignal }
  ) {
    return this.request<T>(path, { method: 'GET', query, ...(opts ?? {}) })
  }
  post<T>(
    path: string,
    body?: BodyType,
    opts?: { headers?: Record<string, string>; signal?: AbortSignal; query?: Query }
  ) {
    return this.request<T>(path, { method: 'POST', body, ...(opts ?? {}) })
  }
  put<T>(
    path: string,
    body?: BodyType,
    opts?: { headers?: Record<string, string>; signal?: AbortSignal; query?: Query }
  ) {
    return this.request<T>(path, { method: 'PUT', body, ...(opts ?? {}) })
  }
  patch<T>(
    path: string,
    body?: BodyType,
    opts?: { headers?: Record<string, string>; signal?: AbortSignal; query?: Query }
  ) {
    return this.request<T>(path, { method: 'PATCH', body, ...(opts ?? {}) })
  }
  delete<T>(
    path: string,
    query?: Query,
    opts?: { headers?: Record<string, string>; signal?: AbortSignal }
  ) {
    return this.request<T>(path, { method: 'DELETE', query, ...(opts ?? {}) })
  }
}
