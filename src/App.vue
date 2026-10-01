<script setup lang="ts">
import SpotifyWidget from './components/SpotifyWidget.vue'
import GithubWidget from './components/GithubWidget.vue'
import MessageWidget from './components/MessageWidget.vue'
</script>

<template>
  <main class="page">
    <h1>Meep</h1>

    <div class="widget-grid">
      <SpotifyWidget />
      <MessageWidget />
      <GithubWidget />
      <MessageWidget />

      <!-- Future widgets -->
      <!-- <ProfileWidget /> -->
      <!-- <ProjectsWidget /> -->
    </div>
  </main>
</template>

<style>
.page {
  width: min(1300px, 100%);
  margin: 0 auto;
  padding: 40px 24px;
  box-sizing: border-box;
}

.page h1 {
  margin: 0 0 24px;
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
@media (max-width: 700px) {
  .widget-grid {
    grid-template-columns: 1fr;
  }
}
</style>
