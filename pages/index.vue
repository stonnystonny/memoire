<template>
  <div class="page-today">
    <div class="today-header fade-up">
      <div class="date-badge">
        <div class="date-day">{{ dayNum }}</div>
        <div class="date-info">
          <div class="date-weekday">{{ weekday }}</div>
          <div class="date-month">{{ monthYear }}</div>
        </div>
      </div>
      <div class="today-greeting">
        <h1>{{ greeting }}</h1>
        <p>{{ subGreeting }}</p>
      </div>
    </div>

    <div class="quick-stats fade-up" style="animation-delay:0.05s">
      <div class="qstat">
        <span class="qstat-icon">✍️</span>
        <span class="qstat-val">{{ store.stats.totalNotes }}</span>
        <span class="qstat-lbl">заметок</span>
      </div>
      <div class="qstat">
        <span class="qstat-icon">📷</span>
        <span class="qstat-val">{{ store.stats.totalPhotos }}</span>
        <span class="qstat-lbl">фото</span>
      </div>
      <div class="qstat">
        <span class="qstat-icon">🔥</span>
        <span class="qstat-val">{{ store.stats.streak }}</span>
        <span class="qstat-lbl">дней подряд</span>
      </div>
    </div>

    <NCard class="today-card fade-up" style="animation-delay:0.1s">
      <div v-if="!editing">
        <div v-if="todayNote" class="today-note-view">
          <div class="note-view-header">
            <div>
              <h2 v-if="todayNote.title" class="note-view-title">{{ todayNote.title }}</h2>
              <span v-if="todayNote.mood" class="note-view-mood">
                {{ MOODS[todayNote.mood].emoji }} {{ MOODS[todayNote.mood].label }}
              </span>
            </div>
            <NButton @click="editing = true">✏️ Редактировать</NButton>
          </div>

          <div class="note-view-content">{{ todayNote.content }}</div>

          <div v-if="todayNote.tags.length" class="note-view-tags">
            <span v-for="tag in todayNote.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>

          <div v-if="todayNote.photos.length" class="photo-grid" style="margin-top:16px">
            <div
              v-for="photo in todayNote.photos"
              :key="photo.id"
              class="photo-item"
              @click="viewPhoto(photo)"
            >
              <img :src="photo.dataUrl" :alt="photo.name" />
              <div class="overlay">
                <span style="color:#fff;font-size:20px">🔍</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="today-empty">
          <div class="empty-emoji">📝</div>
          <h3>Сегодня ещё пусто</h3>
          <p>Напиши о своём дне, добавь фото или просто мысль</p>
          <NButton type="primary" size="large" @click="editing = true">
            Начать запись
          </NButton>
        </div>
      </div>

      <NoteEditor
        v-else
        :date="today"
        :initial="todayNote"
        @saved="onSaved"
        @cancel="editing = false"
      />
    </NCard>

    <div v-if="recentNotes.length > 1" class="recent-section fade-up" style="animation-delay:0.15s">
      <h2 class="section-heading">Недавние записи</h2>
      <div class="recent-grid">
        <NoteCard
          v-for="note in recentNotes.slice(1, 4)"
          :key="note.id"
          :note="note"
          @click="navigateTo(`/calendar?date=${note.date}`)"
          @delete="deleteNote(note.id)"
        />
      </div>
    </div>

    <NModal v-model:show="lightboxOpen" :mask-closable="true" class="lightbox-modal">
      <div class="lightbox" @click="lightboxOpen = false">
        <img v-if="activePhoto" :src="activePhoto.dataUrl" :alt="activePhoto.name" />
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NModal } from 'naive-ui'
import { computed, ref } from 'vue'
import NoteCard from '~/components/NoteCard.vue'
import NoteEditor from '~/components/NoteEditor.vue'
import { useDate } from '~/composables/useDate'
import { useNotesStore } from '~/stores/notes'
import { MOODS, type Photo } from '~/types'

const store = useNotesStore()
const { today, formatDisplay } = useDate()

const editing = ref(false)
const lightboxOpen = ref(false)
const activePhoto = ref<Photo | null>(null)

const todayNote = computed(() => store.getNoteByDate(today()))
const recentNotes = computed(() => store.sortedNotes.slice(0, 4))

const now = new Date()
const dayNum = now.getDate()
const weekday = now.toLocaleDateString('ru-RU', { weekday: 'long' })
const monthYear = now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })

const hour = now.getHours()
const greeting = computed(() => {
  if (hour < 6) return 'Доброй ночи 🌙'
  if (hour < 12) return 'Доброе утро ☀️'
  if (hour < 17) return 'Добрый день 🌤'
  return 'Добрый вечер 🌆'
})
const subGreeting = computed(() => {
  if (todayNote.value) return 'Запись на сегодня уже есть, молодец!'
  return 'Как прошёл твой день? Запиши это!'
})

function onSaved() {
  editing.value = false
}

function deleteNote(id: string) {
  store.deleteNote(id)
}

function viewPhoto(photo: Photo) {
  activePhoto.value = photo
  lightboxOpen.value = true
}
</script>

<style scoped>
.page-today {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.today-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #7C6EF5, #b59cff);
  color: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  min-width: 120px;
}
.date-day { font-size: 48px; font-weight: 900; line-height: 1; }
.date-weekday { font-size: 13px; font-weight: 600; text-transform: capitalize; opacity: 0.9; }
.date-month { font-size: 11px; opacity: 0.75; text-transform: capitalize; }

.today-greeting h1 {
  font-size: 26px;
  font-weight: 800;
  color: #2d2b55;
  line-height: 1.2;
}
:global(.dark) .today-greeting h1 { color: #e0deff; }
.today-greeting p { font-size: 14px; color: #888; margin-top: 4px; }

.quick-stats {
  display: flex;
  gap: 12px;
}
.qstat {
  flex: 1;
  background: #fff;
  border: 1px solid #ece9ff;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
:global(.dark) .qstat { background: #1c1c28; border-color: #2a2840; }
.qstat-icon { font-size: 22px; }
.qstat-val { font-size: 22px; font-weight: 800; color: #7C6EF5; }
.qstat-lbl { font-size: 11px; color: #999; }

.today-card {}
.today-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 12px;
  text-align: center;
}
.empty-emoji { font-size: 56px; }
.today-empty h3 { font-size: 20px; font-weight: 700; color: #2d2b55; }
:global(.dark) .today-empty h3 { color: #e0deff; }
.today-empty p { color: #888; font-size: 14px; }

.note-view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.note-view-title {
  font-size: 22px;
  font-weight: 800;
  color: #2d2b55;
}
:global(.dark) .note-view-title { color: #e0deff; }
.note-view-mood { font-size: 14px; color: #888; }
.note-view-content {
  font-size: 15px;
  line-height: 1.7;
  color: #444;
  white-space: pre-wrap;
}
:global(.dark) .note-view-content { color: #b0aed0; }
.note-view-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.section-heading {
  font-size: 16px;
  font-weight: 700;
  color: #2d2b55;
  margin-bottom: 12px;
}
:global(.dark) .section-heading { color: #e0deff; }
.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.lightbox {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: zoom-out;
}
.lightbox img {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 12px;
  object-fit: contain;
}
</style>
