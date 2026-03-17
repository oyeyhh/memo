<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { Group } from "../composables/useApi";

const props = defineProps<{
  groups: Group[];
}>();

const emit = defineEmits<{
  save: [name: string, content: string, groupId: number | null];
  createGroup: [name: string];
}>();

const name = ref("");
const content = ref("");
const selectedGroupId = ref<number | null>(null);
const showNewGroupInput = ref(false);
const newGroupName = ref("");
const expanded = ref(false);
const nameInputRef = ref<HTMLInputElement>();

function toggleExpand() {
  expanded.value = !expanded.value;
  if (expanded.value) {
    nextTick(() => nameInputRef.value?.focus());
  }
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    save();
  }
  if (e.key === "Escape" && expanded.value) {
    e.stopPropagation();
    expanded.value = false;
  }
}

function save() {
  const trimmedName = name.value.trim();
  const trimmedContent = content.value.trim();
  if (!trimmedName || !trimmedContent) return;
  emit("save", trimmedName, trimmedContent, selectedGroupId.value);
  name.value = "";
  content.value = "";
  expanded.value = false;
}

function onGroupChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value;
  if (val === "__new__") {
    showNewGroupInput.value = true;
    selectedGroupId.value = null;
    (e.target as HTMLSelectElement).value = "";
  } else {
    selectedGroupId.value = val ? Number(val) : null;
  }
}

function confirmNewGroup() {
  const trimmed = newGroupName.value.trim();
  if (trimmed) {
    emit("createGroup", trimmed);
  }
  showNewGroupInput.value = false;
  newGroupName.value = "";
}

function cancelNewGroup() {
  showNewGroupInput.value = false;
  newGroupName.value = "";
}
</script>

<template>
  <div class="input-area">
    <!-- Collapsed -->
    <button v-if="!expanded" class="input-trigger" @click="toggleExpand" aria-label="新建笔记">
      <div class="trigger-left">
        <div class="trigger-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <span class="trigger-text">新建笔记</span>
      </div>
      <span class="trigger-shortcut">
        <kbd>⌘</kbd><kbd>⇧</kbd><kbd>N</kbd>
      </span>
    </button>

    <!-- Expanded form -->
    <Transition name="expand">
      <div v-if="expanded" class="input-form" @keydown="handleKeydown">
        <input
          ref="nameInputRef"
          v-model="name"
          type="text"
          placeholder="标题"
          class="form-input form-input--name"
        />
        <textarea
          v-model="content"
          placeholder="内容..."
          class="form-input form-input--content"
          rows="3"
        />
        <div class="form-footer">
          <select class="group-select" @change="onGroupChange">
            <option value="">无分组</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
            <option value="__new__">+ 新建分组</option>
          </select>
          <div class="footer-actions">
            <button class="btn-ghost" @click="expanded = false">取消</button>
            <button class="btn-save" @click="save" :disabled="!name.trim() || !content.trim()">
              保存
              <span class="btn-shortcut">⌘↵</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- New group dialog -->
    <Transition name="fade">
      <div v-if="showNewGroupInput" class="overlay" @click.self="cancelNewGroup">
        <div class="dialog">
          <p class="dialog-title">新建分组</p>
          <input
            v-model="newGroupName"
            type="text"
            placeholder="输入分组名称"
            class="form-input"
            autofocus
            @keydown.enter="confirmNewGroup"
            @keydown.escape="cancelNewGroup"
          />
          <div class="dialog-buttons">
            <button class="btn-ghost" @click="cancelNewGroup">取消</button>
            <button class="btn-primary-sm" @click="confirmNewGroup">确定</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.input-area {
  border-bottom: 0.5px solid var(--color-border);
  position: relative;
}

/* Trigger button */
.input-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  background: none;
  font-family: var(--font-sans);
  transition: background var(--transition-fast);
}

.input-trigger:hover {
  background: var(--color-surface-hover);
}

.trigger-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trigger-icon {
  width: 22px;
  height: 22px;
  border-radius: var(--radius-xs);
  background: var(--color-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trigger-text {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.trigger-shortcut {
  display: flex;
  gap: 2px;
}

.trigger-shortcut kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 4px;
  min-width: 16px;
  font-family: var(--font-sans);
  font-size: 9px;
  background: var(--color-surface);
  border: 0.5px solid var(--color-border);
  border-radius: 3px;
  color: var(--color-text-tertiary);
  line-height: 1.4;
}

/* Expanded form */
.input-form {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
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
  min-height: 56px;
  line-height: 1.5;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-select {
  padding: 3px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-2xs);
  font-family: var(--font-sans);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  outline: none;
  cursor: pointer;
}

.btn-ghost {
  padding: 4px 10px;
  border: none;
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
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

.btn-save {
  padding: 4px 12px;
  border: none;
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  background: var(--color-accent);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background var(--transition-fast), opacity var(--transition-fast);
}

.btn-save:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.btn-save:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn-shortcut {
  font-size: 9px;
  opacity: 0.7;
}

/* Dialog */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.dialog {
  background: var(--color-bg-solid);
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 240px;
}

.dialog-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 10px;
}

.dialog-buttons {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-primary-sm {
  padding: 4px 14px;
  border: none;
  border-radius: var(--radius-xs);
  font-size: var(--font-size-xs);
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  background: var(--color-accent);
  color: #fff;
  transition: background var(--transition-fast);
}

.btn-primary-sm:hover {
  background: var(--color-accent-hover);
}

/* Transitions */
.expand-enter-active { transition: opacity 180ms ease, max-height 220ms ease; }
.expand-leave-active { transition: opacity 120ms ease, max-height 180ms ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity var(--transition-normal); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
