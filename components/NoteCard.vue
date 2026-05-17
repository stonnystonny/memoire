<template>
  <div class="note-card fade-up" @click="$emit('click')">
    <div class="card-header">
      <div class="card-meta">
        <span class="card-date">{{ formatShort(note.date) }}</span>
        <span v-if="note.mood" class="card-mood" :title="MOODS[note.mood].label">
          {{ MOODS[note.mood].emoji }}
        </span>
      </div>
      <div class="card-actions">
        <NButton
          size="tiny"
          quaternary
          circle
          @click.stop="$emit('delete')"
          title="Удалить"
        >🗑</NButton>
      </div>
    </div>

    <div v-if="note.title" class="card-title">{{ note.title }}</div>

    <div class="card-content">{{ preview }}</div>

    <div v-if="note.tags.length" class="card-tags">
      <span v-for="tag in note.tags" :key="tag" class="tag">#{{ tag }}</span>
    </div>

    <div v-if="note.photos.length" class="card-footer">
      <span class="photo-count">📷 {{ note.photos.length }} фото</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui';
import { computed } from 'vue';
import { useDate } from '~/composables/useDate';
import { MOODS, type Note } from '~/types';

const props = defineProps<{ note: Note }>()
defineEmits<{ (e: 'click'): void; (e: 'delete'): void }>()

const { formatShort } = useDate()

const preview = computed(() => {
  const text = props.note.content.replace(/<[^>]*>/g, '').trim()
  return text.length > 200 ? text.slice(0, 200) + '...' : text
})
</script>

<style scoped>
.note-card {
  background: #fff;
  border: 1px solid #ece9ff;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.note-card:hover {
  border-color: #7C6EF5;
  box-shadow: 0 4px 24px rgba(124, 110, 245, 0.12);
  transform: translateY(-2px);
}

:global(.dark) .note-card {
  background: #1c1c28;
  border-color: #2a2840;
}
:global(.dark) .note-card:hover {
  border-color: #7C6EF5;
  box-shadow: 0 4px 24px rgba(124, 110, 245, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-meta { display: flex; align-items: center; gap: 6px; }
.card-date { font-size: 12px; color: #999; font-weight: 600; }
.card-mood { font-size: 16px; }

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #2d2b55;
  line-height: 1.3;
}
:global(.dark) .card-title { color: #e0deff; }

.card-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
:global(.dark) .card-content { color: #9e9cc0; }

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.card-footer {}
.photo-count { font-size: 12px; color: #999; }
</style>
