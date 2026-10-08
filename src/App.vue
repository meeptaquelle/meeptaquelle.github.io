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
/*                                                                     */
/* Two-step full-screen overlay. Each step demonstrates one gesture    */
/* using only CSS-animated geometric primitives (circles, rectangles,  */
/* gradients). Click anywhere to advance or dismiss.                   */
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

/* Coarse pointer = touch device. Detected once at module init — the
 * onboarding is a one-shot, so no need to react to input device
 * changes mid-session. */
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
/*                                                                     */
/* The camera is a plain object, NOT reactive. Vue never re-renders    */
/* for camera movement; we write the transform straight to the DOM,    */
/* at most once per frame.                                             */
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

/* World-space half-extent of the navigable area. The outer node's edge
 * reaches 500 (ring radius) + 75 (node half) = 575 from origin; adding
 * ~325 of breathing room gives 900. Tweak to taste. */
const WORLD_BOUND = 600

const worldEl = ref<HTMLElement | null>(null)
const isDragging = ref(false) // only toggles on drag start/end

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

  // If a target zoom was given, resolve it once and clamp against the
  // final zoom (not the current one) so the boundary check matches where
  // the camera will actually land.
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
    // ease in/out quad
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

// Baselines for a single-pointer pan
let lastX = 0
let lastY = 0

// Baselines for a two-pointer pinch
let prevDist = 0
let prevMid = { x: 0, y: 0 }

function viewportCenter() {
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))
}

/* Clamp the camera so the world origin can't travel further than
 * WORLD_BOUND (in world units) from the viewport center. Expressed in
 * screen pixels at the current zoom, so the limit scales correctly when
 * zooming in or out. */
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

  /* --- one finger: pan ------------------------------------------- */
  if (pointers.size === 1) {
    camera.x += event.clientX - lastX
    camera.y += event.clientY - lastY
    lastX = event.clientX
    lastY = event.clientY
    clampCamera()
    scheduleCamera()
    return
  }

  /* --- two fingers: pinch + pan ---------------------------------- */
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y)
    const mid = { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 }

    if (prevDist > 0 && dist > 0) {
      const newZoom = clampZoom(camera.zoom * (dist / prevDist))

      // The world point that was under the previous midpoint
      const c = viewportCenter()
      const wx = (prevMid.x - c.x - camera.x) / camera.zoom
      const wy = (prevMid.y - c.y - camera.y) / camera.zoom

      camera.zoom = newZoom
      // Re-place that same world point under the new midpoint
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
    // 2 → 1: re-baseline the pan to the surviving finger so it doesn't jump
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
/* Orbit                                                               */
/*                                                                     */
/* The rotation itself is a pure CSS animation (compositor only).      */
/* JS only computes the current angle once, when the user navigates.   */
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

/* When the user is zoomed out past this, navigating snaps them in to
 * ZOOM_IN_TARGET so the focused node is readable. Below the threshold
 * the node card is too small to read its title comfortably. */
const ZOOM_IN_THRESHOLD = 0.6
const ZOOM_OUT_THRESHOLD = 1.3
const ZOOM_TARGET = 1.25

function navigateToWidget(id: string) {
  // Snap into the comfort band from either side:
  //   below 0.6  → zoom in to 1.25
  //   above 1.3  → zoom back to 1.25
  //   in between → leave alone
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

const navItems = [
  { id: 'meep', label: 'Home' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'github', label: 'GitHub' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'artists', label: 'Artists' },
  { id: 'messages', label: 'Messages' },
  { id: 'devlog', label: 'Devlog' },
  { id: 'personality', label: 'Personality' },
]

/* ------------------------------------------------------------------ */
/* Keyboard                                                            */
/* ------------------------------------------------------------------ */

function handleKeydown(event: KeyboardEvent) {
  // Onboarding captures Escape and Enter/Space to advance
  if (showOnboarding.value) {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      advanceOnboarding()
    }
    return
  }

  if (event.key === 'Escape') {
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
    @pointermove="drag"
    @pointerup="endDrag"
    @pointercancel="endDrag"
  >
    <!-- Floating navigation (attached to viewport, not the world) -->
    <nav class="floating-nav" @pointerdown.stop @click.stop>
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="nav-item"
        @click="navigateToWidget(item.id)"
      >
        {{ item.label }}
      </button>
    </nav>

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
        :style="{
          width: `${layerRadius(layerIndex) * 2}px`,
          height: `${layerRadius(layerIndex) * 2}px`,
        }"
      ></div>

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

    <!-- ---------------------------------------------------------------- -->
    <!-- Onboarding overlay                                                -->
    <!-- ---------------------------------------------------------------- -->
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

              <!-- -------- Step 1: drag -------- -->
              <div v-if="stepContent.gesture === 'drag'" class="gesture gesture-drag">
                <span class="gesture-track"></span>
                <span class="finger finger-trail finger-trail-3"></span>
                <span class="finger finger-trail finger-trail-2"></span>
                <span class="finger finger-trail finger-trail-1"></span>
                <span class="finger"></span>
              </div>

              <!-- -------- Step 2a: pinch -------- -->
              <div v-else-if="stepContent.gesture === 'pinch'" class="gesture gesture-pinch">
                <span class="gesture-track"></span>
                <span class="finger finger-pinch-a"></span>
                <span class="finger finger-pinch-b"></span>
              </div>

              <!-- -------- Step 2b: scroll -------- -->
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
/*
 * Children of .canvas-world, so they inherit its transform and travel
 * with the world. Anchored to the world origin (the center node) — when
 * the camera pans, they pan with the scene rather than sitting flat on
 * the viewport.
 *
 * Centering is done via the independent `translate` property, leaving
 * `transform` free for the pulsing animation. They compose cleanly
 * without re-writing the centering in every keyframe.
 */
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
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-item:hover {
  background: #1c1c1c;
  color: #fff;
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

/* Soft vignette so the edge of the screen feels dark, focused on the
 * gesture in the middle. */
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

/* -------- Footer: dots + hint -------- */

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
/* Gesture stage — all geometric primitives, no assets                 */
/* ================================================================== */

.gesture {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 260px;
  height: 180px;
}

/* Dashed track — subtle line that the finger travels along. */
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

/* -------- Finger primitive -------- */

/*
 * Golden touch point: a filled circle with a soft inner highlight and
 * three concentric halos rendered via box-shadow. Reused for drag
 * (with trailing ghosts), pinch (two fingers), and could be reused
 * anywhere else a touch indicator is needed.
 */
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

/* -------- Drag demo -------- */

.finger-trail {
  /* Reduced and blurred to read as a motion streak. */
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

/* -------- Pinch demo -------- */

.gesture-pinch .gesture-track {
  /* Track sits between the two fingers */
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

/* -------- Scroll demo -------- */

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

/* -------- Step transition -------- */

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

  /* Static poses so the gesture is still readable */
  .gesture-drag .finger       { transform: translate(0, 0); }
  .finger-trail               { opacity: 0; }
  .finger-pinch-a             { transform: translate(-40px, -23px); }
  .finger-pinch-b             { transform: translate(40px, 23px); }
  .scroll-wheel               { transform: translateY(7px); }

  .orbit-node,
  .meep-node,
  .nav-item,
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
    justify-content: flex-start;
    left: 12px;
    right: 12px;
    transform: none;
  }

  .nav-item {
    flex-shrink: 0;
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
}
</style>