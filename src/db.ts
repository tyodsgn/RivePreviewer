import { supabase } from './lib/supabase'

const BUCKET = 'rives'
const TABLE = 'rives'

export interface RiveRecord {
  id: string
  name: string
  buffer: ArrayBuffer
  createdAt: number
}

// In-memory cache to avoid re-downloading .riv files
const bufferCache = new Map<string, ArrayBuffer>()

async function downloadBuffer(storagePath: string): Promise<ArrayBuffer> {
  if (bufferCache.has(storagePath)) {
    return bufferCache.get(storagePath)!
  }

  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath)
  if (error || !data) {
    throw new Error(`Failed to download ${storagePath}: ${error?.message}`)
  }

  const buffer = await data.arrayBuffer()
  bufferCache.set(storagePath, buffer)
  return buffer
}

export async function getAllRives(): Promise<RiveRecord[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, storage_path, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch rives: ${error.message}`)
  if (!data || data.length === 0) return []

  const records: RiveRecord[] = await Promise.all(
    data.map(async (row) => ({
      id: row.id as string,
      name: row.name as string,
      buffer: await downloadBuffer(row.storage_path as string),
      createdAt: new Date(row.created_at as string).getTime(),
    }))
  )

  return records
}

export async function getRiveById(id: string): Promise<RiveRecord | undefined> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, storage_path, created_at')
    .eq('id', id)
    .single()

  if (error || !data) return undefined

  return {
    id: data.id as string,
    name: data.name as string,
    buffer: await downloadBuffer(data.storage_path as string),
    createdAt: new Date(data.created_at as string).getTime(),
  }
}

export async function addRive(name: string, buffer: ArrayBuffer): Promise<RiveRecord> {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) throw new Error('Not authenticated')

  const fileId = crypto.randomUUID()
  const storagePath = `${fileId}.riv`

  // Upload file to Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  // Insert metadata row
  const { data, error: insertError } = await supabase
    .from(TABLE)
    .insert({
      name,
      storage_path: storagePath,
      user_id: userId,
    })
    .select('id, name, storage_path, created_at')
    .single()

  if (insertError || !data) {
    // Clean up the uploaded file if insert fails
    await supabase.storage.from(BUCKET).remove([storagePath])
    throw new Error(`Insert failed: ${insertError?.message}`)
  }

  // Cache the buffer
  bufferCache.set(storagePath, buffer)

  return {
    id: data.id as string,
    name: data.name as string,
    buffer,
    createdAt: new Date(data.created_at as string).getTime(),
  }
}

export async function deleteRive(id: string): Promise<void> {
  // First get the storage path
  const { data, error: fetchError } = await supabase
    .from(TABLE)
    .select('storage_path')
    .eq('id', id)
    .single()

  if (fetchError || !data) throw new Error(`Failed to find rive: ${fetchError?.message}`)

  const storagePath = data.storage_path as string

  // Delete from table
  const { error: deleteError } = await supabase.from(TABLE).delete().eq('id', id)
  if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`)

  // Delete from storage
  await supabase.storage.from(BUCKET).remove([storagePath])

  // Remove from cache
  bufferCache.delete(storagePath)
}
