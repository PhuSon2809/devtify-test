# Getting Started

To run this application:

```bash
yarn
yarn run dev
```

# Building For Production

To build this application for production:

```bash
yarn run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
yarn run test
```

# Devtify – Data Table Demo

Một mini-project trình diễn **bảng dữ liệu có hiệu năng tốt** với trải nghiệm thân thiện: header dính (sticky), lọc & tìm kiếm, sắp xếp, vô hạn (infinite scroll), xem chi tiết (Sheet/Dialog) và **xuất CSV** theo lô (có tiến độ & hủy).

> Tech chính: **React + TypeScript + Tailwind + shadcn/ui + lucide-react**.  
> Kiến trúc tách rời `DataTable` / `Toolbar` / `DetailSheet` / hooks dùng lại.

---

## ✨ Tính năng chính

- **Sticky header** và **sticky cột #** (nếu dùng cột đánh số).
- **Sortable** theo từng cột (mặc định có `defaultCompare`, có thể custom `compare/getValue`).
- **Search** không phân biệt hoa thường, bỏ dấu (`normalize`) trên nhiều field (id, name, language, bio...).
- **Filter theo Status** ngay trên **Toolbar** (Dropdown).
- **Infinite scroll** với `IntersectionObserver` (hook `useInfiniteScroll`) + sentinel cuối bảng.
- **DetailSheet**: bấm 1 dòng để xem chi tiết gọn gàng ở panel bên phải.
- **Export CSV**: cơ chế build **theo lô (chunk)**, có `progress`, `cancel`, hỗ trợ **15.000+ rows** mượt mà.
- **Responsive layout**: `100dvh` + `flex-1 min-h-0`, bảng tự chiếm toàn bộ chiều cao còn lại dưới Toolbar.

---

## 🧱 Cấu trúc chính

```
src/
  components/
    feature/
      data-table.tsx        # <table> thuần, sticky header, sticky cột#, zebra row
      toolbar.tsx          # Search + Status filter + Export CSV + Density toggle
      detail-sheet.tsx      # Panel chi tiết (shadcn Sheet)
  model/
    index.ts               # InforModelMerge, StatusEnum, ...
  services/
    infor/infor.service.ts # nguồn dữ liệu (mock/api)
    react-query.ts         # createQueryOptions...
  shared/
    hooks/
      useGetAllDummyData.ts     # lấy data + sinh status, createAt (dummy)
      useInfiniteScroll.ts      # observer cho infinite scroll
      useHandleDownloadInfos.ts # build CSV theo lô (progress/cancel)
    utils/
      index.ts              # normalize, STATUS_LABEL, wait, cn...
```

## 🧰 Sử dụng nhanh

### 1) `Home.tsx` (ví dụ tích hợp)

```tsx
import { DataTable, DetailSheet, StatusBadge, Toolbar } from '@/components/feature'
import { useGetAllDummyData, useInfiniteScroll } from '@/shared/hooks'
import { normalize, STATUS_LABEL, wait } from '@/shared/utils'

const buildSearchText = (r) => [r.id, r.name, r.language, r.bio].map(normalize).join(' | ')
```

### 2) `DataTable` – Props chính

```ts
type Column = {
  key: string
  label: React.ReactNode
  width?: number
  sortable?: boolean
  render?: (row: any, rowIdx?: number) => React.ReactNode
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
```

### 3) `Toolbar` – Search, Filter, Export CSV, Density

`Toolbar` nhận `infos`, `onSearch`, `status`, `onStatusChange`, `rowSize`, `onRowSizeChange`.

### 4) `DetailSheet` – xem chi tiết

`DetailSheet` mở khi click dòng, truyền `data={selected}`.

---

## 🧪 Dữ liệu mẫu & định danh

`useGetAllDummyData()` sinh status ngẫu nhiên + createAt; có thể tạo id từ 2 gốc và thêm chỉ số base36 để không trùng:

```ts
id: `${info.id}_${info.version ?? ''}_${i.toString(36)}`
```

## ⚙️ Hiệu năng & Quy ước

- 15k rows: **filter trước, slice sau**; `hasMore` dựa danh sách đã lọc; đổi query/status thì **reset limit**.
- CSV: build **theo lô** (1000 dòng), có `progress` & `cancel`.

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Routing

This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from '@tanstack/react-router'
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/people',
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json() as Promise<{
      results: {
        name: string
      }[]
    }>
  },
  component: () => {
    const data = peopleRoute.useLoaderData()
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    )
  }
})
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
yarn add @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ...

const queryClient = new QueryClient()

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  )
})
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from '@tanstack/react-query'

import './App.css'

function App() {
  const { data } = useQuery({
    queryKey: ['people'],
    queryFn: () =>
      fetch('https://swapi.dev/api/people')
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: []
  })

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
yarn add @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

function App() {
  const count = useStore(countStore)
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>Increment - {count}</button>
    </div>
  )
}

export default App
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from '@tanstack/react-store'
import { Store, Derived } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore]
})
doubledStore.mount()

function App() {
  const count = useStore(countStore)
  const doubledCount = useStore(doubledStore)

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>Increment - {count}</button>
      <div>Doubled - {doubledCount}</div>
    </div>
  )
}

export default App
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
