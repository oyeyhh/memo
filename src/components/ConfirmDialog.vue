<script setup lang="ts">
defineProps<{
  visible: boolean;
  message: string;
}>();

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="visible" class="confirm-overlay" @click.self="$emit('cancel')">
        <div class="confirm-dialog" role="alertdialog" aria-modal="true" :aria-label="message">
          <div class="confirm-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p class="confirm-text">{{ message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="$emit('cancel')">取消</button>
            <button class="btn-delete" @click="$emit('confirm')">删除</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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

.btn-cancel,
.btn-delete {
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

.btn-cancel:active,
.btn-delete:active {
  transform: scale(0.97);
}

.btn-cancel {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 0.5px solid var(--color-border);
}

.btn-cancel:hover {
  background: var(--color-surface-hover);
}

.btn-delete {
  background: var(--color-danger);
  color: #fff;
}

.btn-delete:hover {
  background: var(--color-danger-hover);
}

/* Transition */
.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 180ms ease;
}
.confirm-enter-active .confirm-dialog,
.confirm-leave-active .confirm-dialog {
  transition: transform 180ms cubic-bezier(0.2, 0, 0, 1), opacity 180ms ease;
}
.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
.confirm-enter-from .confirm-dialog {
  transform: scale(0.94);
  opacity: 0;
}
.confirm-leave-to .confirm-dialog {
  transform: scale(0.96);
  opacity: 0;
}
</style>
