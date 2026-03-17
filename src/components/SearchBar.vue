<script setup lang="ts">
defineProps<{ modelValue: string }>();
defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <div class="search-wrap">
    <div class="search-bar">
      <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        placeholder="搜索..."
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="search-input"
        aria-label="搜索笔记"
      />
      <Transition name="fade">
        <button
          v-if="modelValue"
          class="clear-btn"
          @click="$emit('update:modelValue', '')"
          title="清除"
          aria-label="清除搜索"
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.search-wrap {
  padding: 10px 10px 4px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 8px;
  color: var(--color-text-tertiary);
  pointer-events: none;
  transition: color var(--transition-fast);
}

.search-bar:focus-within .search-icon {
  color: var(--color-text-secondary);
}

.search-input {
  width: 100%;
  padding: 6px 26px 6px 27px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-sans);
  outline: none;
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-input:focus {
  background: var(--color-surface-hover);
  box-shadow: 0 0 0 2px var(--color-accent-subtle);
}

/* Hide webkit search cancel button */
.search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.clear-btn {
  position: absolute;
  right: 6px;
  background: var(--color-text-tertiary);
  border: none;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-bg-solid);
  padding: 0;
  opacity: 0.45;
  transition: opacity var(--transition-fast);
}

.clear-btn:hover {
  opacity: 0.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
