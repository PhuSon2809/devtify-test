import { Outlet } from '@tanstack/react-router'

function MainLayout() {
  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <div className="container mx-auto flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </main>
  )
}

export default MainLayout
