<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { Component } from 'vue'

import {
  FeGithub,
  FeMusic,
  FeUsers,
  FeBriefcase,
  FeMessageSquare,
  FeCode,
  FeUser,
  FeActivity,
} from '@kalimahapps/vue-icons/fe'
import WidgetWindow from './components/WidgetWindow.vue'
import { defineAsyncComponent } from 'vue'

const GithubWidget = defineAsyncComponent(
  () => import('./components/GithubWidget.vue')
)

const SpotifyWidget = defineAsyncComponent(
  () => import('./components/SpotifyWidget.vue')
)

const SpotifyArtistWidget = defineAsyncComponent(
  () => import('./components/SpotifyArtistWidget.vue')
)

const MessageWidget = defineAsyncComponent(
  () => import('./components/MessageWidget.vue')
)

const ProfileWidget = defineAsyncComponent(
  () => import('./components/ProfileWidget.vue')
)

const ProjectWidget = defineAsyncComponent(
  () => import('./components/ProjectWidget.vue')
)

const StackWidget = defineAsyncComponent(
  () => import('./components/StackWidget.vue')
)

const ExperienceWidget = defineAsyncComponent(
  () => import('./components/ExperienceWidget.vue')
)

interface WidgetNode {
  id: string
  label: string
  description: string
  icon: Component
  component: Component | null
}

const showDragHint = ref(
  sessionStorage.getItem('drag-hint-dismissed') !== 'true',
)

function dismissDragHint() {
  showDragHint.value = false
  sessionStorage.setItem('drag-hint-dismissed', 'true')
}

const layers: WidgetNode[][] = [
  [
    {
      id: 'github',
      label: 'GitHub',
      description: 'My code and projects',
      icon: FeGithub,
      component: GithubWidget,
    },
    {
      id: 'projects',
      label: 'Projects',
      description: 'Things I have built',
      icon: FeBriefcase,
      component: ProjectWidget,
    },
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: FeCode,
      component: StackWidget,
    },
    {
      id: 'experience',
      label: 'Experience',
      description: 'Things I have been part of',
      icon: FeActivity,
      component: ExperienceWidget,
    },
  ],

  [
    {
      id: 'messages',
      label: 'Messages',
      description: 'Leave me anonymous message!',
      icon: FeMessageSquare,
      component: MessageWidget,
    },
    {
      id: 'tracks',
      label: 'Top Tracks',
      description: 'What I listen to',
      icon: FeMusic,
      component: SpotifyWidget,
    },
    {
      id: 'artists',
      label: 'Top Artists',
      description: 'Artists on repeat',
      icon: FeUsers,
      component: SpotifyArtistWidget,
    },
  ],
]
const centerNode: WidgetNode = {
  id: 'meep',
  label: 'Profile',
  description: 'About me',
  icon: FeUser,
  component: ProfileWidget,
}
const camera = reactive({
  x: 0,
  y: 0,
})

const activeWindow = ref<string | null>(null)
const isDragging = ref(false)

let startX = 0
let startY = 0
let cameraAnimation: number | null = null
let orbitAnimation: number | null = null
let orbitStartTime = 0

/*
|--------------------------------------------------------------------------
| Active widget
|--------------------------------------------------------------------------
*/

const activeNode = computed(() => {
  if (!activeWindow.value) {
    return null
  }

  if (activeWindow.value === centerNode.id) {
    return centerNode
  }

  for (const layer of layers) {
    const node = layer.find((node) => node.id === activeWindow.value)

    if (node) {
      return node
    }
  }

  return null
})

const activeWidget = computed(() => {
  return activeNode.value?.component ?? null
})
const windowTitle = computed(() => activeNode.value?.label ?? '')

/*
|--------------------------------------------------------------------------
| Window
|--------------------------------------------------------------------------
*/

function openWindow(id: string) {
  activeWindow.value = id
}

function closeWindow() {
  activeWindow.value = null
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeWindow()
  }

  if (event.key === 'Home' || event.key.toLowerCase() === 'h') {
    navigateToWidget('meep')
  }
}

/*
|--------------------------------------------------------------------------
| Camera
|--------------------------------------------------------------------------
*/

function stopCameraAnimation() {
  if (cameraAnimation !== null) {
    cancelAnimationFrame(cameraAnimation)
    cameraAnimation = null
  }
}

function moveCameraTo(targetX: number, targetY: number) {
  stopCameraAnimation()

  const startX = camera.x
  const startY = camera.y
  const startTime = performance.now()
  const duration = 750

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    /*
     * Ease in/out.
     *
     * Starts slowly,
     * accelerates,
     * then slows down before reaching the target.
     */
    const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

    camera.x = startX + (targetX - startX) * eased
    camera.y = startY + (targetY - startY) * eased

    if (progress < 1) {
      cameraAnimation = requestAnimationFrame(animate)
    } else {
      cameraAnimation = null
    }
  }

  cameraAnimation = requestAnimationFrame(animate)
}
/*
|--------------------------------------------------------------------------
| Dragging
|--------------------------------------------------------------------------
*/

function startDrag(event: PointerEvent): void {
  if (activeWindow.value) {
    return
  }

  startX = event.clientX
  startY = event.clientY

  isDragging.value = true
}

function drag(event: PointerEvent): void {
  if (activeWindow.value || !isDragging.value) {
    return
  }

  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY

  camera.x += deltaX
  camera.y += deltaY

  startX = event.clientX
  startY = event.clientY
}
function endDrag(event?: PointerEvent): void {
  isDragging.value = false

  if (
    event &&
    event.currentTarget instanceof HTMLElement &&
    event.currentTarget.hasPointerCapture(event.pointerId)
  ) {
    event.currentTarget.releasePointerCapture(event.pointerId)
  }
}
/*
|--------------------------------------------------------------------------
| World layout
|--------------------------------------------------------------------------
*/

function layerRadius(layerIndex: number) {
  const baseRadius = 280
  const radiusStep = 220

  return baseRadius + layerIndex * radiusStep
}

/*
 * Each layer rotates very slowly around Meep.
 *
 * Layer 0:
 * 60 seconds per revolution
 *
 * Layer 1:
 * 90 seconds per revolution
 *
 * Layer 2:
 * 120 seconds per revolution
 *
 * Alternating direction keeps the layers from
 * feeling like a single rigid wheel.
 */
function layerOrbitRotation(layerIndex: number) {
  const elapsed = performance.now() - orbitStartTime

  const duration = 120000 + layerIndex * 300000
  const progress = (elapsed % duration) / duration

  const direction = layerIndex % 2 === 0 ? 1 : -1

  return progress * 360 * direction
}

/*
|--------------------------------------------------------------------------
| Orbit animation
|--------------------------------------------------------------------------
*/

function startOrbitAnimation() {
  orbitStartTime = performance.now()

  function animate() {
    /*
     * Trigger Vue reactivity so node positions are
     * recalculated on every animation frame.
     */
    orbitTick.value++

    orbitAnimation = requestAnimationFrame(animate)
  }

  orbitAnimation = requestAnimationFrame(animate)
}

const orbitTick = ref(0)
function getNodePosition(layerIndex: number, nodeIndex: number) {
  /*
   * Access the reactive tick so this function is
   * recalculated while the orbit animation runs.
   */
  orbitTick.value

  const layer = layers[layerIndex]

  if (!layer) {
    return {
      x: 0,
      y: 0,
    }
  }

  const radius = layerRadius(layerIndex)
  const angleStep = 360 / layer.length

  const rotationPerLayer = 18
  const staticOffset = -90 + layerIndex * rotationPerLayer
  const animatedRotation = layerOrbitRotation(layerIndex)

  const angle = staticOffset + nodeIndex * angleStep + animatedRotation

  const radians = (angle * Math.PI) / 180

  return {
    x: radius * Math.cos(radians),
    y: radius * Math.sin(radians),
  }
}

function nodePosition(layerIndex: number, nodeIndex: number) {
  const position = getNodePosition(layerIndex, nodeIndex)

  return {
    left: `${position.x}px`,
    top: `${position.y}px`,
  }
}

/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

/*
 * Find a widget by its ID,
 * calculate its current world position,
 * then move the camera so that
 * the widget ends up in the center
 * of the viewport.
 */ function navigateToWidget(id: string) {
  /*
   * Meep is the world origin.
   */
  if (id === 'meep') {
    moveCameraTo(0, 0)
    return
  }

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const layer = layers[layerIndex]

    if (!layer) {
      continue
    }

    const nodeIndex = layer.findIndex((node) => node.id === id)

    if (nodeIndex === -1) {
      continue
    }

    const position = getNodePosition(layerIndex, nodeIndex)

    /*
     * Camera movement is the inverse
     * of the node's world position.
     */
    moveCameraTo(-position.x, -position.y)

    return
  }
}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  startOrbitAnimation()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)

  stopCameraAnimation()

  if (orbitAnimation !== null) {
    cancelAnimationFrame(orbitAnimation)
    orbitAnimation = null
  }
})
</script>

<template>
  <main
    class="canvas-viewport"
    :class="{
      dragging: isDragging,
    }"
    @pointerdown="startDrag"
    @pointermove="drag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
  >
    <!--
      Floating navigation.
      This stays attached to the viewport,
      not the moving world.
    -->
    <nav class="floating-nav" @pointerdown.stop @click.stop>
      <button type="button" class="nav-item" @click="navigateToWidget('meep')">Home</button>

      <button type="button" class="nav-item" @click="navigateToWidget('experience')">Experience</button>
      
      <button type="button" class="nav-item" @click="navigateToWidget('projects')">Projects</button>

      <button type="button" class="nav-item" @click="navigateToWidget('stack')">Stack</button>

      <button type="button" class="nav-item" @click="navigateToWidget('github')">GitHub</button>

      <button type="button" class="nav-item" @click="navigateToWidget('tracks')">Tracks</button>

      <button type="button" class="nav-item" @click="navigateToWidget('artists')">Artists</button>

      <button type="button" class="nav-item" @click="navigateToWidget('messages')">Messages</button>
    </nav>

    <!--
      WORLD

      Everything inside this element moves
      when the camera changes.
    -->
      <div
  v-if="showDragHint"
  class="drag-hint"
  @click="dismissDragHint"
  @pointerdown.stop="dismissDragHint"
>
  <span class="drag-hint-icon">✥</span>

  <div class="drag-hint-content">
    <strong>Drag to explore</strong>
    <span>Click and drag anywhere to move around</span>
  </div>
</div>
    <div
      class="canvas-world"
      :style="{
        transform: `
      translate(
        calc(50vw + ${camera.x}px),
        calc(50vh + ${camera.y}px)
      )
    `,
      }"
      @click="closeWindow"
    >
      <!-- Orbit rings -->
      <div
        v-for="(_, layerIndex) in layers"
        :key="layerIndex"
        class="orbit-ring"
        :style="{
          width: `${layerRadius(layerIndex) * 2}px`,
          height: `${layerRadius(layerIndex) * 2}px`,
        }"
      />

      <!--
        Orbit nodes.
        Their positions are recalculated continuously
        so each layer slowly moves around Meep.
      -->
      <template v-for="(layer, layerIndex) in layers" :key="layerIndex">
        <button
          v-for="(node, nodeIndex) in layer"
          :key="node.id"
          type="button"
          class="orbit-node"
          :class="{
            active: activeWindow === node.id,
          }"
          :style="nodePosition(layerIndex, nodeIndex)"
          @pointerdown.stop
          @click.stop="openWindow(node.id)"
        >
          <div class="node-icon">
            <component :is="node.icon" />
          </div>

          <strong class="node-title">
            {{ node.label }}
          </strong>

          <span class="node-description">
            {{ node.description }}
          </span>
        </button>
      </template>

      <!--
        Center node
      -->
      <button type="button" class="meep-node" @pointerdown.stop @click.stop="openWindow('meep')">
        <div class="node-icon">
          <FeUser />
        </div>

        <strong>About Me</strong>

        <span>Introduction</span>
      </button>
    </div>

    <!--
      Active widget window
    -->
    <WidgetWindow v-if="activeWindow && activeWidget" :title="windowTitle" @close="closeWindow">
      <component :is="activeWidget" />
    </WidgetWindow>
  </main>
</template>

<style scoped>
/*
|--------------------------------------------------------------------------
| Viewport
|--------------------------------------------------------------------------
*/
.canvas-viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;

  background: #050505;

  cursor: grab;
  user-select: none;
  touch-action: none;
}

.canvas-viewport::before,
.canvas-viewport::after {
  content: '';
  position: absolute;
  width: 80vw;
  height: 100vh;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(30px);
  will-change: transform, opacity;
}

.canvas-viewport::before {
  top: -15vh;
  left: -10vw;
  background: radial-gradient(
    ellipse,
    rgba(0, 153, 255, 0.08),
    transparent 60%
  );

  animation: blue-breathe 14s ease-in-out infinite;
}

.canvas-viewport::after {
  right: -10vw;
  bottom: -15vh;
  background: radial-gradient(
    ellipse,
    rgba(91, 0, 161, 0.13),
    transparent 60%
  );

  animation: purple-breathe 18s ease-in-out infinite;
}

@keyframes blue-breathe {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }

  50% {
    transform: translate(8vw, 5vh) scale(1.15);
    opacity: 1;
  }
}

@keyframes purple-breathe {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }

  50% {
    transform: translate(-7vw, -6vh) scale(1.18);
    opacity: 1;
  }
}

.canvas-viewport.dragging {
  cursor: grabbing;
}

/*
|--------------------------------------------------------------------------
| Floating navigation
|--------------------------------------------------------------------------
*/

.floating-nav {
  position: fixed;

  top: 18px;
  left: 50%;

  transform: translateX(-50%);

  display: flex;
  align-items: center;

  gap: 4px;

  padding: 5px;

  border: 1px solid #252525;
  border-radius: 12px;

  background: rgba(14, 14, 14, 0.92);

  backdrop-filter: blur(12px);

  z-index: 50;
}

.nav-item {
  height: 30px;

  padding: 0 11px;

  border: 0;
  border-radius: 7px;

  background: transparent;
  color: #777;

  font-size: 11px;
  font-weight: 500;

  cursor: pointer;

  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.nav-item:hover {
  background: #1c1c1c;
  color: #fff;
}

/*
|--------------------------------------------------------------------------
| World
|--------------------------------------------------------------------------
*/

.canvas-world {
  position: absolute;

  left: 0;
  top: 0;

  width: 0;
  height: 0;

  transform-origin: 0 0;
}

/*
|--------------------------------------------------------------------------
| Orbit rings
|--------------------------------------------------------------------------
*/
.orbit-ring {
  position: absolute;
  left: 0;
  top: 0;

  transform: translate(-50%, -50%);

  border: 1px solid rgba(184, 155, 94, 0.12);
  border-radius: 50%;

  box-shadow:
    0 0 40px rgba(184, 155, 94, 0.025),
    inset 0 0 40px rgba(184, 155, 94, 0.015);

  pointer-events: none;
}

/*
|--------------------------------------------------------------------------
| Shared node
|--------------------------------------------------------------------------
*/

.orbit-node,
.meep-node {
  position: absolute;

  transform: translate(-50%, -50%);

  border: 1px solid #333;

  background: #111;
  color: #fff;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

}

/*
|--------------------------------------------------------------------------
| Orbit node
|--------------------------------------------------------------------------
*/
.orbit-node {
  width: 150px;
  height: 150px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 5px;
  padding: 16px;
  box-sizing: border-box;

  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;

  background:
    radial-gradient(
      circle at 35% 30%,
      rgba(255, 255, 255, 0.06),
      transparent 45%
    ),
    #0e0e0e;

  color: #fff;

  cursor: pointer;

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 30px rgba(0, 0, 0, 0.35);

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.orbit-node:hover {
  background:
    radial-gradient(
      circle at 35% 30%,
      rgba(184, 155, 94, 0.14),
      transparent 50%
    ),
    #11100d;

  border-color: #b89b5e;

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(184, 155, 94, 0.12),
    0 0 30px rgba(184, 155, 94, 0.14),
    0 15px 40px rgba(0, 0, 0, 0.4);

  transform: translate(-50%, -50%) scale(1.06);
}

.orbit-node.active {
  background: #1c1c1c;
  border-color: #777;
}

/*
|--------------------------------------------------------------------------
| Node icon
|--------------------------------------------------------------------------
*/
.node-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 4px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.07),
      rgba(255, 255, 255, 0.015)
    );

  color: #aaa;

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 5px 15px rgba(0, 0, 0, 0.25);

  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.orbit-node:hover .node-icon {
  color: #d4b56a;
  border-color: rgba(184, 155, 94, 0.35);

  background:
    linear-gradient(
      145deg,
      rgba(184, 155, 94, 0.14),
      rgba(184, 155, 94, 0.03)
    );

  transform: translateY(-2px);
}
/*
|--------------------------------------------------------------------------
| Node text
|--------------------------------------------------------------------------
*/

.node-title {
  color: #fff;

  font-size: 13px;
  font-weight: 600;

  line-height: 1.2;

  text-align: center;
}

.node-description {
  max-width: 105px;

  color: #666;

  font-size: 10px;

  line-height: 1.35;

  text-align: center;
}

/*
|--------------------------------------------------------------------------
| Meep
|--------------------------------------------------------------------------
*/
.meep-node {
  left: 0;
  top: 0;

  width: 150px;
  height: 150px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(184, 155, 94, 0.45);
  border-radius: 50%;

  background:
    radial-gradient(
      circle at 35% 25%,
      rgba(184, 155, 94, 0.16),
      transparent 50%
    ),
    radial-gradient(
      circle,
      #17140e,
      #0d0d0d 70%
    );

  color: #fff;

  box-shadow:
    0 0 0 1px rgba(184, 155, 94, 0.06),
    0 0 35px rgba(184, 155, 94, 0.10),
    0 20px 50px rgba(0, 0, 0, 0.45);

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.meep-node:hover {
  border-color: #d4b56a;

  box-shadow:
    0 0 0 1px rgba(184, 155, 94, 0.15),
    0 0 45px rgba(184, 155, 94, 0.18),
    0 20px 55px rgba(0, 0, 0, 0.5);

  transform: translate(-50%, -50%) scale(1.06);
}
.meep-node.active {
  background: #181818;

  border-color: #b89b5e;

  box-shadow:
    0 0 0 1px rgba(212, 175, 90, 0.14),
    0 0 24px rgba(212, 175, 90, 0.12);

  transform: translate(-50%, -50%) scale(1.04);
}

.meep-node strong {
  font-size: 24px;
}

.meep-node span {
  margin-top: 4px;

  color: #777;

  font-size: 11px;
}

/*
|--------------------------------------------------------------------------
| Reduced motion
|--------------------------------------------------------------------------
*/

@media (prefers-reduced-motion: reduce) {
  .orbit-node,
  .meep-node,
  .nav-item {
    transition: none;
  }
}

/*
|--------------------------------------------------------------------------
| Small screens
|--------------------------------------------------------------------------
*/

@media (max-width: 700px) {
  .floating-nav {
    max-width: calc(100vw - 24px);

    overflow-x: auto;

    justify-content: flex-start;

    left: 12px;
    right: 12px;

    transform: none;
  }

  .nav-item {
    flex-shrink: 0;
  }
}.drag-hint {
  position: fixed;
  left: 50%;
  bottom: 36px;

  display: flex;
  align-items: center;
  gap: 14px;

  padding: 14px 18px;

  border: 1px solid #333;
  border-radius: 12px;

  background: rgba(14, 14, 14, 0.94);
  backdrop-filter: blur(10px);

  transform: translateX(-50%);
  cursor: pointer;
  z-index: 40;

  animation: drag-hint-in 0.35s ease-out;

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.drag-hint:hover {
  transform: translateX(-50%) translateY(-3px) scale(1.02);

  border-color: #555;

  box-shadow:
    0 0 20px rgba(184, 155, 94, 0.12),
    0 8px 30px rgba(0, 0, 0, 0.35);
}

.drag-hint-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;

  border: 1px solid #2d2d2d;
  border-radius: 9px;

  color: #aaa;
  font-size: 18px;

  animation: drag-hint-float 1.5s ease-in-out infinite;

  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.drag-hint:hover .drag-hint-icon {
  color: #b89b5e;
  border-color: #4a4030;

  animation: none;
  transform: scale(1.08);
}
.drag-hint-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.drag-hint-content strong {
  color: #ddd;
  font-size: 13px;
  font-weight: 600;
}

.drag-hint-content span {
  color: #777;
  font-size: 11px;
}

@keyframes drag-hint-in {
  from {
    opacity: 0;
    transform: translate(-50%, 8px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes drag-hint-float {
  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(4px);
  }
}
</style>
