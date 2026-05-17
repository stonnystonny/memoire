export interface Note {
  id: string
  date: string
  title: string
  content: string
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'awful'
  tags: string[]
  photos: Photo[]
  createdAt: string
  updatedAt: string
}

export interface Photo {
  id: string
  noteId?: string
  name: string
  dataUrl: string
  date: string
  size: number
  createdAt: string
}

export interface CalendarDay {
  date: string
  hasNote: boolean
  hasPhotos: boolean
  mood?: Note['mood']
  isToday: boolean
  isCurrentMonth: boolean
}

export const MOODS = {
  great: { emoji: '😄', label: 'Отлично', color: '#18a058' },
  good:  { emoji: '🙂', label: 'Хорошо',  color: '#2080f0' },
  okay:  { emoji: '😐', label: 'Нормально', color: '#f0a020' },
  bad:   { emoji: '😔', label: 'Плохо',   color: '#d03050' },
  awful: { emoji: '😣', label: 'Ужасно',  color: '#8a2be2' },
} as const
