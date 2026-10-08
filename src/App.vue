<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
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
  FeRewind,
  FeSmile,
} from '@kalimahapps/vue-icons/fe'
import WidgetWindow from './components/WidgetWindow.vue'

const GithubWidget = defineAsyncComponent(() => import('./components/GithubWidget.vue'))
const SpotifyWidget = defineAsyncComponent(() => import('./components/SpotifyWidget.vue'))
const SpotifyArtistWidget = defineAsyncComponent(() => import('./components/SpotifyArtistWidget.vue'))
const MessageWidget = defineAsyncComponent(() => import('./components/MessageWidget.vue'))
const ProfileWidget = defineAsyncComponent(() => import('./components/ProfileWidget.vue'))
const ProjectWidget = defineAsyncComponent(() => import('./components/ProjectWidget.vue'))
const StackWidget = defineAsyncComponent(() => import('./components/StackWidget.vue'))
const ExperienceWidget = defineAsyncComponent(() => import('./components/ExperienceWidget.vue'))
const GithubDevlogWidget = defineAsyncComponent(() => import('./components/GithubDevlogWidget.vue'))
const PersonalityWidget = defineAsyncComponent(() => import('./components/PersonalityWidget.vue'))

interface WidgetNode {
  id: string
  label: string
  description: string
  icon: Component
  component: Component | null
}

/* ------------------------------------------------------------------ */
/* Static data (never reactive: it never changes)                      */
/* ------------------------------------------------------------------ */

const layers: WidgetNode[][] = [
  [
    { id: 'github', label: 'GitHub', description: 'My code and projects', icon: FeGithub, component: GithubWidget },
    { id: 'projects', label: 'Projects', description: 'Things I have built', icon: FeBriefcase, component: ProjectWidget },
    { id: 'stack', label: 'Stack', description: 'Tools I work with', icon: FeCode, component: StackWidget },
    { id: 'experience', label: 'Experience', description: 'Things I have been part of', icon: FeActivity, component: ExperienceWidget },
  ],
  [
    { id: 'messages', label: 'Messages', description: 'Leave me anonymous message!', icon: FeMessageSquare, component: MessageWidget },
    { id: 'tracks', label: 'Top Tracks', description: 'What I listen to', icon: FeMusic, component: SpotifyWidget },
    { id: 'artists', label: 'Top Artists', description: 'Artists on repeat', icon: FeUsers, component: SpotifyArtistWidget },
    { id: 'devlog', label: 'Devlog', description: 'Track this site development ', icon: FeRewind, component: GithubDevlogWidget },
    { id: 'personality', label: 'Personality', description: 'Explore my O/C/E/A/N personality', icon: FeSmile, component: PersonalityWidget },
  ],
]

const centerNode: WidgetNode = {
  id: 'meep',
  label: 'Profile',
  description: 'About me',
  icon: FeUser,
  component: ProfileWidget,
}

const ROTATION_PER_LAYER = 18

const layerRadius = (layerIndex: number) => 280 + layerIndex * 220
const layerPeriod = (layerIndex: number) => 120000 + layerIndex * 300000
const layerDirection = (layerIndex: number) => (layerIndex % 2 === 0 ? 1 : -1)
const baseAngle = (layerIndex: number, nodeIndex: number) =>
  -90 + layerIndex * ROTATION_PER_LAYER + nodeIndex * (360 / layers[layerIndex]!.length)

const layerLabels = [
  '· developer profile ·',
  '· trivial stuff ·',
]

/* Which layer is currently being hovered. Null = none. */
const hoveredLayer = ref<number | null>(null)

const LABEL_INSET = 95

const layerLabelGeometry = layers.map((_, i) => {
  const R = layerRadius(i)
  const labelR = R - LABEL_INSET
  const size = (R + 160) * 2 // viewBox square, with margin
  const c = size / 2

  const a1 = (200 * Math.PI) / 180
  const a2 = (340 * Math.PI) / 180
  const x1 = c + labelR * Math.cos(a1)
  const y1 = c + labelR * Math.sin(a1)
  const x2 = c + labelR * Math.cos(a2)
  const y2 = c + labelR * Math.sin(a2)

  return {
    size,
    path: `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${labelR} ${labelR} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
  }
}
)

/* ------------------------------------------------------------------ */
/* Active window                                                       */
/* ------------------------------------------------------------------ */

const activeWindow = ref<string | null>(null)

const activeNode = computed(() => {
  const id = activeWindow.value
  if (!id) return null
  if (id === centerNode.id) return centerNode
  for (const layer of layers) {
    const node = layer.find((n) => n.id === id)
    if (node) return node
  }
  return null
})
const activeWidget = computed(() => activeNode.value?.component ?? null)
const windowTitle = computed(() => activeNode.value?.label ?? '')

const openWindow = (id: string) => (activeWindow.value = id)
const closeWindow = () => (activeWindow.value = null)

/* ------------------------------------------------------------------ */
/* Onboarding overlay                                                  */
/* ------------------------------------------------------------------ */

const ONBOARDING_KEY = 'canvas-onboarding-done'

function readOnboardingDone(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true'
  } catch {
    return false
  }
}

const showOnboarding = ref(!readOnboardingDone())
const onboardingStep = ref(0)
const totalSteps = 2

const isTouch = typeof window !== 'undefined'
  && window.matchMedia('(pointer: coarse)').matches

const stepContent = computed(() => {
  if (onboardingStep.value === 0) {
    return {
      gesture: 'drag' as const,
      title: 'Drag to explore',
      subtitle: 'Click and drag anywhere to pan the canvas',
    }
  }
  if (isTouch) {
    return {
      gesture: 'pinch' as const,
      title: 'Pinch to zoom',
      subtitle: 'Use two fingers to zoom in and out',
    }
  }
  return {
    gesture: 'scroll' as const,
    title: 'Scroll to zoom',
    subtitle: 'Use your mouse wheel or trackpad',
  }
})

const isLastStep = computed(() => onboardingStep.value === totalSteps - 1)

function advanceOnboarding() {
  if (!isLastStep.value) {
    onboardingStep.value++
    return
  }
  showOnboarding.value = false
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true')
  } catch {
    /* storage unavailable */
  }
}

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

const isCoarsePointer = typeof window !== 'undefined'
  && window.matchMedia('(pointer: coarse)').matches

const DEFAULT_ZOOM = isCoarsePointer ? 0.5 : 0.75

const camera = {
  x: 0,
  y: 0,
  zoom: DEFAULT_ZOOM,
}

const MIN_ZOOM = 0.3
const MAX_ZOOM = 2.5

const WORLD_BOUND = 600

const worldEl = ref<HTMLElement | null>(null)
const isDragging = ref(false)

let applyFrame: number | null = null
let flyFrame: number | null = null

function applyCamera() {
  applyFrame = null
  if (worldEl.value) {
    worldEl.value.style.transform =
      `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`
  }
}

function scheduleCamera() {
  if (applyFrame === null) applyFrame = requestAnimationFrame(applyCamera)
}

function stopFly() {
  if (flyFrame !== null) {
    cancelAnimationFrame(flyFrame)
    flyFrame = null
  }
}

function flyTo(targetX: number, targetY: number, targetZoom?: number) {
  stopFly()

  const finalZoom = targetZoom !== undefined ? clampZoom(targetZoom) : camera.zoom
  const limit = WORLD_BOUND * finalZoom
  const clampedX = Math.max(-limit, Math.min(limit, targetX))
  const clampedY = Math.max(-limit, Math.min(limit, targetY))

  const fromX = camera.x
  const fromY = camera.y
  const fromZoom = camera.zoom
  const startTime = performance.now()
  const duration = 750

  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1)
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2

    camera.x = fromX + (clampedX - fromX) * eased
    camera.y = fromY + (clampedY - fromY) * eased

    if (targetZoom !== undefined) {
      camera.zoom = fromZoom + (finalZoom - fromZoom) * eased
    }

    worldEl.value!.style.transform =
      `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`

    flyFrame = progress < 1 ? requestAnimationFrame(step) : null
  }

  flyFrame = requestAnimationFrame(step)
}

/* ------------------------------------------------------------------ */
/* Dragging + Pinch                                                    */
/* ------------------------------------------------------------------ */

const pointers = new Map<number, { x: number; y: number }>()

let lastX = 0
let lastY = 0

let prevDist = 0
let prevMid = { x: 0, y: 0 }

function viewportCenter() {
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))
}

function clampCamera() {
  const limit = WORLD_BOUND * camera.zoom

  if (camera.x > limit) camera.x = limit
  else if (camera.x < -limit) camera.x = -limit

  if (camera.y > limit) camera.y = limit
  else if (camera.y < -limit) camera.y = -limit
}

function startDrag(event: PointerEvent) {
  if (activeWindow.value) return
  if (showOnboarding.value) return

  stopFly()

  const el = event.currentTarget as HTMLElement
  el.setPointerCapture(event.pointerId)
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (pointers.size === 1) {
    lastX = event.clientX
    lastY = event.clientY
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    prevDist = Math.hypot(a!.x - b!.x, a!.y - b!.y)
    prevMid = { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 }
  }

  isDragging.value = true
}

function drag(event: PointerEvent) {
  if (!pointers.has(event.pointerId)) return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

  if (pointers.size === 1) {
    camera.x += event.clientX - lastX
    camera.y += event.clientY - lastY
    lastX = event.clientX
    lastY = event.clientY
    clampCamera()
    scheduleCamera()
    return
  }

  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y)
    const mid = { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 }

    if (prevDist > 0 && dist > 0) {
      const newZoom = clampZoom(camera.zoom * (dist / prevDist))

      const c = viewportCenter()
      const wx = (prevMid.x - c.x - camera.x) / camera.zoom
      const wy = (prevMid.y - c.y - camera.y) / camera.zoom

      camera.zoom = newZoom
      camera.x = mid.x - c.x - wx * camera.zoom
      camera.y = mid.y - c.y - wy * camera.zoom

      clampCamera()
      scheduleCamera()
    }

    prevDist = dist
    prevMid = mid
  }
}

function endDrag(event: PointerEvent) {
  if (!pointers.has(event.pointerId)) return
  pointers.delete(event.pointerId)

  const el = event.currentTarget as HTMLElement
  if (el.hasPointerCapture(event.pointerId)) {
    el.releasePointerCapture(event.pointerId)
  }

  if (pointers.size === 1) {
    const [remaining] = [...pointers.values()]
    lastX = remaining!.x
    lastY = remaining!.y
  } else if (pointers.size === 0) {
    isDragging.value = false
    prevDist = 0
  }
}

function handleWheel(event: WheelEvent) {
  if (activeWindow.value) return
  if (showOnboarding.value) return
  event.preventDefault()

  stopFly()

  const factor = Math.exp(-event.deltaY * 0.0015)
  const newZoom = clampZoom(camera.zoom * factor)
  if (newZoom === camera.zoom) return

  const c = viewportCenter()
  const wx = (event.clientX - c.x - camera.x) / camera.zoom
  const wy = (event.clientY - c.y - camera.y) / camera.zoom

  camera.zoom = newZoom
  camera.x = event.clientX - c.x - wx * camera.zoom
  camera.y = event.clientY - c.y - wy * camera.zoom

  clampCamera()
  scheduleCamera()
}

/* ------------------------------------------------------------------ */
/* Ring interior detection                                             */
/*                                                                     */
/* Runs on every pointermove (except while dragging or with a widget   */
/* open). Converts the cursor to world coordinates, measures distance  */
/* from the origin, and picks the innermost ring that encloses the     */
/* point. That ring — and only that ring — glows.                      */
/* ------------------------------------------------------------------ */

function updateHoveredRing(event: PointerEvent) {
  if (isDragging.value) return
  if (activeWindow.value) return
  if (showOnboarding.value) return

  const c = viewportCenter()
  const wx = (event.clientX - c.x - camera.x) / camera.zoom
  const wy = (event.clientY - c.y - camera.y) / camera.zoom
  const r = Math.hypot(wx, wy)

  // Innermost enclosing ring. Loop from smallest radius upward so the
  // first match wins.
  let layer: number | null = null
  for (let i = 0; i < layers.length; i++) {
    if (r <= layerRadius(i)) {
      layer = i
      break
    }
  }

  hoveredLayer.value = layer
}

function onPointerMove(event: PointerEvent) {
  drag(event)
  updateHoveredRing(event)
}

/* ------------------------------------------------------------------ */
/* Orbit                                                               */
/* ------------------------------------------------------------------ */

let orbitStartTime = 0

function currentNodePosition(layerIndex: number, nodeIndex: number) {
  const elapsed = performance.now() - orbitStartTime
  const period = layerPeriod(layerIndex)
  const spin = ((elapsed % period) / period) * 360 * layerDirection(layerIndex)

  const radians = ((baseAngle(layerIndex, nodeIndex) + spin) * Math.PI) / 180
  const radius = layerRadius(layerIndex)

  return { x: radius * Math.cos(radians), y: radius * Math.sin(radians) }
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

const ZOOM_IN_THRESHOLD = 0.6
const ZOOM_OUT_THRESHOLD = 1.3
const ZOOM_TARGET = 1.25

function navigateToWidget(id: string) {
  closeNavGroup()
  let targetZoom = camera.zoom

  if (camera.zoom < ZOOM_IN_THRESHOLD) {
    targetZoom = ZOOM_TARGET
  } else if (camera.zoom > ZOOM_OUT_THRESHOLD) {
    targetZoom = ZOOM_TARGET
  }

  if (id === 'meep') {
    flyTo(0, 0, DEFAULT_ZOOM)
    return
  }

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const nodeIndex = layers[layerIndex]!.findIndex((n) => n.id === id)
    if (nodeIndex === -1) continue

    const { x, y } = currentNodePosition(layerIndex, nodeIndex)
    flyTo(-x * targetZoom, -y * targetZoom, targetZoom)
    return
  }
}

/* ------------------------------------------------------------------ */
/* Navigation groups                                                   */
/*                                                                     */
/* Home is standalone (it's a reset, not a category). The other items  */
/* are split into three groups that mirror how the widgets cluster by  */
/* intent: things about the work, things about the person, and extras. */
/* ------------------------------------------------------------------ */

interface NavItem {
  id: string
  label: string
}

interface NavGroup {
  id: 'dev' | 'personal' | 'extras'
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    id: 'dev',
    label: 'Dev',
    items: [
      { id: 'projects', label: 'Projects' },
      { id: 'stack', label: 'Stack' },
      { id: 'github', label: 'GitHub' },
      { id: 'devlog', label: 'Devlog' },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      { id: 'experience', label: 'Experience' },
      { id: 'personality', label: 'Personality' },
    ],
  },
  {
    id: 'extras',
    label: 'Extras',
    items: [
      { id: 'tracks', label: 'Tracks' },
      { id: 'artists', label: 'Artists' },
      { id: 'messages', label: 'Messages' },
    ],
  },
]

/* Which dropdown panel is open. Null = all closed. */
const openNavGroup = ref<NavGroup['id'] | null>(null)

function toggleNavGroup(id: NavGroup['id']) {
  openNavGroup.value = openNavGroup.value === id ? null : id
}

function closeNavGroup() {
  openNavGroup.value = null
}

/* Returns the group a widget id belongs to, or null if it's home/unknown.
 * Used to highlight the trigger when one of its widgets is open. */
function groupForWidget(widgetId: string | null): NavGroup['id'] | null {
  if (!widgetId) return null
  for (const group of navGroups) {
    if (group.items.some((item) => item.id === widgetId)) return group.id
  }
  return null
}

/* Click-outside handler for the dropdowns. Bound to a full-screen
 * backdrop that's rendered only while a panel is open — cheap and
 * doesn't need a document-level listener. */
function onNavBackdropClick() {
  closeNavGroup()
}

/* ------------------------------------------------------------------ */
/* Keyboard                                                            */
/* ------------------------------------------------------------------ */

function handleKeydown(event: KeyboardEvent) {
  if (showOnboarding.value) {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      advanceOnboarding()
    }
    return
  }
  if (event.key === 'Escape') {
      if (openNavGroup.value) {
    closeNavGroup()
    return
  }
    closeWindow()
    return
  }

  const target = event.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return
  }

  if (event.key === 'Home' || event.key.toLowerCase() === 'h') {
    navigateToWidget('meep')
  }
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */

onMounted(() => {
  orbitStartTime = performance.now()
  applyCamera()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopFly()
  if (applyFrame !== null) cancelAnimationFrame(applyFrame)
})
</script>

<template>
  <main
    class="canvas-viewport"
    @wheel="handleWheel"
    @pointerdown="startDrag"
    @pointermove="onPointerMove"
    @pointerup="endDrag"
    @pointercancel="endDrag"
    @pointerleave="hoveredLayer = null"
  >
    <!-- Floating navigation (attached to viewport, not the world) -->
<!-- Floating navigation (attached to viewport, not the world) -->
<nav class="floating-nav" @pointerdown.stop @pointermove.stop @click.stop>
  <button
    type="button"
    class="nav-item nav-item--home"
    :class="{ 'is-active': activeWindow === 'meep' }"
    @click="navigateToWidget('meep')"
  >
    Home
  </button>

  <span class="nav-divider" aria-hidden="true" />

  <div
    v-for="group in navGroups"
    :key="group.id"
    class="nav-group"
    :class="{
      'is-open': openNavGroup === group.id,
      'is-active': groupForWidget(activeWindow) === group.id,
    }"
  >
    <button
      type="button"
      class="nav-item nav-item--trigger"
      :aria-expanded="openNavGroup === group.id"
      :aria-controls="`nav-panel-${group.id}`"
      @click="toggleNavGroup(group.id)"
    >
      {{ group.label }}
      <span class="nav-chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </button>

    <Transition name="nav-panel">
      <div
        v-if="openNavGroup === group.id"
        :id="`nav-panel-${group.id}`"
        class="nav-panel"
      >
        <button
          v-for="item in group.items"
          :key="item.id"
          type="button"
          class="nav-panel-item"
          :class="{ 'is-active': activeWindow === item.id }"
          @click="navigateToWidget(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
    </Transition>
  </div>
</nav>

<!-- Click-away backdrop for open nav panels. Rendered only while a
 * panel is open so it doesn't sit on top of everything the rest of
 * the time. -->
<Transition name="nav-backdrop">
  <div
    v-if="openNavGroup"
    class="nav-backdrop"
    @click="onNavBackdropClick"
    @pointerdown.stop
    @wheel.stop
  />
</Transition>

    <!-- WORLD: transform is written directly from JS (see applyCamera) -->
    <div ref="worldEl" class="canvas-world" @click="closeWindow">
      <!-- Ambient world lighting — anchored to the world origin -->
      <div class="world-glow world-glow-blue"></div>
      <div class="world-glow world-glow-purple"></div>

      <!-- Orbit rings -->
      <div
        v-for="(_, layerIndex) in layers"
        :key="`ring-${layerIndex}`"
        class="orbit-ring"
        :class="{ 'is-hot': hoveredLayer === layerIndex }"
        :style="{
          width: `${layerRadius(layerIndex) * 2}px`,
          height: `${layerRadius(layerIndex) * 2}px`,
        }"
      ></div>

      <!-- Curved ring labels (inside the ring) — anchored to world origin -->
      <svg
        v-for="(geom, layerIndex) in layerLabelGeometry"
        :key="`label-${layerIndex}`"
        class="orbit-label"
        :class="{ 'is-hot': hoveredLayer === layerIndex }"
        :width="geom.size"
        :height="geom.size"
        :viewBox="`0 0 ${geom.size} ${geom.size}`"
        aria-hidden="true"
      >
        <path :id="`ring-arc-${layerIndex}`" :d="geom.path" fill="none" />
        <text class="orbit-label-text">
          <textPath
            :href="`#ring-arc-${layerIndex}`"
            startOffset="50%"
            text-anchor="middle"
          >{{ layerLabels[layerIndex] }}</textPath>
        </text>
      </svg>

      <!--
        One rotating wrapper per ring (CSS animation, compositor-only).
        Each node sits in a static slot and is counter-rotated so it
        stays upright while the ring spins.
      -->
      <div
        v-for="(layer, layerIndex) in layers"
        :key="`spin-${layerIndex}`"
        class="orbit-spin"
        :style="{
          animationDuration: `${layerPeriod(layerIndex)}ms`,
          animationDirection: layerDirection(layerIndex) === 1 ? 'normal' : 'reverse',
        }"
      >
        <div
          v-for="(node, nodeIndex) in layer"
          :key="node.id"
          class="orbit-slot"
          :style="{
            '--angle': `${baseAngle(layerIndex, nodeIndex)}deg`,
            '--radius': `${layerRadius(layerIndex)}px`,
          }"
        >
          <div
            class="orbit-upright"
            :style="{
              animationDuration: `${layerPeriod(layerIndex)}ms`,
              animationDirection: layerDirection(layerIndex) === 1 ? 'reverse' : 'normal',
            }"
          >
            <button
              type="button"
              class="orbit-node"
              :class="{ active: activeWindow === node.id }"
              @pointerdown.stop
              @click.stop="openWindow(node.id)"
            >
              <div class="node-icon">
                <component :is="node.icon" />
              </div>
              <strong class="node-title">{{ node.label }}</strong>
              <span class="node-description">{{ node.description }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Center node -->
      <button
        type="button"
        class="meep-node"
        :class="{ active: activeWindow === 'meep' }"
        @pointerdown.stop
        @click.stop="openWindow('meep')"
      >
        <div class="node-icon">
          <FeUser />
        </div>
        <strong>About Me</strong>
        <span>Introduction</span>
      </button>
    </div>

    <WidgetWindow v-if="activeWindow && activeWidget" :title="windowTitle" @close="closeWindow">
      <component :is="activeWidget" />
    </WidgetWindow>

    <!-- Onboarding overlay -->
    <Transition name="onboarding-fade">
      <div
        v-if="showOnboarding"
        class="onboarding"
        role="dialog"
        aria-modal="true"
        aria-label="How to use the canvas"
        @pointerdown.stop
        @click.stop="advanceOnboarding"
      >
        <div class="onboarding-stage">
          <Transition name="onboarding-step" mode="out-in">
            <div :key="onboardingStep" class="onboarding-content">

              <div v-if="stepContent.gesture === 'drag'" class="gesture gesture-drag">
                <span class="gesture-track"></span>
                <span class="finger finger-trail finger-trail-3"></span>
                <span class="finger finger-trail finger-trail-2"></span>
                <span class="finger finger-trail finger-trail-1"></span>
                <span class="finger"></span>
              </div>

              <div v-else-if="stepContent.gesture === 'pinch'" class="gesture gesture-pinch">
                <span class="gesture-track"></span>
                <span class="finger finger-pinch-a"></span>
                <span class="finger finger-pinch-b"></span>
              </div>

              <div v-else class="gesture gesture-scroll">
                <span class="scroll-mouse">
                  <span class="scroll-wheel"></span>
                </span>
                <span class="scroll-chevrons">
                  <span class="chev chev-up"></span>
                  <span class="chev chev-down"></span>
                </span>
              </div>

              <div class="onboarding-copy">
                <h2 class="onboarding-title">{{ stepContent.title }}</h2>
                <p class="onboarding-subtitle">{{ stepContent.subtitle }}</p>
              </div>
            </div>
          </Transition>
        </div>

        <div class="onboarding-footer">
          <div class="onboarding-dots" aria-hidden="true">
            <span
              v-for="i in totalSteps"
              :key="i"
              class="onboarding-dot"
              :class="{
                'is-active': onboardingStep === i - 1,
                'is-done': onboardingStep > i - 1,
              }"
            />
          </div>

          <p class="onboarding-hint">
            {{ isLastStep ? 'Tap anywhere to begin' : 'Tap anywhere to continue' }}
          </p>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
/* ---------------- Viewport ---------------- */
.canvas-viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #090909;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.canvas-viewport.dragging {
  cursor: grabbing;
}

/* ---------------- World-attached glows ---------------- */
.world-glow {
  position: absolute;
  z-index: -1;

  border-radius: 50%;
  pointer-events: none;

  translate: -50% -50%;

  will-change: transform, opacity;
}

.world-glow-blue {
  left: -260px;
  top: -240px;

  width: 1200px;
  height: 1200px;

  background: radial-gradient(
    circle,
    rgba(0, 153, 255, 0.2),
    transparent 60%
  );

  animation: blue-breathe 14s ease-in-out infinite;
}

.world-glow-purple {
  left: 240px;
  top: 260px;

  width: 1400px;
  height: 1400px;

  background: radial-gradient(
    circle,
    rgba(91, 0, 161, 0.30),
    transparent 62%
  );

  animation: purple-breathe 18s ease-in-out infinite;
}

@keyframes blue-breathe {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50%      { transform: scale(1.12); opacity: 1; }
}

@keyframes purple-breathe {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50%      { transform: scale(1.15); opacity: 1; }
}

/* ---------------- Floating nav ---------------- */
/* ---------------- Floating nav (grouped) ---------------- */
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
  background: rgba(14, 14, 14, 0.96);
  z-index: 50;
}

/* Thin vertical rule between Home and the group triggers. */
.nav-divider {
  width: 1px;
  height: 18px;
  margin: 0 2px;

  background: #2a2a2a;
}

.nav-group {
  position: relative;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  height: 30px;
  padding: 0 11px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #777;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background: #1c1c1c;
  color: #fff;
}

/* Trigger highlight when this group's widget is currently open. */
.nav-group.is-active > .nav-item--trigger {
  color: #d4b56a;
}

/* Trigger highlight while the panel is expanded. */
.nav-group.is-open > .nav-item--trigger {
  background: #1c1c1c;
  color: #fff;
}

.nav-chevron {
  display: inline-flex;
  width: 10px;
  height: 10px;

  transition: transform 0.18s ease;
}

.nav-chevron svg {
  width: 100%;
  height: 100%;
}

.nav-group.is-open .nav-chevron {
  transform: rotate(180deg);
}

/* ---------------- Dropdown panel ---------------- */
.nav-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  flex-direction: column;

  min-width: 140px;
  padding: 5px;

  border: 1px solid #252525;
  border-radius: 10px;
  background: rgba(14, 14, 14, 0.98);

  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);

  z-index: 1;
}

.nav-panel-item {
  display: block;
  width: 100%;

  padding: 7px 10px;

  border: 0;
  border-radius: 6px;
  background: transparent;

  color: #888;
  font: inherit;
  font-size: 11px;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;

  cursor: pointer;

  transition: background 0.12s ease, color 0.12s ease;
}

.nav-panel-item:hover {
  background: #1c1c1c;
  color: #fff;
}

.nav-panel-item.is-active {
  color: #d4b56a;
}

/* ---------------- Click-away backdrop ---------------- */
.nav-backdrop {
  position: fixed;
  inset: 0;

  /* Above the canvas, below the nav (z-index 50). */
  z-index: 49;

  /* Transparent — it exists only to catch clicks. */
  background: transparent;
}

/* ---------------- Transitions ---------------- */
.nav-panel-enter-active,
.nav-panel-leave-active {
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
}

.nav-panel-enter-from,
.nav-panel-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.nav-backdrop-enter-active,
.nav-backdrop-leave-active {
  transition: opacity 0.14s ease;
}

.nav-backdrop-enter-from,
.nav-backdrop-leave-to {
  opacity: 0;
}

/* ---------------- World ---------------- */
.canvas-world {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  transform-origin: 0 0;
  will-change: transform;
}

/* ---------------- Orbit rings ---------------- */
.orbit-ring {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(184, 155, 94, 0.12);
  border-radius: 50%;
  pointer-events: none;

  transition:
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

/*
 * Hover glow. When the cursor is anywhere inside this ring's interior
 * (see updateHoveredRing), the whole ring gets a soft inner+outer gold
 * halo. Reads as the layer "waking up."
 */
.orbit-ring.is-hot {
  border-color: rgba(184, 155, 94, 0.42);
  box-shadow:
    0 0 40px rgba(184, 155, 94, 0.10),
    inset 0 0 40px rgba(184, 155, 94, 0.05);
}

/* ---------------- Ring labels ---------------- */
/*
 * SVG arcs of curved text sitting INSIDE each ring. Anchored to the
 * world origin like everything else. Static while the ring spins
 * beneath them, which is what makes the map read as a map.
 */
.orbit-label {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;

  opacity: 0.55;

  transition: opacity 0.35s ease;
}

.orbit-label.is-hot {
  opacity: 1;
}

/*
 * Monospace with a hint of character. Space Mono has the mechanical
 * regularity of a typewriter but with subtle quirks that read as
 * modern. Fallback chain lands on the system's mono which is often
 * Courier — a real typewriter face — so the aesthetic holds up even
 * without a web font loaded.
 */
.orbit-label-text {
  fill: #b89b5e;

  font-family: 'Space Mono', 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.13em;

  transition: filter 0.35s ease;
}

/* Subtle golden halo when the ring is active. */
.orbit-label.is-hot .orbit-label-text {
  filter: drop-shadow(0 0 8px rgba(184, 155, 94, 0.7));
}

/* ---------------- Orbit rotation (CSS only) ---------------- */
.orbit-spin {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  animation: orbit-spin linear infinite;
  will-change: transform;
}

.orbit-slot {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  transform: rotate(var(--angle)) translateX(var(--radius)) rotate(calc(-1 * var(--angle)));
}

.orbit-upright {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  animation: orbit-spin linear infinite;
  will-change: transform;
}

@keyframes orbit-spin {
  to { transform: rotate(360deg); }
}

/* ---------------- Shared node ---------------- */
.orbit-node,
.meep-node {
  position: absolute;
  transform: translate(-50%, -50%);
  color: #fff;
  cursor: pointer;
}

/* ---------------- Orbit node ---------------- */
.orbit-node {
  left: 0;
  top: 0;
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
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.06), transparent 45%),
    #0e0e0e;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 30px rgba(0, 0, 0, 0.35);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.orbit-node:hover {
  background:
    radial-gradient(circle at 35% 30%, rgba(184, 155, 94, 0.14), transparent 50%),
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

/* ---------------- Node icon ---------------- */
.node-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.015));
  color: #aaa;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 5px 15px rgba(0, 0, 0, 0.25);
  transition: color 0.2s ease, transform 0.2s ease;
}

.orbit-node:hover .node-icon {
  color: #d4b56a;
  border-color: rgba(184, 155, 94, 0.35);
  background: linear-gradient(145deg, rgba(184, 155, 94, 0.14), rgba(184, 155, 94, 0.03));
  transform: translateY(-2px);
}

/* ---------------- Node text ---------------- */
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

/* ---------------- Center node ---------------- */
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
    radial-gradient(circle at 35% 25%, rgba(184, 155, 94, 0.16), transparent 50%),
    radial-gradient(circle, #17140e, #0d0d0d 70%);
  box-shadow:
    0 0 0 1px rgba(184, 155, 94, 0.06),
    0 0 35px rgba(184, 155, 94, 0.1),
    0 20px 50px rgba(0, 0, 0, 0.45);
  transition: border-color 0.2s ease, transform 0.2s ease;
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

/* ================================================================== */
/* Onboarding overlay                                                  */
/* ================================================================== */

.onboarding {
  position: fixed;
  inset: 0;
  z-index: 200;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  padding: 48px 24px;

  background: rgba(5, 5, 5, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  cursor: pointer;
  user-select: none;
  touch-action: none;
}

.onboarding::before {
  content: '';
  position: absolute;
  inset: 0;

  background: radial-gradient(
    circle at center,
    transparent 0%,
    rgba(0, 0, 0, 0.4) 70%,
    rgba(0, 0, 0, 0.7) 100%
  );

  pointer-events: none;
}

.onboarding-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
}

.onboarding-content {
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 44px;
}

.onboarding-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  max-width: 340px;
  text-align: center;
}

.onboarding-title {
  margin: 0;

  color: #fff;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.onboarding-subtitle {
  margin: 0;

  color: #8a8a8a;
  font-size: 13px;
  line-height: 1.5;
}

.onboarding-footer {
  position: relative;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.onboarding-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.onboarding-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;
  background: #2f2f2f;

  transition:
    width 0.25s ease,
    background 0.25s ease;
}

.onboarding-dot.is-done {
  background: #555;
}

.onboarding-dot.is-active {
  width: 18px;
  border-radius: 999px;
  background: #b89b5e;
}

.onboarding-hint {
  margin: 0;

  color: #666;
  font-size: 11px;
  letter-spacing: 0.02em;

  animation: onboarding-hint-pulse 2s ease-in-out infinite;
}

@keyframes onboarding-hint-pulse {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1; }
}

/* ================================================================== */
/* Gesture stage                                                       */
/* ================================================================== */

.gesture {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 260px;
  height: 180px;
}

.gesture-track {
  position: absolute;
  left: 50%;
  top: 50%;

  width: 200px;
  height: 1px;
  margin: -0.5px 0 0 -100px;

  background-image: linear-gradient(
    to right,
    transparent 0%,
    rgba(184, 155, 94, 0.35) 15%,
    rgba(184, 155, 94, 0.35) 85%,
    transparent 100%
  );

  transform: rotate(30deg);
  border-radius: 1px;
  pointer-events: none;
}

.finger {
  position: absolute;
  left: 50%;
  top: 50%;

  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;

  border-radius: 50%;

  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.55), transparent 45%),
    radial-gradient(circle at center, #d4b56a, #a08348);

  box-shadow:
    0 0 22px rgba(184, 155, 94, 0.55),
    0 0 0 6px rgba(184, 155, 94, 0.14),
    0 0 0 14px rgba(184, 155, 94, 0.05);

  will-change: transform, opacity;
}

.finger-trail {
  opacity: 0.4;
  filter: blur(1.5px);
  animation-fill-mode: backwards;
}

.finger-trail-1 { animation-delay: 0.10s; }
.finger-trail-2 { animation-delay: 0.20s; opacity: 0.22; }
.finger-trail-3 { animation-delay: 0.30s; opacity: 0.10; }

.gesture-drag .finger {
  animation: gesture-drag-move 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes gesture-drag-move {
  0%, 12%   { transform: translate(-70px, -40px); }
  50%, 62%  { transform: translate(70px, 40px); }
  96%, 100% { transform: translate(-70px, -40px); }
}

.gesture-pinch .gesture-track {
  width: 160px;
  margin-left: -80px;
}

.finger-pinch-a {
  animation: gesture-pinch-a 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.finger-pinch-b {
  animation: gesture-pinch-b 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes gesture-pinch-a {
  0%, 15%   { transform: translate(-60px, -34px); }
  42%, 58%  { transform: translate(-12px, -7px); }
  85%, 100% { transform: translate(-60px, -34px); }
}

@keyframes gesture-pinch-b {
  0%, 15%   { transform: translate(60px, 34px); }
  42%, 58%  { transform: translate(12px, 7px); }
  85%, 100% { transform: translate(60px, 34px); }
}

.gesture-scroll {
  flex-direction: column;
  gap: 18px;
}

.scroll-mouse {
  position: relative;

  width: 40px;
  height: 64px;

  border: 2px solid rgba(184, 155, 94, 0.55);
  border-radius: 20px;
  background: rgba(184, 155, 94, 0.05);

  box-shadow:
    0 0 24px rgba(184, 155, 94, 0.15),
    inset 0 0 12px rgba(184, 155, 94, 0.06);
}

.scroll-wheel {
  position: absolute;
  top: 10px;
  left: 50%;

  width: 4px;
  height: 12px;
  margin-left: -2px;

  border-radius: 2px;
  background: #d4b56a;

  box-shadow: 0 0 8px rgba(212, 181, 106, 0.9);

  animation: scroll-wheel 1.8s ease-in-out infinite;
}

@keyframes scroll-wheel {
  0%, 100% { transform: translateY(0);    opacity: 1; }
  50%      { transform: translateY(14px); opacity: 0.55; }
}

.scroll-chevrons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  opacity: 0.5;
}

.chev {
  width: 10px;
  height: 10px;

  border-right: 2px solid #b89b5e;
  border-bottom: 2px solid #b89b5e;
}

.chev-up   { transform: rotate(-135deg); }
.chev-down { transform: rotate(45deg); }

.onboarding-fade-enter-active,
.onboarding-fade-leave-active {
  transition: opacity 0.35s ease;
}

.onboarding-fade-enter-from,
.onboarding-fade-leave-to {
  opacity: 0;
}

.onboarding-step-enter-active,
.onboarding-step-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.onboarding-step-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.onboarding-step-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ---------------- Reduced motion ---------------- */
@media (prefers-reduced-motion: reduce) {
  .orbit-spin,
  .orbit-upright,
  .world-glow,
  .onboarding-hint {
    animation: none;
  }

  .gesture-drag .finger,
  .finger-trail,
  .finger-pinch-a,
  .finger-pinch-b,
  .scroll-wheel {
    animation: none;
  }

  .gesture-drag .finger       { transform: translate(0, 0); }
  .finger-trail               { opacity: 0; }
  .finger-pinch-a             { transform: translate(-40px, -23px); }
  .finger-pinch-b             { transform: translate(40px, 23px); }
  .scroll-wheel               { transform: translateY(7px); }

  .orbit-node,
  .meep-node,
  .nav-item,
  .orbit-ring,
  .orbit-label,
  .onboarding-dot,
  .onboarding-fade-enter-active,
  .onboarding-fade-leave-active,
  .onboarding-step-enter-active,
  .onboarding-step-leave-active {
    transition: none;
  }
}

/* ---------------- Small screens ---------------- */
@media (max-width: 700px) {
  .floating-nav {
    max-width: calc(100vw - 24px);
    overflow-x: auto;
    justify-content: center;
    left: 12px;
    right: 12px;
    transform: none;

    /* Prevent the overflow-x scrollbar from clashing with the border. */
    scrollbar-width: none;
  }

  .floating-nav::-webkit-scrollbar {
    display: none;
  }

  .nav-item,
  .nav-group {
    flex-shrink: 0;
  }

  /* On mobile the panel breaks out of the nav's bounds and spans the
   * full viewport width, anchored below the nav bar. This avoids the
   * panel being clipped by the nav's overflow-x: auto and gives
   * touch targets more room. */
  .nav-panel {
    position: fixed;
    top: 66px; /* nav height (18 top + 40) + 8 gap */
    left: 12px;
    right: 12px;
    transform: none;

    min-width: 0;
  }

  .nav-panel-enter-from,
  .nav-panel-leave-to {
    transform: translateY(-4px);
  }

  .nav-panel-item {
    padding: 11px 12px;
    font-size: 12px;
  }

  .onboarding {
    padding: 40px 20px;
  }

  .onboarding-title {
    font-size: 19px;
  }

  .onboarding-subtitle {
    font-size: 12px;
  }

  .orbit-label-text {
    font-size: 20px;
    letter-spacing: 0.15em;
  }
}
</style>