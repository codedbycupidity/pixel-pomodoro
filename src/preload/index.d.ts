import { ElectronAPI } from '@electron-toolkit/preload'

export interface WindowAPI {
  minimize: () => void
  toggleMaximize: () => void
  close: () => void
}

export interface API {
  window: WindowAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
