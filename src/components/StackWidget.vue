<script setup lang="ts">
import { stack } from '../data/StackData'
</script>

<template>
  <div class="stack-widget">
    <div class="stack-header">
      <div>
        <h2>Stack</h2>
        <p>Technologies and tools I use to build things.</p>
      </div>
    </div>

    <div class="stack-list">
      <section
        v-for="group in stack"
        :key="group.value"
        class="stack-section"
      >
        <h3 class="stack-category">
          {{ group.label }}
        </h3>

        <div class="stack-grid">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="stack-item"
          >
            <component
              :is="item.icon"
              class="stack-icon"
            />

            <span>{{ item.name }}</span>

            <div class="stack-tooltip">
              {{ item.description }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<style scoped>
.stack-widget {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  color: #fff;

  overflow-y: auto;
  scrollbar-width: none;
}

.stack-widget::-webkit-scrollbar {
  display: none;
}
.stack-header {
  margin-bottom: 26px;
}

.stack-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.stack-header p {
  margin: 5px 0 0;
  color: #777;
  font-size: 12px;
}
.stack-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 900px) {
  .stack-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stack-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.stack-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stack-category {
  margin: 0;

  color: #666;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stack-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stack-item {
  position: relative;

  display: flex;
  align-items: center;
  gap: 10px;

  width: 100%;
  height: 64px;
  padding: 0 14px;

  box-sizing: border-box;

  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);

  cursor: default;

  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.stack-item:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-strong);
  transform: translateY(-2px);
}

.stack-tooltip {
  position: absolute;

  left: 50%;
  bottom: calc(100% + 10px);

  width: 220px;
  padding: 10px 12px;

  box-sizing: border-box;

  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);

  background: rgba(14, 14, 14, 0.96);
  color: var(--color-text-secondary);

  font-size: 11px;
  line-height: 1.5;
  text-align: left;

  pointer-events: none;

  opacity: 0;
  visibility: hidden;

  transform: translate(-50%, 6px);

  transition:
    opacity var(--transition-fast),
    visibility var(--transition-fast),
    transform var(--transition-fast);

  z-index: 100;
}

.stack-item:hover .stack-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, 0);
}

.stack-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.stack-item > span {
  flex: 1;

  font-size: 9px;
  line-height: 1.2;
  text-align: center;
}
</style>