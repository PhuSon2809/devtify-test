import type { IConfig } from './config.type'

export const config: IConfig = {
  dummyApi: import.meta.env.VITE_DUMMY_API || ''
}
