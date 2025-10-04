import MainLayout from '@/layouts/main-layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent
})

function RouteComponent() {
  return <MainLayout />
}
