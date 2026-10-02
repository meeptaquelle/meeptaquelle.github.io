<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import WidgetWindow from './components/WidgetWindow.vue'

import GithubWidget from './components/GithubWidget.vue'
import SpotifyWidget from './components/SpotifyWidget.vue'
import SpotifyArtistWidget from './components/SpotifyArtistWidget.vue'
import MessageWidget from './components/MessageWidget.vue'

interface WidgetNode {
  id: string
  label: string
  description: string
  icon: string
  component: any
}

const layers: WidgetNode[][] = [
  [
    {
      id: 'github',
      label: 'GitHub',
      description: 'My code and projects',
      icon: '⌘',
      component: GithubWidget,
    },
    {
      id: 'tracks',
      label: 'Top Tracks',
      description: 'What I listen to',
      icon: '♫',
      component: SpotifyWidget,
    },
    {
      id: 'artists',
      label: 'Top Artists',
      description: 'Artists on repeat',
      icon: '◉',
      component: SpotifyArtistWidget,
    },
  ],

  [
    {
      id: 'projects',
      label: 'Projects',
      description: 'Things I have built',
      icon: '◇',
      component: null,
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Leave me a message',
      icon: '□',
      component: MessageWidget,
    },
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: '△',
      component: null,
    },
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: '△',
      component: null,
    },
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: '△',
      component: null,
    },
  ],
  [
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: '△',
      component: null,
    },
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: '△',
      component: null,
    },
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: '△',
      component: null,
    },
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: '△',
      component: null,
    },
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: '△',
      component: null,
    },
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: '△',
      component: null,
    },
    {
      id: 'stack',
      label: 'Stack',
      description: 'Tools I work with',
      icon: '△',
      component: null,
    },
  ],
]

const camera = reactive({
  x: 0,
  y: 0,
})

const activeWindow = ref<string | null>(null)

const isDragging = ref(false)

let startX = 0
let startY = 0
let startCameraX = 0
let startCameraY = 0

const activeNode = computed(() => {
  if (!activeWindow.value) {
    return null
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

const windowTitle = computed(() => {
  if (activeWindow.value === 'meep') {
    return 'Introduction'
  }

  return activeNode.value?.label ?? ''
})

function openWindow(id: string) {
  activeWindow.value = id
}

function closeWindow() {
  activeWindow.value = null
}

function startDrag(event: MouseEvent) {
  isDragging.value = true

  startX = event.clientX
  startY = event.clientY

  startCameraX = camera.x
  startCameraY = camera.y
}

function drag(event: MouseEvent) {
  if (!isDragging.value) {
    return
  }

  const dx = event.clientX - startX
  const dy = event.clientY - startY

  camera.x = startCameraX + dx
  camera.y = startCameraY + dy
}

function endDrag() {
  isDragging.value = false
}

function layerRadius(layerIndex: number) {
  const baseRadius = 280
  const radiusStep = 220

  return baseRadius + layerIndex * radiusStep
}
function layerOffset(layerIndex: number) {
  const baseOffset = -90
  const rotationPerLayer = 45

  return baseOffset + layerIndex * rotationPerLayer
}

function nodePosition(layerIndex: number, nodeIndex: number) {
  const layer = layers[layerIndex]

  const radius = layerRadius(layerIndex)

  const angleStep = 360 / layer.length
  const offset = layerOffset(layerIndex)

  const angle = offset + nodeIndex * angleStep

  const radians = (angle * Math.PI) / 180

  return {
    left: `${radius * Math.cos(radians)}px`,
    top: `${radius * Math.sin(radians)}px`,
  }
}
</script>

<template>
  <main
    class="canvas-viewport"
    :class="{ dragging: isDragging }"
    @mousedown="startDrag"
    @mousemove="drag"
    @mouseup="endDrag"
    @mouseleave="endDrag"
    @click="closeWindow"
  >
    <!-- World -->
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

      <!-- Orbit nodes -->
      <template v-for="(layer, layerIndex) in layers" :key="layerIndex">
        <button
          v-for="(node, nodeIndex) in layer"
          :key="node.id"
          class="orbit-node"
          :class="{
            active: activeWindow === node.id,
          }"
          :style="nodePosition(layerIndex, nodeIndex)"
          @mousedown.stop
          @click.stop="openWindow(node.id)"
        >
          <div class="node-icon">
            {{ node.icon }}
          </div>

          <strong class="node-title">
            {{ node.label }}
          </strong>

          <span class="node-description">
            {{ node.description }}
          </span>
        </button>
      </template>

      <!-- Center -->
      <button
        class="meep-node"
        :class="{
          active: activeWindow === 'meep',
        }"
        @mousedown.stop
        @click.stop="openWindow('meep')"
      >
        <strong>Meep</strong>
        <span>Introduction</span>
      </button>
    </div>

    <!-- Active window -->
    <WidgetWindow v-if="activeWindow" :title="windowTitle" @close="closeWindow">
      <component :is="activeWidget" />
    </WidgetWindow>
  </main>
</template>

<style scoped>
.canvas-viewport {
  position: fixed;
  inset: 0;

  overflow: hidden;

  background: #0a0a0a;
  color: #fff;

  cursor: grab;

  user-select: none;
}

.canvas-viewport.dragging {
  cursor: grabbing;
}

.canvas-world {
  position: absolute;

  left: 0;
  top: 0;

  width: 0;
  height: 0;

  transform-origin: 0 0;
}

.orbit-ring {
  position: absolute;

  left: 0;
  top: 0;

  transform: translate(-50%, -50%);

  border: 1px dashed #1d1d1d;
  border-radius: 50%;

  pointer-events: none;
}

.orbit-node,
.meep-node {
  position: absolute;

  transform: translate(-50%, -50%);

  border: 1px solid #333;

  background: #111;
  color: #fff;

  cursor: pointer;
}

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

  border: 1px solid #2a2a2a;
  border-radius: 50%;

  background: #0e0e0e;
  color: #fff;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;
}

.orbit-node:hover {
  background: #151515;
  border-color: #555;

  transform: translate(-50%, -50%) scale(1.05);
}

.orbit-node.active {
  background: #1c1c1c;
  border-color: #777;
}

.node-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 4px;

  border: 1px solid #2a2a2a;
  border-radius: 12px;

  background: #181818;

  color: #aaa;

  font-size: 22px;
}

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

.meep-node {
  position: absolute;

  left: 0;
  top: 0;

  transform: translate(-50%, -50%);

  width: 150px;
  height: 150px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border: 1px solid #444;
  border-radius: 50%;

  background: #111;
  color: #fff;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.meep-node:hover,
.meep-node.active {
  background: #181818;
  border-color: #777;
}

.meep-node.active {
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
</style>
