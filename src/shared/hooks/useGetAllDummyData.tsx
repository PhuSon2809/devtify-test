import { StatusEnum, type InforModelMerge } from '@/model'
import { InforService } from '@/services/infor/infor.service'
import createQueryOptions from '@/services/react-query'
import { useQuery } from '@tanstack/react-query'

const pickOne = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const STATUS_POOL: StatusEnum[] = Object.values(StatusEnum).filter(
  (v): v is StatusEnum => typeof v === 'number'
)

const BASE_2025 = Date.UTC(2025, 0, 1, 0, 0, 0)
const DAY_MS = 86_400_000

export const getAllDummyDataQueryOption = () =>
  createQueryOptions({
    queryKey: ['getAllDummyData'],
    queryFn: async (): Promise<InforModelMerge[]> => {
      const rawInfos = await InforService.getAll()
      return rawInfos.map((info, i) => ({
        ...info,
        id: `${info.id}-${i.toString(36)}`,
        status: pickOne(STATUS_POOL),
        createAt: new Date(BASE_2025 + i * DAY_MS).toISOString().slice(0, 19).replace('T', ' ')
      }))
    }
  })

export const useGetAllDummyData = () => {
  const query = useQuery(getAllDummyDataQueryOption())
  return { ...query, refetch: query.refetch }
}
