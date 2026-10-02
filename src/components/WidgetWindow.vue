<script setup lang="ts">
defineProps<{
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="widget-window" @mousedown.stop @click.stop>
    <header class="window-header">
      <h2>{{ title }}</h2>

      <button class="window-close" type="button" @click="emit('close')">×</button>
    </header>

    <div class="window-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.widget-window {
  position: fixed;
  top: 50%;
  left: 50%;

  width: min(700px, calc(100vw - 40px));
  max-height: calc(100vh - 40px);

  transform: translate(-50%, -50%);

  box-sizing: border-box;

  border: 1px solid #333;
  border-radius: 16px;

  background: #111;
  color: #fff;

  overflow: hidden;

  z-index: 100;
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 14px 16px;

  border-bottom: 1px solid #222;
}

.window-header h2 {
  margin: 0;

  font-size: 15px;
  font-weight: 600;
}

.window-close {
  width: 28px;
  height: 28px;

  border: 0;
  border-radius: 50%;

  background: #1c1c1c;
  color: #aaa;

  font-size: 18px;
  line-height: 1;

  cursor: pointer;
}

.window-close:hover {
  background: #2a2a2a;
  color: #fff;
}

.window-content {
  max-height: calc(100vh - 100px);

  overflow-y: auto;
}
</style>
