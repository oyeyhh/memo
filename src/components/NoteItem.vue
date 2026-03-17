<script setup lang="ts">
import type { Note } from "../composables/useApi";

defineProps<{ note: Note }>();
defineEmits<{
  copy: [note: Note];
  edit: [note: Note];
  delete: [note: Note];
}>();

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}
</script>

<template>
  <div class="note-item">
    <div class="note-body" @click="$emit('copy', note)" :title="`点击复制: ${note.content}`">
      <div class="note-indicator" />
      <div class="note-text">
        <span class="note-name">{{ note.name }}</span>
        <span class="note-preview">{{ truncate(note.content, 50) }}</span>
      </div>
    </div>
    <div class="note-actions">
      <button class="act-btn" @click.stop="$emit('edit', note)" title="编辑" aria-label="编辑">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button class="act-btn act-btn--danger" @click.stop="$emit('delete', note)" title="删除" aria-label="删除">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.note-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  margin: 1px 6px;
  border-radius: var(--radius-md);
  cursor: default;
  transition: background var(--transition-fast);
}

.note-item:hover {
  background: var(--color-surface-hover);
}

.note-body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  cursor: pointer;
  padding-right: 8px;
  border-radius: var(--radius-sm);
}

.note-indicator {
  width: 3px;
  height: 28px;
  border-radius: 2px;
  background: var(--color-accent);
  opacity: 0.25;
  flex-shrink: 0;
  transition: opacity var(--transition-fast), height var(--transition-fast);
}

.note-item:hover .note-indicator {
  opacity: 0.6;
}

.note-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  min-width: 0;
}

.note-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: 500;
  line-height: 1.4;
  transition: color var(--transition-fast);
}

.note-body:hover .note-name {
  color: var(--color-accent);
}

.note-preview {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.note-actions {
  display: flex;
  gap: 1px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.note-item:hover .note-actions {
  opacity: 1;
}

.note-item:focus-within .note-actions {
  opacity: 1;
}

.act-btn {
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  color: var(--color-text-tertiary);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  min-height: 26px;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.act-btn:hover {
  background: var(--color-surface-active);
  color: var(--color-text-primary);
}

.act-btn--danger:hover {
  background: var(--color-danger-subtle);
  color: var(--color-danger);
}
</style>
