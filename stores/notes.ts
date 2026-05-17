import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Note, Photo } from '~/types'

const NOTES_KEY = 'memoir_notes'
const PHOTOS_KEY = 'memoir_photos'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const photos = ref<Photo[]>([])

  function load() {
    try {
      const n = localStorage.getItem(NOTES_KEY)
      const p = localStorage.getItem(PHOTOS_KEY)
      if (n) notes.value = JSON.parse(n)
      if (p) photos.value = JSON.parse(p)
    } catch {}
  }

  function saveNotes() {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes.value))
  }
  function savePhotos() {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos.value))
  }

  function getNoteByDate(date: string) {
    return notes.value.find(n => n.date === date) ?? null
  }

  function upsertNote(data: Partial<Note> & { date: string }): Note {
    const existing = getNoteByDate(data.date)
    const now = new Date().toISOString()
    if (existing) {
      Object.assign(existing, { ...data, updatedAt: now })
      saveNotes()
      return existing
    }
    const note: Note = {
      id: genId(),
      title: '',
      content: '',
      tags: [],
      photos: [],
      createdAt: now,
      updatedAt: now,
      ...data,
    }
    notes.value.unshift(note)
    saveNotes()
    return note
  }

  function deleteNote(id: string) {
    notes.value = notes.value.filter(n => n.id !== id)
    saveNotes()
  }

  function addPhoto(photo: Omit<Photo, 'id' | 'createdAt'>): Photo {
    const p: Photo = {
      ...photo,
      id: genId(),
      createdAt: new Date().toISOString(),
    }
    photos.value.unshift(p)
    if (p.noteId) {
      const note = notes.value.find(n => n.id === p.noteId)
      if (note) {
        note.photos.push(p)
        saveNotes()
      }
    }
    savePhotos()
    return p
  }

  function deletePhoto(id: string) {
    const photo = photos.value.find(p => p.id === id)
    if (photo?.noteId) {
      const note = notes.value.find(n => n.id === photo.noteId)
      if (note) {
        note.photos = note.photos.filter(p => p.id !== id)
        saveNotes()
      }
    }
    photos.value = photos.value.filter(p => p.id !== id)
    savePhotos()
  }

  const notesByDate = computed(() => {
    const map: Record<string, Note> = {}
    for (const n of notes.value) map[n.date] = n
    return map
  })

  const allPhotos = computed(() => photos.value)

  const sortedNotes = computed(() =>
    [...notes.value].sort((a, b) => b.date.localeCompare(a.date))
  )

  const stats = computed(() => ({
    totalNotes: notes.value.length,
    totalPhotos: photos.value.length,
    streak: calcStreak(),
  }))

  function calcStreak(): number {
    const dates = notes.value.map(n => n.date).sort((a, b) => b.localeCompare(a))
    if (!dates.length) return 0
    let streak = 0
    let cur = new Date()
    for (const d of dates) {
      const day = new Date(d)
      const diff = Math.round((cur.getTime() - day.getTime()) / 86400000)
      if (diff > 1) break
      streak++
      cur = day
    }
    return streak
  }

  return {
    notes, photos, notesByDate, allPhotos, sortedNotes, stats,
    load, getNoteByDate, upsertNote, deleteNote, addPhoto, deletePhoto,
  }
})
