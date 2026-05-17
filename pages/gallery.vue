<template>
  <div class="page-gallery">
    <div class="gallery-header fade-up">
      <div>
        <h1 class="page-title">Галерея</h1>
        <p class="page-sub">{{ store.allPhotos.length }} фотографий</p>
      </div>
      <div style="display:flex;gap:10px">
        <NButton @click="triggerUpload">📷 Загрузить фото</NButton>
        <input ref="fileInput" type="file" accept="image/*" multiple style="display:none" @change="onFilesChange" />
      </div>
    </div>

    <div
      v-if="!store.allPhotos.length"
      class="drop-zone-big fade-up"
      @dragover.prevent
      @drop.prevent="onDrop"
      @click="triggerUpload"
    >
      <div class="dz-inner">
        <span class="dz-icon">🖼️</span>
        <h3>Перетащи фотографии сюда</h3>
        <p>или нажми, чтобы выбрать файлы</p>
        <span class="dz-hint">PNG, JPG, WebP — до 10 МБ</span>
      </div>
    </div>

    <template v-else>
      <div class="gallery-controls fade-up" style="animation-delay:0.05s">
        <div class="view-toggle">
          <button :class="{ active: view === 'grid' }" @click="view = 'grid'">⊞ Сетка</button>
          <button :class="{ active: view === 'masonry' }" @click="view = 'masonry'">⊟ Коллаж</button>
        </div>

        <div
          class="inline-drop"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="onDrop"
          :class="{ dragging }"
          @click="triggerUpload"
        >
          {{ dragging ? 'Отпусти!' : '+ Добавить фото' }}
        </div>
      </div>

      <div v-if="view === 'grid'" class="photo-grid-page fade-up" style="animation-delay:0.1s">
        <div
          v-for="(photo, idx) in store.allPhotos"
          :key="photo.id"
          class="photo-item-page"
          @click="openLightbox(idx)"
        >
          <img :src="photo.dataUrl" :alt="photo.name" loading="lazy" />
          <div class="photo-overlay">
            <div class="photo-info">
              <span class="photo-name">{{ photo.name }}</span>
              <span class="photo-date">{{ formatShort(photo.date) }}</span>
            </div>
            <button class="photo-delete" @click.stop="deletePhoto(photo.id)">🗑</button>
          </div>
        </div>
      </div>

      <div v-else class="masonry-grid fade-up" style="animation-delay:0.1s">
        <div
          v-for="(photo, idx) in store.allPhotos"
          :key="photo.id"
          class="masonry-item"
          @click="openLightbox(idx)"
        >
          <img :src="photo.dataUrl" :alt="photo.name" loading="lazy" />
          <div class="photo-overlay">
            <button class="photo-delete" @click.stop="deletePhoto(photo.id)">🗑</button>
          </div>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <Transition name="lb">
        <div v-if="lightboxOpen" class="lb-backdrop" @click.self="lightboxOpen = false">
          <button class="lb-close" @click="lightboxOpen = false">✕</button>
          <button class="lb-prev" @click="lbPrev" :disabled="lbIdx === 0">◀</button>
          <button class="lb-next" @click="lbNext" :disabled="lbIdx === store.allPhotos.length - 1">▶</button>

          <div class="lb-content">
            <img :src="store.allPhotos[lbIdx]?.dataUrl" :alt="store.allPhotos[lbIdx]?.name" />
            <div class="lb-caption">
              <span>{{ store.allPhotos[lbIdx]?.name }}</span>
              <span>{{ formatShort(store.allPhotos[lbIdx]?.date ?? '') }}</span>
              <span>{{ formatSize(store.allPhotos[lbIdx]?.size ?? 0) }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { NButton, useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useDate } from '~/composables/useDate'
import { usePhotos } from '~/composables/usePhotos'
import { useNotesStore } from '~/stores/notes'

const store = useNotesStore()
const { uploadPhotos, formatSize } = usePhotos()
const { formatShort } = useDate()
const message = useMessage()

const view = ref<'grid' | 'masonry'>('grid')
const fileInput = ref<HTMLInputElement>()
const dragging = ref(false)
const lightboxOpen = ref(false)
const lbIdx = ref(0)

function triggerUpload() { fileInput.value?.click() }

async function onFilesChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  await handleFiles(files)
  if (fileInput.value) fileInput.value.value = ''
}

async function onDrop(e: DragEvent) {
  dragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  await handleFiles(files)
}

async function handleFiles(files: File[]) {
  if (!files.length) return
  try {
    await uploadPhotos(files)
    message.success(`Загружено ${files.length} фото`)
  } catch (err: any) {
    message.error(err.message)
  }
}

function deletePhoto(id: string) {
  store.deletePhoto(id)
  message.success('Фото удалено')
  if (lbIdx.value >= store.allPhotos.length) lbIdx.value = Math.max(0, store.allPhotos.length - 1)
}

function openLightbox(idx: number) {
  lbIdx.value = idx
  lightboxOpen.value = true
}

function lbPrev() { if (lbIdx.value > 0) lbIdx.value-- }
function lbNext() { if (lbIdx.value < store.allPhotos.length - 1) lbIdx.value++ }

if (process.client) {
  addEventListener('keydown', (e: KeyboardEvent) => {
    if (!lightboxOpen.value) return
    if (e.key === 'ArrowLeft') lbPrev()
    if (e.key === 'ArrowRight') lbNext()
    if (e.key === 'Escape') lightboxOpen.value = false
  })
}
</script>

<style scoped>
.page-gallery {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gallery-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.page-title { font-size: 28px; font-weight: 900; color: #2d2b55; }
:global(.dark) .page-title { color: #e0deff; }
.page-sub { font-size: 13px; color: #999; margin-top: 2px; }

.drop-zone-big {
  border: 3px dashed #d0cbf5;
  border-radius: 20px;
  padding: 80px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.drop-zone-big:hover { border-color: #7C6EF5; background: #f8f6ff; }
:global(.dark) .drop-zone-big { border-color: #3a2860; }
:global(.dark) .drop-zone-big:hover { background: #1a1828; }
.dz-inner { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.dz-icon { font-size: 56px; }
.dz-inner h3 { font-size: 20px; font-weight: 700; color: #2d2b55; }
:global(.dark) .dz-inner h3 { color: #e0deff; }
.dz-inner p { color: #888; font-size: 14px; }
.dz-hint { font-size: 12px; color: #bbb; margin-top: 4px; }

.gallery-controls { display: flex; align-items: center; gap: 12px; }
.view-toggle { display: flex; border: 1px solid #ece9ff; border-radius: 8px; overflow: hidden; }
:global(.dark) .view-toggle { border-color: #2a2840; }
.view-toggle button {
  padding: 6px 14px; border: none; background: #fff; cursor: pointer;
  font-size: 12px; color: #666; transition: all 0.15s;
}
:global(.dark) .view-toggle button { background: #1c1c28; color: #9e9cc0; }
.view-toggle button.active { background: #7C6EF5; color: #fff; }

.inline-drop {
  padding: 6px 16px;
  border: 1.5px dashed #c0baf5;
  border-radius: 8px;
  font-size: 12px;
  color: #7C6EF5;
  cursor: pointer;
  transition: all 0.15s;
  margin-left: auto;
}
.inline-drop:hover, .inline-drop.dragging {
  background: #ede9ff;
  border-color: #7C6EF5;
}

.photo-grid-page {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}
.photo-item-page {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}
.photo-item-page img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.photo-item-page:hover img { transform: scale(1.05); }
.photo-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
  opacity: 0; transition: opacity 0.2s;
  display: flex; flex-direction: column; justify-content: flex-end; padding: 10px;
}
.photo-item-page:hover .photo-overlay { opacity: 1; }
.photo-info { display: flex; flex-direction: column; gap: 2px; }
.photo-name { font-size: 11px; color: rgba(255,255,255,0.9); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.photo-date { font-size: 10px; color: rgba(255,255,255,0.7); }
.photo-delete {
  position: absolute; top: 8px; right: 8px;
  background: rgba(0,0,0,0.6); border: none;
  border-radius: 6px; padding: 4px 6px;
  font-size: 14px; cursor: pointer; color: #fff;
  transition: background 0.15s;
}
.photo-delete:hover { background: #d03050; }

.masonry-grid {
  columns: 4 180px;
  gap: 10px;
}
.masonry-item {
  break-inside: avoid;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  margin-bottom: 10px;
}
.masonry-item img { width: 100%; display: block; transition: transform 0.3s; }
.masonry-item:hover img { transform: scale(1.03); }
.masonry-item .photo-overlay { opacity: 0; transition: opacity 0.2s; }
.masonry-item:hover .photo-overlay { opacity: 1; }

.lb-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
}
.lb-content {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  max-width: 92vw;
}
.lb-content img {
  max-width: 88vw; max-height: 80vh;
  border-radius: 10px; object-fit: contain;
}
.lb-caption {
  display: flex; gap: 16px;
  font-size: 12px; color: rgba(255,255,255,0.6);
}
.lb-close {
  position: absolute; top: 20px; right: 24px;
  background: rgba(255,255,255,0.12); border: none;
  border-radius: 50%; width: 36px; height: 36px;
  font-size: 16px; color: #fff; cursor: pointer;
  transition: background 0.15s;
}
.lb-close:hover { background: rgba(255,255,255,0.25); }
.lb-prev, .lb-next {
  position: absolute; top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.12); border: none;
  border-radius: 50%; width: 44px; height: 44px;
  font-size: 18px; color: #fff; cursor: pointer;
  transition: all 0.15s;
}
.lb-prev { left: 20px; }
.lb-next { right: 20px; }
.lb-prev:hover, .lb-next:hover { background: rgba(255,255,255,0.25); }
.lb-prev:disabled, .lb-next:disabled { opacity: 0.3; cursor: default; }

.lb-enter-active, .lb-leave-active { transition: opacity 0.2s; }
.lb-enter-from, .lb-leave-to { opacity: 0; }
</style>
