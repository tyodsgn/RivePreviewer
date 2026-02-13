const DB_NAME = 'rive-previewer'
const DB_VERSION = 1
const STORE_NAME = 'rives'

export interface RiveRecord {
  id: string
  name: string
  buffer: ArrayBuffer
  createdAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
  })
}

export async function getAllRives(): Promise<RiveRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db.close()
      resolve((request.result ?? []).sort((a, b) => b.createdAt - a.createdAt))
    }
  })
}

export async function addRive(name: string, buffer: ArrayBuffer): Promise<RiveRecord> {
  const db = await openDB()
  const record: RiveRecord = {
    id: crypto.randomUUID(),
    name,
    buffer,
    createdAt: Date.now(),
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.add(record)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db.close()
      resolve(record)
    }
  })
}

export async function getRiveById(id: string): Promise<RiveRecord | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db.close()
      resolve(request.result ?? undefined)
    }
  })
}

export async function deleteRive(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db.close()
      resolve()
    }
  })
}
