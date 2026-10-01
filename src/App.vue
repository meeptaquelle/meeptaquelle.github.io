<script setup lang="ts">
import SpotifyWidget from './components/SpotifyWidget.vue'
import GithubWidget from './components/GithubWidget.vue'
import MessageWidget from './components/MessageWidget.vue'
import SpotifyArtistWidget from './components/SpotifyArtistWidget.vue'
</script>

<template>
  <main class="page">
    <h1>Meep</h1>

    <div class="widget-grid">
      <SpotifyWidget />
      <SpotifyArtistWidget />
      <GithubWidget />
      <MessageWidget />

      <!-- Future widgets -->
      <!-- <ProfileWidget /> -->
      <!-- <ProjectsWidget /> -->
    </div>
  </main>
</template>

<style>
.widget-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1200px) {
  .widget-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .widget-grid {
    grid-template-columns: 1fr;
  }
}
</style>
