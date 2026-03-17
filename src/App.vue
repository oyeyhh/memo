<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useStore } from "./composables/useStore";
import type { Note, Group } from "./composables/useApi";
import SearchBar from "./components/SearchBar.vue";
import InputArea from "./components/InputArea.vue";
import NoteItem from "./components/NoteItem.vue";
import GroupItem from "./components/GroupItem.vue";
import ConfirmDialog from "./components/ConfirmDialog.vue";
import Toast from "./components/Toast.vue";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";

const store = useStore();

const confirmVisible = ref(false);
const confirmMessage = ref("");
let confirmCallback: (() => void) | null = null;

const toastVisible = ref(false);
const toastMessage = ref("");
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(msg: string) {
  toastMessage.value = msg;
  toastVisible.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastVisible.value = false;
  }, 1500);
}

const totalCount = computed(() => store.notes.value.length);

onMounted(async () => {
  await store.loadData();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      getCurrentWindow().hide();
    }
  });

  window.addEventListener("note-data-changed", () => {
    store.loadData();
  });
});

async function handleSave(name: string, content: string, groupId: number | null) {
  await store.addNote(name, content, groupId);
  showToast("已保存");
}

async function handleCreateGroup(name: string) {
  await store.addGroup(name);
}

function handleCopy(note: Note) {
  store.copyContent(note.content);
  showToast("已复制到剪贴板");
}

function handleDeleteNote(note: Note) {
  confirmMessage.value = `确认删除「${note.name}」？`;
  confirmCallback = async () => {
    await store.removeNote(note.id);
    confirmVisible.value = false;
    showToast("已删除");
  };
  confirmVisible.value = true;
}

function handleDeleteGroup(group: Group) {
  confirmMessage.value = `确认删除分组「${group.name}」及其所有笔记？`;
  confirmCallback = async () => {
    await store.removeGroup(group.id);
    confirmVisible.value = false;
    showToast("已删除");
  };
  confirmVisible.value = true;
}

function handleEditNote(note: Note) {
  openEditor("note", note);
}

function handleEditGroup(group: Group) {
  openEditor("group", group);
}

async function openEditor(type: string, data: Note | Group) {
  const editor = new WebviewWindow("editor", {
    url: `editor.html?type=${type}&id=${data.id}`,
    title: type === "note" ? "编辑笔记" : "编辑分组",
    width: 420,
    height: type === "note" ? 380 : 220,
    resizable: false,
    center: true,
  });

  editor.once("tauri://destroyed", async () => {
    await store.loadData();
  });
}

function cancelConfirm() {
  confirmVisible.value = false;
  confirmCallback = null;
}

function doConfirm() {
  if (confirmCallback) confirmCallback();
}
</script>

<template>
  <div class="panel">
    <!-- Popover arrow -->
    <div class="panel-arrow" />

    <div class="panel-inner">
      <SearchBar v-model="store.searchQuery.value" />
      <InputArea
        :groups="store.groups.value"
        @save="handleSave"
        @create-group="handleCreateGroup"
      />

      <div class="list-area">
        <template v-if="store.filteredUngroupedNotes.value.length === 0 && store.filteredGroups.value.length === 0">
          <div class="empty-state">
            <div class="empty-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <span class="empty-text">
              {{ store.searchQuery.value ? '无匹配结果' : '暂无笔记' }}
            </span>
            <span v-if="!store.searchQuery.value" class="empty-hint">点击上方开始记录</span>
          </div>
        </template>

        <!-- Ungrouped notes -->
        <template v-if="store.filteredUngroupedNotes.value.length > 0">
          <div class="section-header">
            <span class="section-label">笔记</span>
            <span class="section-badge">{{ store.filteredUngroupedNotes.value.length }}</span>
          </div>
          <NoteItem
            v-for="note in store.filteredUngroupedNotes.value"
            :key="note.id"
            :note="note"
            @copy="handleCopy"
            @edit="handleEditNote"
            @delete="handleDeleteNote"
          />
        </template>

        <!-- Groups -->
        <template v-if="store.filteredGroups.value.length > 0">
          <div class="section-header" :class="{ 'section-header--spaced': store.filteredUngroupedNotes.value.length > 0 }">
            <span class="section-label">分组</span>
            <span class="section-badge">{{ store.filteredGroups.value.length }}</span>
          </div>
          <GroupItem
            v-for="group in store.filteredGroups.value"
            :key="group.id"
            :group="group"
            :notes="store.getNotesForGroup(group.id)"
            @edit-group="handleEditGroup"
            @delete-group="handleDeleteGroup"
            @copy-note="handleCopy"
            @edit-note="handleEditNote"
            @delete-note="handleDeleteNote"
          />
        </template>
      </div>

      <!-- Status bar -->
      <div v-if="totalCount > 0" class="status-bar">
        <span>{{ totalCount }} 条笔记</span>
        <span v-if="store.groups.value.length > 0" class="status-sep">&middot;</span>
        <span v-if="store.groups.value.length > 0">{{ store.groups.value.length }} 个分组</span>
      </div>
    </div>

    <ConfirmDialog
      :visible="confirmVisible"
      :message="confirmMessage"
      @confirm="doConfirm"
      @cancel="cancelConfirm"
    />

    <Toast
      :visible="toastVisible"
      :message="toastMessage"
      @hide="toastVisible = false"
    />
  </div>
</template>

<style>
:root {
  --color-bg: rgba(255, 255, 255, 0.92);
  --color-bg-solid: #ffffff;
  --color-surface: rgba(0, 0, 0, 0.03);
  --color-surface-hover: rgba(0, 0, 0, 0.05);
  --color-surface-active: rgba(0, 0, 0, 0.08);
  --color-border: rgba(0, 0, 0, 0.08);
  --color-border-strong: rgba(0, 0, 0, 0.12);
  --color-border-focus: #007aff;
  --color-text-primary: #1d1d1f;
  --color-text-secondary: #6e6e73;
  --color-text-tertiary: #aeaeb2;
  --color-accent: #007aff;
  --color-accent-hover: #0062d1;
  --color-accent-subtle: rgba(0, 122, 255, 0.08);
  --color-danger: #ff3b30;
  --color-danger-hover: #d63028;
  --color-danger-subtle: rgba(255, 59, 48, 0.08);
  --color-success: #34c759;

  --shadow-panel: 0 0 0 0.5px rgba(0, 0, 0, 0.06),
                  0 8px 40px rgba(0, 0, 0, 0.12),
                  0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);

  --scrollbar-thumb: rgba(0, 0, 0, 0.1);
  --scrollbar-thumb-hover: rgba(0, 0, 0, 0.2);

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 14px;

  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
  --font-size-2xs: 10px;
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 13px;
  --font-size-md: 14px;

  --transition-fast: 120ms ease;
  --transition-normal: 180ms ease;
  --transition-slow: 280ms cubic-bezier(0.2, 0, 0, 1);

  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: transparent;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: rgba(30, 30, 30, 0.95);
    --color-bg-solid: #1e1e1e;
    --color-surface: rgba(255, 255, 255, 0.05);
    --color-surface-hover: rgba(255, 255, 255, 0.07);
    --color-surface-active: rgba(255, 255, 255, 0.1);
    --color-border: rgba(255, 255, 255, 0.08);
    --color-border-strong: rgba(255, 255, 255, 0.12);
    --color-border-focus: #0a84ff;
    --color-text-primary: #f5f5f7;
    --color-text-secondary: #98989d;
    --color-text-tertiary: #6e6e73;
    --color-accent: #0a84ff;
    --color-accent-hover: #409cff;
    --color-accent-subtle: rgba(10, 132, 255, 0.12);
    --color-danger: #ff453a;
    --color-danger-hover: #ff6961;
    --color-danger-subtle: rgba(255, 69, 58, 0.12);
    --color-success: #30d158;

    --shadow-panel: 0 0 0 0.5px rgba(255, 255, 255, 0.06),
                    0 8px 40px rgba(0, 0, 0, 0.4),
                    0 2px 8px rgba(0, 0, 0, 0.2);
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.15);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.25);
    --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.35);

    --scrollbar-thumb: rgba(255, 255, 255, 0.12);
    --scrollbar-thumb-hover: rgba(255, 255, 255, 0.22);
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  overflow: hidden;
}

::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

::selection {
  background: rgba(0, 122, 255, 0.2);
}
</style>

<style scoped>
.panel {
  width: 100%;
  height: 100vh;
  position: relative;
  padding-top: 8px;
}

.panel-arrow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 8px;
  overflow: hidden;
}

.panel-arrow::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 11px;
  height: 11px;
  background: var(--color-bg);
  border: 0.5px solid var(--color-border-strong);
  border-radius: 2px;
  box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.03);
}

.panel-inner {
  height: calc(100vh - 8px);
  background: var(--color-bg);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 0.5px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-panel);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-area {
  flex: 1;
  overflow-y: auto;
  padding: 2px 0 4px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px 4px;
}

.section-header--spaced {
  margin-top: 2px;
  padding-top: 10px;
  border-top: 0.5px solid var(--color-border);
}

.section-label {
  font-size: var(--font-size-2xs);
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-badge {
  font-size: 9px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  background: var(--color-surface);
  padding: 1px 5px;
  border-radius: 6px;
  line-height: 14px;
  font-variant-numeric: tabular-nums;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 44px 24px 32px;
}

.empty-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  opacity: 0.5;
  margin-bottom: 4px;
}

.empty-text {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
}

.empty-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.status-bar {
  padding: 6px 14px;
  border-top: 0.5px solid var(--color-border);
  font-size: var(--font-size-2xs);
  color: var(--color-text-tertiary);
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.status-sep {
  opacity: 0.5;
}
</style>
