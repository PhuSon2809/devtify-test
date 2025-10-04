import { config } from '@/config'
import { ApiClient } from '../apis'
import type { InforModel } from '@/model'

const api = new ApiClient({ baseURL: config.dummyApi })

export const InforService = {
  getAll() {
    return api.get<InforModel[]>('/Demos/json-dummy-data/5MB.json')
  }
}
