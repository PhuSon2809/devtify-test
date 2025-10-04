import { StatusEnum } from '@/model'

export const STATUS_LABEL: Record<StatusEnum, string> = {
  [StatusEnum.active]: 'Active',
  [StatusEnum.inactive]: 'Inactive',
  [StatusEnum.needsReview]: 'Needs review'
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const normalize = (s: unknown) =>
  String(s ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
