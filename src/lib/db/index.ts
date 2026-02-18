import Dexie, { type EntityTable } from 'dexie'

export interface LocalPatient {
  localId: string
  remoteId?: string
  data: Record<string, unknown>
  currentStep: number
  status: 'draft' | 'complete' | 'verified'
  syncStatus: 'pending' | 'synced' | 'conflict'
  createdBy: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface SyncQueueItem {
  id?: number
  localId: string
  action: 'create' | 'update' | 'delete'
  data: Record<string, unknown>
  timestamp: string
  retries: number
}

class TraumaDB extends Dexie {
  patients!: EntityTable<LocalPatient, 'localId'>
  syncQueue!: EntityTable<SyncQueueItem, 'id'>

  constructor() {
    super('trauma-registry')
    this.version(1).stores({
      patients: 'localId, remoteId, status, syncStatus, createdBy, updatedAt, deletedAt',
      syncQueue: '++id, localId, action, timestamp',
    })
  }
}

export const db = new TraumaDB()
