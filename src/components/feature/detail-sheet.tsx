import { StatusBadge } from '@/components/feature'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import type { InforModelMerge } from '@/model'
import { STATUS_LABEL } from '@/shared/utils'
import { memo } from 'react'

export interface DetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: InforModelMerge | null
}

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <>
    <div className="text-muted-foreground">{label}</div>
    <div className="min-h-5">{value ?? '-'}</div>
  </>
)

const DetailSheet = memo(({ open, onOpenChange, data }: DetailSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[560px] sm:max-w-[560px]">
        <SheetHeader>
          <SheetTitle className="text-lg">Detail</SheetTitle>
          <SheetDescription className="text-sm">Row information</SheetDescription>
        </SheetHeader>

        <Separator className="mb-4" />

        {/* Content */}
        {data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] gap-2 px-5 text-sm">
              <DetailRow label="ID" value={<span className="font-medium">{data.id}</span>} />
              <DetailRow label="Name" value={data.name} />
              <DetailRow label="Language" value={data.language} />
              <DetailRow label="Version" value={data.version} />
              <DetailRow
                label="Status"
                value={<StatusBadge value={data.status} label={STATUS_LABEL[data.status]} />}
              />
              <DetailRow label="Created" value={data.createAt} />
              <DetailRow
                label="Bio"
                value={<div className="whitespace-pre-line">{data.bio}</div>}
              />
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">Select a row to view details.</div>
        )}
      </SheetContent>
    </Sheet>
  )
})

export default DetailSheet
