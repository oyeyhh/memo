<script setup lang="ts">
defineProps<{
  message: string;
  visible: boolean;
}>();

defineEmits<{ hide: [] }>();
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" role="status" aria-live="polite">
      <svg class="toast-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{{ message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: var(--font-size-xs);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 20000;
  pointer-events: none;
  white-space: nowrap;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.toast-check {
  color: var(--color-success);
}

@media (prefers-color-scheme: dark) {
  .toast {
    background: rgba(255, 255, 255, 0.15);
  }
}

.toast-enter-active {
  transition: opacity 200ms ease, transform 200ms cubic-bezier(0.2, 0, 0, 1);
}
.toast-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(6px) scale(0.96);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-3px);
}
</style>
