<template>
  <div class="page-notes">
    <div class="notes-header fade-up">
      <div>
        <h1 class="page-title">Все заметки</h1>
        <p class="page-sub">{{ store.sortedNotes.length }} записей</p>
      </div>
      <NButton type="primary" @click="showNew = true">+ Новая заметка</NButton>
    </div>

    <div class="notes-filters fade-up" style="animation-delay:0.05s">
      <NInput
        v-model:value="search"
        placeholder="🔍 Поиск по заметкам..."
        clearable
        style="flex:1"
      />
      <NSelect
        v-model:value="filterMood"
        :options="moodOptions"
        placeholder="Настроение"
        clearable
        style="width:160px"
      />
      <NSelect
        v-model:value="sortBy"
        :options="sortOptions"
        style="width:160px"
      />
    </div>

    <div v-if="allTags.length" class="tags-filter fade-up" style="animation-delay:0.08s">
      <button
        class="tag-filter-btn"
        :class="{ active: !filterTag }"
        @click="filterTag = null"
      >Все</button>
      <button
        v-for="tag in allTags"
        :key="tag"
        class="tag-filter-btn"
        :class="{ active: filterTag === tag }"
        @click="filterTag = filterTag === tag ? null : tag"
      >#{{ tag }}</button>
    </div>

    <div v-if="filtered.length" class="notes-grid">
      <NoteCard
        v-for="note in filtered"
        :key="note.id"
        :note="note"
        @click="openNote(note)"
        @delete="deleteNote(note.id)"
      />
    </div>

    <div v-else class="notes-empty fade-up">
      <span class="empty-icon">📭</span>
      <h3>Заметок не найдено</h3>
      <p>{{ search ? 'Попробуй изменить запрос' : 'Начни писать свой дневник!' }}</p>
      <NButton v-if="!search" type="primary" @click="showNew = true">Создать первую заметку</NButton>
    </div>

    <NModal v-model:show="showNew" title="Новая заметка" preset="card" style="max-width:700px">
      <NoteEditor
        :date="today()"
        :initial="null"
        @saved="onNewSaved"
        @cancel="showNew = false"
      />
    </NModal>

    <NModal
      v-model:show="showNote"
      :title="activeNote?.title || formatDisplay(activeNote?.date ?? '')"
      preset="card"
      style="max-width:700px"
    >
      <div v-if="activeNote && !editingActive" class="modal-note-view">
        <div class="mnv-meta">
          <span class="mnv-date">{{ formatDisplay(activeNote.date) }}</span>
          <span v-if="activeNote.mood">{{ MOODS[activeNote.mood].emoji }} {{ MOODS[activeNote.mood].label }}</span>
        </div>
        <div class="mnv-content">{{ activeNote.content }}</div>
        <div v-if="activeNote.tags.length" class="mnv-tags">
          <span v-for="tag in activeNote.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>
        <div v-if="activeNote.photos.length" class="photo-grid" style="margin-top:16px">
          <div
            v-for="photo in activeNote.photos"
            :key="photo.id"
            class="photo-item"
            @click="viewPhoto(photo)"
          >
            <img :src="photo.dataUrl" :alt="photo.name" />
            <div class="overlay"><span style="color:#fff;font-size:18px">🔍</span></div>
          </div>
        </div>
        <div class="mnv-actions">
          <NButton @click="editingActive = true">✏️ Редактировать</NButton>
          <NButton type="error" quaternary @click="deleteNote(activeNote.id)">🗑 Удалить</NButton>
        </div>
      </div>
      <NoteEditor
        v-else-if="activeNote && editingActive"
        :date="activeNote.date"
        :initial="activeNote"
        @saved="onEditSaved"
        @cancel="editingActive = false"
      />
    </NModal>

    <NModal v-model:show="lightboxOpen" :mask-closable="true">
      <div class="lightbox" @click="lightboxOpen = false">
        <img v-if="lightPhoto" :src="lightPhoto.dataUrl" :alt="lightPhoto.name" />
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput, NModal, NSelect, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import NoteCard from '~/components/NoteCard.vue'
import NoteEditor from '~/components/NoteEditor.vue'
import { useDate } from '~/composables/useDate'
import { useNotesStore } from '~/stores/notes'
import { MOODS, type Note, type Photo } from '~/types'

const store = useNotesStore()
const { today, formatDisplay } = useDate()
const message = useMessage()

const search = ref('')
const filterMood = ref<string | null>(null)
const filterTag = ref<string | null>(null)
const sortBy = ref<'date-desc' | 'date-asc'>('date-desc')
const showNew = ref(false)
const showNote = ref(false)
const activeNote = ref<Note | null>(null)
const editingActive = ref(false)
const lightboxOpen = ref(false)
const lightPhoto = ref<Photo | null>(null)

const moodOptions = Object.entries(MOODS).map(([k, v]) => ({
  label: `${v.emoji} ${v.label}`,
  value: k,
}))
const sortOptions = [
  { label: 'Сначала новые', value: 'date-desc' },
  { label: 'Сначала старые', value: 'date-asc' },
]

const allTags = computed(() => {
  const set = new Set<string>()
  for (const n of store.notes) n.tags.forEach(t => set.add(t))
  return [...set]
})

const filtered = computed(() => {
  let list = [...store.sortedNotes]

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  if (filterMood.value) {
    list = list.filter(n => n.mood === filterMood.value)
  }

  if (filterTag.value) {
    list = list.filter(n => n.tags.includes(filterTag.value!))
  }

  if (sortBy.value === 'date-asc') list.reverse()

  return list
})

function openNote(note: Note) {
  activeNote.value = note
  editingActive.value = false
  showNote.value = true
}

function deleteNote(id: string) {
  store.deleteNote(id)
  if (activeNote.value?.id === id) showNote.value = false
  message.success('Запись удалена')
}

function onNewSaved(note: Note) {
  showNew.value = false
  message.success('Заметка создана!')
}

function onEditSaved() {
  editingActive.value = false
  message.success('Сохранено!')
}

function viewPhoto(photo: Photo) {
  lightPhoto.value = photo
  lightboxOpen.value = true
}
</script>

<style scoped>
.page-notes {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notes-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.page-title {
  font-size: 28px;
  font-weight: 900;
  color: #2d2b55;
}
:global(.dark) .page-title { color: #e0deff; }
.page-sub { font-size: 13px; color: #999; margin-top: 2px; }

.notes-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tags-filter {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tag-filter-btn {
  padding: 4px 12px;
  border-radius: 99px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: all 0.15s;
}
:global(.dark) .tag-filter-btn { background: #1c1c28; border-color: #2a2840; color: #9e9cc0; }
.tag-filter-btn:hover { border-color: #7C6EF5; color: #7C6EF5; }
.tag-filter-btn.active { background: #ede9ff; border-color: #7C6EF5; color: #7C6EF5; font-weight: 700; }
:global(.dark) .tag-filter-btn.active { background: #22203a; }

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.notes-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
}
.empty-icon { font-size: 52px; }
.notes-empty h3 { font-size: 20px; font-weight: 700; color: #2d2b55; }
:global(.dark) .notes-empty h3 { color: #e0deff; }
.notes-empty p { color: #888; font-size: 14px; }

.modal-note-view { display: flex; flex-direction: column; gap: 12px; }
.mnv-meta { display: flex; gap: 12px; align-items: center; font-size: 13px; color: #888; }
.mnv-date { font-weight: 600; }
.mnv-content { font-size: 15px; line-height: 1.7; color: #444; white-space: pre-wrap; }
:global(.dark) .mnv-content { color: #b0aed0; }
.mnv-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.mnv-actions { display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid #f0eeff; }

.lightbox {
  display: flex; align-items: center; justify-content: center;
  padding: 20px; cursor: zoom-out;
}
.lightbox img {
  max-width: 90vw; max-height: 85vh;
  border-radius: 12px; object-fit: contain;
}
</style>
