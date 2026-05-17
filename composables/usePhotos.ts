import { useNotesStore } from '~/stores/notes'
import { useDate } from '~/composables/useDate'

export function usePhotos() {
  const store = useNotesStore()
  const { today } = useDate()

  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function uploadPhoto(file: File, noteId?: string, date?: string) {
    if (!file.type.startsWith('image/')) throw new Error('Только изображения')
    if (file.size > 10 * 1024 * 1024) throw new Error('Файл слишком большой (макс 10 МБ)')

    const dataUrl = await readFile(file)
    return store.addPhoto({
      name: file.name,
      dataUrl,
      noteId,
      date: date ?? today(),
      size: file.size,
    })
  }

  async function uploadPhotos(files: File[], noteId?: string, date?: string) {
    const results = []
    for (const f of files) {
      results.push(await uploadPhoto(f, noteId, date))
    }
    return results
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return { uploadPhoto, uploadPhotos, formatSize }
}
