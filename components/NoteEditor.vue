<template>
  <div class="note-editor">
    <NInput
      v-model:value="form.title"
      placeholder="Заголовок заметки..."
      size="large"
      :bordered="false"
      class="title-input"
    />

    <div class="mood-row">
      <span class="mood-label">Настроение:</span>
      <div class="mood-picks">
        <button
          v-for="(m, key) in MOODS"
          :key="key"
          class="mood-btn"
          :class="{ active: form.mood === key }"
          :title="m.label"
          @click="form.mood = form.mood === key ? undefined : key as Note['mood']"
        >
          {{ m.emoji }}
        </button>
      </div>
    </div>

    <!-- Tags -->
    <div class="tags-row">
      <div class="tags-list">
        <span v-for="tag in form.tags" :key="tag" class="tag">
          #{{ tag }}
          <button class="tag-remove" @click="removeTag(tag)">×</button>
        </span>
      </div>
      <NInput
        v-model:value="tagInput"
        placeholder="+ тег (Enter)"
        size="small"
        style="width: 160px"
        @keydown.enter="addTag"
        @keydown.comma.prevent="addTag"
      />
    </div>

    <NInput
      v-model:value="form.content"
      type="textarea"
      placeholder="Пиши о своём дне, мыслях, событиях..."
      :autosize="{ minRows: 8, maxRows: 20 }"
      class="content-input"
    />

    <div class="photo-section">
      <div class="photo-section-header">
        <span class="section-title">📷 Фотографии</span>
        <NButton size="small" @click="triggerUpload">Загрузить фото</NButton>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          style="display:none"
          @change="onFilesChange"
        />
      </div>

      <div v-if="form.photos.length" class="photo-grid" style="margin-top:12px">
        <div
          v-for="photo in form.photos"
          :key="photo.id"
          class="photo-item"
        >
          <img :src="photo.dataUrl" :alt="photo.name" />
          <div class="overlay">
            <NButton
              circle
              size="small"
              type="error"
              @click.stop="removePhoto(photo.id)"
            >✕</NButton>
          </div>
        </div>
      </div>

      <div
        v-else
        class="drop-zone"
        @dragover.prevent
        @drop.prevent="onDrop"
      >
        <span>Перетащи фото сюда или нажми «Загрузить»</span>
      </div>
    </div>

    <div class="editor-actions">
      <NButton @click="$emit('cancel')">Отмена</NButton>
      <NButton type="primary" :loading="saving" @click="save">
        💾 Сохранить
      </NButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NInput, useMessage } from 'naive-ui'
import { reactive, ref, watch } from 'vue'
import { usePhotos } from '~/composables/usePhotos'
import { useNotesStore } from '~/stores/notes'
import { MOODS, type Note, type Photo } from '~/types'

const props = defineProps<{
  date: string
  initial?: Note | null
}>()

const emit = defineEmits<{
  (e: 'saved', note: Note): void
  (e: 'cancel'): void
}>()

const store = useNotesStore()
const { uploadPhotos } = usePhotos()
const message = useMessage()
const saving = ref(false)
const tagInput = ref('')
const fileInput = ref<HTMLInputElement>()

const form = reactive<{
  title: string
  content: string
  mood: Note['mood'] | undefined
  tags: string[]
  photos: Photo[]
}>({
  title: '',
  content: '',
  mood: undefined,
  tags: [],
  photos: [],
})

watch(() => props.initial, (n) => {
  if (n) {
    form.title = n.title
    form.content = n.content
    form.mood = n.mood
    form.tags = [...n.tags]
    form.photos = [...n.photos]
  }
}, { immediate: true })

function addTag() {
  const t = tagInput.value.trim().replace(/^#/, '')
  if (t && !form.tags.includes(t)) form.tags.push(t)
  tagInput.value = ''
}

function removeTag(t: string) {
  form.tags = form.tags.filter(x => x !== t)
}

function triggerUpload() {
  fileInput.value?.click()
}

async function onFilesChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  await handleFiles(files)
  if (fileInput.value) fileInput.value.value = ''
}

async function onDrop(e: DragEvent) {
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  await handleFiles(files)
}

async function handleFiles(files: File[]) {
  try {
    const uploaded = await uploadPhotos(files)
    form.photos.push(...uploaded)
  } catch (err: any) {
    message.error(err.message ?? 'Ошибка загрузки')
  }
}

function removePhoto(id: string) {
  form.photos = form.photos.filter(p => p.id !== id)
  store.deletePhoto(id)
}

async function save() {
  if (!form.content.trim() && !form.title.trim()) {
    message.warning('Напиши хоть что-нибудь!')
    return
  }
  saving.value = true
  try {
    const note = store.upsertNote({
      date: props.date,
      title: form.title,
      content: form.content,
      mood: form.mood,
      tags: form.tags,
      photos: form.photos,
    })
    message.success('Заметка сохранена ✓')
    emit('saved', note)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.note-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-input {
  font-size: 22px !important;
  font-weight: 700 !important;
}
:deep(.title-input .n-input__input-el) {
  font-size: 22px;
  font-weight: 700;
}

.mood-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mood-label {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
}
.mood-picks { display: flex; gap: 6px; }
.mood-btn {
  font-size: 20px;
  background: none;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  padding: 3px 5px;
  transition: all 0.15s;
  line-height: 1;
}
.mood-btn:hover { transform: scale(1.2); }
.mood-btn.active {
  border-color: #7C6EF5;
  background: #ede9ff;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tags-list { display: flex; gap: 6px; flex-wrap: wrap; }
.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #7C6EF5;
  font-size: 14px;
  line-height: 1;
  padding: 0;
}

.photo-section {}
.photo-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.section-title { font-size: 14px; font-weight: 600; color: #555; }

.drop-zone {
  margin-top: 12px;
  border: 2px dashed #d0cbf5;
  border-radius: 12px;
  padding: 28px;
  text-align: center;
  color: #aaa;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.drop-zone:hover { border-color: #7C6EF5; color: #7C6EF5; }

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #f0eeff;
}
</style>
