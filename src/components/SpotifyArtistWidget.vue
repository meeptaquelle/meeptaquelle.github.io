<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface SpotifyArtist {
  name: string
  image: string
  url: string
}

const artists = ref<SpotifyArtist[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadArtists(): Promise<void> {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/spotify/top-artists')

    if (!response.ok) {
      throw new Error('Failed to fetch Spotify artists')
    }

    artists.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch Spotify artists'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArtists()
})
</script>

<template>
  <section class="spotify-artists-widget">
    <div class="widget-header">
      <div>
        <h2>Top Artists</h2>
        <span>Past 6 months</span>
      </div>
    </div>

    <div v-if="loading" class="state">Loading...</div>

    <div v-else-if="error" class="state">
      {{ error }}
    </div>

    <div v-else class="artist-grid">
      <a
        v-for="artist in artists"
        :key="artist.url"
        :href="artist.url"
        target="_blank"
        rel="noopener noreferrer"
        class="artist-card"
      >
        <img v-if="artist.image" :src="artist.image" :alt="artist.name" class="artist-image" />

        <div class="artist-name">
          {{ artist.name }}
        </div>
      </a>
    </div>

    <div class="spotify-attribution">Data from Spotify</div>
  </section>
</template>

<style scoped>
.spotify-artists-widget {
  width: 100%;
  max-width: none;
  min-width: 0;
  max-height: 500px;
  overflow-y: auto;

  box-sizing: border-box;
  padding: 16px;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  background: #111;
  color: #fff;
  scrollbar-width: thin;
  scrollbar-color: #444 transparent;
}

.widget-header {
  margin-bottom: 14px;
}

.widget-header h2 {
  margin: 0;
  font-size: 18px;
}

.widget-header span {
  display: block;
  margin-top: 4px;
  color: #777;
  font-size: 11px;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.artist-card {
  display: block;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.artist-image {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
}

.artist-name {
  margin-top: 6px;
  overflow: hidden;
  color: #ccc;
  font-size: 11px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist-card:hover .artist-name {
  color: #fff;
}

.state {
  color: #777;
  font-size: 12px;
}

.spotify-attribution {
  margin-top: 14px;
  color: #666;
  font-size: 10px;
}
</style>
