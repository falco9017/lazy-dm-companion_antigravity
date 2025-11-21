import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * Upload a temporary audio file to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user ID (for organizing files)
 * @returns The file path in storage
 */
export async function uploadTempAudio(file: File | Buffer, userId: string): Promise<string> {
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.webm`

    const { data, error } = await supabase.storage
        .from('audio-temp')
        .upload(fileName, file, {
            contentType: 'audio/webm',
            upsert: false
        })

    if (error) {
        throw new Error(`Failed to upload audio: ${error.message}`)
    }

    return data.path
}

/**
 * Get a signed URL for a temporary audio file
 * @param path - The file path in storage
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getTempAudioUrl(path: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
        .from('audio-temp')
        .createSignedUrl(path, expiresIn)

    if (error) {
        throw new Error(`Failed to get audio URL: ${error.message}`)
    }

    return data.signedUrl
}

/**
 * Delete a temporary audio file from storage
 * @param path - The file path in storage
 */
export async function deleteTempAudio(path: string): Promise<void> {
    const { error } = await supabase.storage
        .from('audio-temp')
        .remove([path])

    if (error) {
        throw new Error(`Failed to delete audio: ${error.message}`)
    }
}

/**
 * Download audio file from storage
 * @param path - The file path in storage
 * @returns The file data as a Buffer
 */
export async function downloadTempAudio(path: string): Promise<Buffer> {
    const { data, error } = await supabase.storage
        .from('audio-temp')
        .download(path)

    if (error) {
        throw new Error(`Failed to download audio: ${error.message}`)
    }

    return Buffer.from(await data.arrayBuffer())
}
