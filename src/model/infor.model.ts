export enum StatusEnum {
  active,
  needsReview,
  inactive
}

export interface InforModel {
  id: string
  name: string
  bio: string
  language: string
  version: string
}

export interface InforModelMerge {
  id: string
  name: string
  bio: string
  language: string
  version: string
  status: StatusEnum
  createAt: string
}
