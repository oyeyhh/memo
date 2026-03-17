<script setup lang="ts">
import { ref } from "vue";
import type { Group, Note } from "../composables/useApi";
import NoteItem from "./NoteItem.vue";

defineProps<{
  group: Group;
  notes: Note[];
}>();

defineEmits<{
  editGroup: [group: Group];
  deleteGroup: [group: Group];
  copyNote: [note: Note];
  editNote: [note: Note];
  deleteNote: [note: Note];
}>();

const expanded = ref(false);

function toggle() {
  expanded.value = !expanded.value;
}
</script>

<template>
  <div class="group-item" :class="{ 'group-item--open': expanded }">
    <div class="group-row" @click="toggle">
      <div class="group-label">
        <svg
          class="chevron"
          :class="{ 'chevron--open': expanded }"
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <div class="folder-dot" />
        <span class="group-name" :title="group.name">{{ group.name }}</span>
        <span class="note-count">{{ notes.length }}</span>
      </div>
      <div class="group-actions">
        <button class="act-btn" @click.stop="$emit('editGroup', group)" title="编辑" aria-label="编辑分组">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button class="act-btn act-btn--danger" @click.stop="$emit('deleteGroup', group)" title="删除" aria-label="删除分组">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>

    <Transition name="slide">
      <div v-if="expanded" class="group-children">
        <template v-if="notes.length > 0">
          <NoteItem
            v-for="note in notes"
            :key="note.id"
            :note="note"
            @copy="$emit('copyNote', $event)"
            @edit="$emit('editNote', $event)"
            @delete="$emit('deleteNote', $event)"
          />
        </template>
        <div v-else class="group-empty">暂无笔记</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.group-item {
  border-radius: var(--radius-md);
  margin: 1px 6px;
  transition: background var(--transition-fast);
}

.group-item--open {
  background: var(--color-surface);
  margin-bottom: 2px;
}

.group-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.group-row:hover {
  background: var(--color-surface-hover);
}

.group-label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  overflow: hidden;
}

.chevron {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  transition: transform var(--transition-normal);
}

.chevron--open {
  transform: rotate(90deg);
}

.folder-dot {
  width: 8px;
  height: 8px;
  border-radius: 3px;
  background: var(--color-accent);
  opacity: 0.6;
  flex-shrink: 0;
}

.group-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: 500;
}

.note-count {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  background: var(--color-surface);
  padding: 0px 5px;
  border-radius: 6px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
}

.group-item--open .note-count {
  background: var(--color-surface-hover);
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 1px;
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
  min-width: 24px;
  min-height: 24px;
  opacity: 0;
  transition: opacity var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
}

.group-row:hover .act-btn {
  opacity: 1;
}

.act-btn:hover {
  background: var(--color-surface-active);
  color: var(--color-text-primary);
}

.act-btn--danger:hover {
  background: var(--color-danger-subtle);
  color: var(--color-danger);
}

/* Children notes */
.group-children {
  padding: 0 0 4px 14px;
  overflow: hidden;
}

.group-empty {
  padding: 6px 12px 4px;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* Slide transition */
.slide-enter-active {
  transition: all 180ms cubic-bezier(0.2, 0, 0, 1);
}
.slide-leave-active {
  transition: all 120ms ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
