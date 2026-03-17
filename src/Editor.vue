<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useApi, type Group } from "./composables/useApi";
import { getCurrentWindow } from "@tauri-apps/api/window";

const api = useApi();

const params = new URLSearchParams(window.location.search);
const editType = params.get("type") || "note";
const editId = Number(params.get("id"));

const name = ref("");
const content = ref("");
const groupId = ref<number | null>(null);
const groups = ref<Group[]>([]);
const confirmDelete = ref(false);

onMounted(async () => {
  if (editType === "note") {
    const notes = await api.getAllNotes();
    const note = notes.find((n) => n.id === editId);
    if (note) {
      name.value = note.name;
      content.value = note.content;
      groupId.value = note.group_id;
    }
    groups.value = await api.getAllGroups();
  } else {
    const allGroups = await api.getAllGroups();
    groups.value = allGroups;
    const group = allGroups.find((g) => g.id === editId);
    if (group) {
      name.value = group.name;
    }
  }
});

async function save() {
  const trimmedName = name.value.trim();
  if (!trimmedName) return;

  if (editType === "note") {
    const trimmedContent = content.value.trim();
    if (!trimmedContent) return;
    await api.updateNote(editId, trimmedName, trimmedContent, groupId.value);
  } else {
    await api.updateGroup(editId, trimmedName);
  }
  await getCurrentWindow().close();
}

function cancel() {
  getCurrentWindow().close();
}

async function deleteItem() {
  if (editType === "group") {
    await api.deleteGroup(editId);
  } else {
    await api.deleteNote(editId);
  }
  await getCurrentWindow().close();
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    save();
  }
}
</script>

<template>
  <div class="editor" @keydown="handleKeydown">
    <div class="editor-header">
      <h2 class="editor-title">{{ editType === 'note' ? '编辑笔记' : '编辑分组' }}</h2>
    </div>

    <div class="editor-form">
      <div class="field">
        <label class="field-label">{{ editType === 'note' ? '标题' : '分组名称' }}</label>
        <input
          v-model="name"
          type="text"
          :placeholder="editType === 'note' ? '输入标题' : '输入分组名称'"
          class="form-input form-input--name"
          autofocus
        />
      </div>

      <template v-if="editType === 'note'">
        <div class="field field--grow">
          <label class="field-label">内容</label>
          <textarea
            v-model="content"
            placeholder="输入内容..."
            class="form-input form-input--content"
            rows="6"
          />
        </div>
        <div class="field">
          <label class="field-label">分组</label>
          <select v-model="groupId" class="form-input form-input--select">
            <option :value="null">无分组</option>
            <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </div>
      </template>
    </div>

    <div class="editor-footer">
      <button
        v-if="editType === 'group'"
        class="btn-danger-outline"
        @click="confirmDelete = true"
      >
        删除
      </button>
      <div class="spacer" />
      <button class="btn-ghost" @click="cancel">取消</button>
      <button class="btn-primary" @click="save">
        保存
        <span class="btn-hint">⌘↵</span>
      </button>
    </div>

    <!-- Delete confirm -->
    <Transition name="confirm">
      <div v-if="confirmDelete" class="confirm-overlay" @click.self="confirmDelete = false">
        <div class="confirm-dialog">
          <div class="confirm-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p class="confirm-text">确认删除该分组及其所有笔记？</p>
          <div class="confirm-actions">
            <button class="btn-ghost-full" @click="confirmDelete = false">取消</button>
            <button class="btn-danger-full" @click="deleteItem">删除</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
:root {
  --color-bg: #ffffff;
  --color-bg-solid: #ffffff;
  --color-surface: rgba(0, 0, 0, 0.03);
  --color-surface-hover: rgba(0, 0, 0, 0.05);
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

  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 13px;

  --transition-fast: 120ms ease;
  --transition-normal: 180ms ease;

  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1e1e1e;
    --color-bg-solid: #1e1e1e;
    --color-surface: rgba(255, 255, 255, 0.05);
    --color-surface-hover: rgba(255, 255, 255, 0.07);
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
    --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.35);
  }
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { margin: 0; }
</style>

<style scoped>
.editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.editor-header {
  padding: 16px 20px 0;
}

.editor-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.editor-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 20px;
  overflow-y: auto;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field--grow {
  flex: 1;
  min-height: 0;
}

.field-label {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-family: var(--font-sans);
  outline: none;
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.form-input:focus {
  border-color: var(--color-border-focus);
  background: var(--color-bg-solid);
  box-shadow: 0 0 0 2.5px var(--color-accent-subtle);
}

.form-input--name {
  font-weight: 500;
}

.form-input--content {
  resize: none;
  font-family: var(--font-sans);
  flex: 1;
  min-height: 80px;
  line-height: 1.5;
}

.form-input--select {
  cursor: pointer;
}

.editor-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px 16px;
  border-top: 0.5px solid var(--color-border);
}

.spacer { flex: 1; }

.btn-ghost {
  padding: 6px 14px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  background: none;
  color: var(--color-text-secondary);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.btn-ghost:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.btn-primary {
  padding: 6px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  background: var(--color-accent);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background var(--transition-fast);
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}

.btn-hint {
  font-size: 9px;
  opacity: 0.7;
}

.btn-danger-outline {
  padding: 6px 14px;
  border: 0.5px solid var(--color-danger);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--color-danger);
  transition: background var(--transition-fast);
}

.btn-danger-outline:hover {
  background: rgba(255, 59, 48, 0.06);
}

/* Confirm dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.confirm-dialog {
  background: var(--color-bg-solid);
  padding: 20px 22px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 260px;
  text-align: center;
}

.confirm-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  color: var(--color-danger);
  opacity: 0.7;
}

.confirm-text {
  font-size: var(--font-size-base);
  line-height: 1.5;
  margin-bottom: 18px;
  color: var(--color-text-primary);
}

.confirm-actions {
  display: flex;
  gap: 8px;
}

.btn-ghost-full,
.btn-danger-full {
  flex: 1;
  padding: 7px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast), transform 80ms ease;
}

.btn-ghost-full:active,
.btn-danger-full:active {
  transform: scale(0.97);
}

.btn-ghost-full {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 0.5px solid var(--color-border);
}

.btn-ghost-full:hover {
  background: var(--color-surface-hover);
}

.btn-danger-full {
  background: var(--color-danger);
  color: #fff;
}

.btn-danger-full:hover {
  background: var(--color-danger-hover);
}

.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 180ms ease;
}
.confirm-enter-active .confirm-dialog,
.confirm-leave-active .confirm-dialog {
  transition: transform 180ms cubic-bezier(0.2, 0, 0, 1), opacity 180ms ease;
}
.confirm-enter-from, .confirm-leave-to { opacity: 0; }
.confirm-enter-from .confirm-dialog { transform: scale(0.94); opacity: 0; }
.confirm-leave-to .confirm-dialog { transform: scale(0.96); opacity: 0; }
</style>
