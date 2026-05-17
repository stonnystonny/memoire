<template>
  <div class="page-calendar">
    <div class="cal-header fade-up">
      <NButton quaternary circle size="large" @click="prevMonth">◀</NButton>
      <h1 class="cal-month-title">{{ monthTitle }}</h1>
      <NButton quaternary circle size="large" @click="nextMonth">▶</NButton>
      <NButton size="small" secondary @click="goToday" style="margin-left:8px">Сегодня</NButton>
    </div>

    <div class="cal-dow fade-up" style="animation-delay:0.05s">
      <span v-for="d in DOW" :key="d">{{ d }}</span>
    </div>
    <div class="cal-grid fade-up" style="animation-delay:0.1s">
      <div
        v-for="cell in calCells"
        :key="cell.date"
        class="cal-day"
        :class="{
          today: cell.date === todayStr,
          'has-note': !!notesByDate[cell.date],
          'other-month': !cell.currentMonth,
          selected: cell.date === selectedDate,
        }"
        @click="selectDate(cell.date)"
      >
        {{ new Date(cell.date + 'T12:00:00').getDate() }}
        <span
          v-if="notesByDate[cell.date]?.mood"
          class="mood-dot"
        >{{ MOODS[notesByDate[cell.date].mood!].emoji }}</span>
      </div>
    </div>

    <div v-if="selectedDate" class="day-panel fade-up" style="animation-delay:0.05s">
      <div class="day-panel-header">
        <h2 class="day-panel-title">{{ formatDisplay(selectedDate) }}</h2>
        <NButton
          v-if="!editing && !selectedNote"
          type="primary"
          size="small"
          @click="editing = true"
        >+ Добавить заметку</NButton>
        <NButton
          v-if="!editing && selectedNote"
          size="small"
          @click="editing = true"
        >✏️ Редактировать</NButton>
      </div>

      <NCard v-if="editing" style="margin-top:16px">
        <NoteEditor
          :date="selectedDate"
          :initial="selectedNote"
          @saved="onSaved"
          @cancel="editing = false"
        />
      </NCard>
      <NCard v-else-if="selectedNote" style="margin-top:16px">
        <div class="note-full-view">
          <div v-if="selectedNote.mood" class="nv-mood">
            {{ MOODS[selectedNote.mood].emoji }} {{ MOODS[selectedNote.mood].label }}
          </div>
          <h3 v-if="selectedNote.title" class="nv-title">{{ selectedNote.title }}</h3>
          <div class="nv-content">{{ selectedNote.content }}</div>

          <div v-if="selectedNote.tags.length" class="nv-tags">
            <span v-for="tag in selectedNote.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>

          <div v-if="selectedNote.photos.length" class="photo-grid" style="margin-top:16px">
            <div
              v-for="photo in selectedNote.photos"
              :key="photo.id"
              class="photo-item"
              @click="openPhoto(photo)"
            >
              <img :src="photo.dataUrl" :alt="photo.name" />
              <div class="overlay"><span style="color:#fff;font-size:18px">🔍</span></div>
            </div>
          </div>

          <div class="nv-actions">
            <NButton type="error" size="small" quaternary @click="deleteSelectedNote">
              🗑 Удалить запись
            </NButton>
          </div>
        </div>
      </NCard>

      <div v-else class="day-empty">
        <span>Нет записи на этот день</span>
      </div>
    </div>

    <NModal v-model:show="lightboxOpen" :mask-closable="true">
      <div class="lightbox" @click="lightboxOpen = false">
        <img v-if="activePhoto" :src="activePhoto.dataUrl" :alt="activePhoto.name" />
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NModal, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import NoteEditor from '~/components/NoteEditor.vue'
import { useDate } from '~/composables/useDate'
import { useNotesStore } from '~/stores/notes'
import { MOODS, type Photo } from '~/types'

const store = useNotesStore()
const { today, formatDisplay, monthName, getDaysInMonth } = useDate()
const route = useRoute()
const message = useMessage()

const todayStr = today()
const now = new Date()
const curYear = ref(now.getFullYear())
const curMonth = ref(now.getMonth())
const selectedDate = ref<string>(todayStr)
const editing = ref(false)
const lightboxOpen = ref(false)
const activePhoto = ref<Photo | null>(null)

const DOW = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

onMounted(() => {
  if (route.query.date) {
    selectedDate.value = route.query.date as string
    const d = new Date(selectedDate.value + 'T12:00:00')
    curYear.value = d.getFullYear()
    curMonth.value = d.getMonth()
  }
})

const monthTitle = computed(() => monthName(curYear.value, curMonth.value))
const calCells = computed(() => getDaysInMonth(curYear.value, curMonth.value))
const notesByDate = computed(() => store.notesByDate)
const selectedNote = computed(() => selectedDate.value ? store.getNoteByDate(selectedDate.value) : null)

function prevMonth() {
  if (curMonth.value === 0) { curYear.value--; curMonth.value = 11 }
  else curMonth.value--
}

function nextMonth() {
  if (curMonth.value === 11) { curYear.value++; curMonth.value = 0 }
  else curMonth.value++
}

function goToday() {
  const now = new Date()
  curYear.value = now.getFullYear()
  curMonth.value = now.getMonth()
  selectedDate.value = todayStr
  editing.value = false
}

function selectDate(date: string) {
  selectedDate.value = date
  editing.value = false
}

function onSaved() {
  editing.value = false
  message.success('Сохранено!')
}

function deleteSelectedNote() {
  if (selectedNote.value) {
    store.deleteNote(selectedNote.value.id)
    message.success('Запись удалена')
    editing.value = false
  }
}

function openPhoto(photo: Photo) {
  activePhoto.value = photo
  lightboxOpen.value = true
}
</script>

<style scoped>
.page-calendar {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cal-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cal-month-title {
  flex: 1;
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  text-transform: capitalize;
  color: #2d2b55;
}
:global(.dark) .cal-month-title { color: #e0deff; }

.cal-dow {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
}
.cal-dow span {
  font-size: 11px;
  font-weight: 700;
  color: #999;
  padding: 4px 0;
  text-transform: uppercase;
}

:deep(.cal-day),
.cal-day {
  background: #fff;
  border: 1px solid #f0eeff;
  min-height: 48px;
  color: black;
}
:global(.dark) .cal-day {
  background: #1c1c28;
  border-color: #2a2840;
  color: #c0bddd;
}
.cal-day:hover:not(.other-month) {
  background: #f0eeff;
  border-color: #7C6EF5;
}
:global(.dark) .cal-day:hover:not(.other-month) {
  background: #22203a;
}

.day-panel {
  border-top: 2px solid #ece9ff;
  padding-top: 20px;
}
:global(.dark) .day-panel { border-color: #2a2840; }
.day-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.day-panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #2d2b55;
  text-transform: capitalize;
}
:global(.dark) .day-panel-title { color: #e0deff; }

.day-empty {
  padding: 24px;
  text-align: center;
  color: #bbb;
  font-size: 14px;
}

.note-full-view { display: flex; flex-direction: column; gap: 10px; }
.nv-mood { font-size: 16px; color: #888; }
.nv-title { font-size: 20px; font-weight: 800; color: #2d2b55; }
:global(.dark) .nv-title { color: #e0deff; }
.nv-content {
  font-size: 15px;
  line-height: 1.7;
  color: #444;
  white-space: pre-wrap;
}
:global(.dark) .nv-content { color: #b0aed0; }
.nv-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.nv-actions { padding-top: 8px; border-top: 1px solid #f0eeff; }

.lightbox {
  display: flex; align-items: center; justify-content: center;
  padding: 20px; cursor: zoom-out;
}
.lightbox img {
  max-width: 90vw; max-height: 85vh;
  border-radius: 12px; object-fit: contain;
}
</style>
