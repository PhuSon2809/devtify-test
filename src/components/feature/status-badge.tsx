import { Badge } from '@/components/ui/badge'
import { StatusEnum } from '@/model'

const cls: Record<StatusEnum, string> = {
  [StatusEnum.active]: 'bg-green-100 text-green-700 border-green-200',
  [StatusEnum.inactive]: 'bg-red-100 text-red-700 border-red-200',
  [StatusEnum.needsReview]: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

export function StatusBadge({ value, label }: { value: StatusEnum; label: string }) {
  return <Badge className={cls[value]}>{label}</Badge>
}
