<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { stack } from '../data/StackData'

interface TooltipState {
  visible: boolean
  text: string
  x: number
  y: number
}

const tooltip = ref<TooltipState>({
  visible: false,
  text: '',
  x: 0,
  y: 0,
})

const TOOLTIP_HALF_WIDTH = 110 // tooltip is 220px wide
const TOOLTIP_EDGE_PADDING = 8
const TOOLTIP_GAP = 10

function showTooltip(event: MouseEvent, text: string) {
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()

  // Clamp horizontally so the tooltip never runs off the viewport edge.
  const x = Math.min(
    Math.max(
      rect.left + rect.width / 2,
      TOOLTIP_HALF_WIDTH + TOOLTIP_EDGE_PADDING,
    ),
    window.innerWidth - TOOLTIP_HALF_WIDTH - TOOLTIP_EDGE_PADDING,
  )

  tooltip.value = {
    visible: true,
    text,
    x,
    y: rect.top - TOOLTIP_GAP,
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}

/* The tooltip position is frozen at hover-start. If the user scrolls
 * while hovering, the item moves but the tooltip doesn't. Hiding on
 * scroll is cheaper than tracking position every frame.
 * Capture-phase listener catches scrolls from any nested scroll container. */
function handleScroll() {
  tooltip.value.visible = false
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true)
})
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
            @mouseenter="showTooltip($event, item.description)"
            @mouseleave="hideTooltip"
          >
            <component
              :is="item.icon"
              class="stack-icon"
            />

            <span>{{ item.name }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>

  <!--
    Teleported to <body> so the tooltip escapes the two nested
    overflow:auto containers (the widget and the modal's content area)
    that would otherwise clip it. Position is computed from the hovered
    item's bounding rect; scoped styles still apply because Vue keeps the
    data-v attribute on teleported nodes.
  -->
  <Teleport to="body">
    <div
      v-if="tooltip.visible"
      class="stack-tooltip-floating"
      :style="{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
      }"
    >
      {{ tooltip.text }}
    </div>
  </Teleport>
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

  /* Reserve space for 2 lines. Long titles like "Frameworks & Libraries"
   * wrap on narrow screens; without this, the columns below them start
   * at different Y positions and the grid visibly breaks. */
  min-height: 2.4em;
  line-height: 1.2;

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

/* ------------------------------------------------------------------ */
/* Floating tooltip (teleported)                                       */
/* ------------------------------------------------------------------ */

.stack-tooltip-floating {
  position: fixed;

  /* Positioned with (x, y) = bottom-center of the tooltip. translate
   * moves it up by its own height and back by half its width so that
   * point becomes the tooltip's bottom-center. */
  transform: translate(-50%, -100%);

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

  /* Above the modal (z-index 100) and floating nav (z-index 50). */
  z-index: 1000;

  animation: tooltip-in 0.12s ease-out;
}

@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: translate(-50%, calc(-100% + 4px));
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stack-item {
    transition: none;
  }

  .stack-tooltip-floating {
    animation: none;
  }
}
</style>