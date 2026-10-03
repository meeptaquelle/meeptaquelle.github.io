<script setup lang="ts">
import api from '@/services/api'
import { onMounted, ref } from 'vue'

interface SpotifyTrack {
  name: string
  artist: string
  album: string
  image: string
  url: string
}

const tracks = ref<SpotifyTrack[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadTracks(): Promise<void> {
  try {
    const response = await api.get('/api/spotify/top-tracks')

    tracks.value = response.data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch Spotify data'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTracks()
})
</script>
<template>
  <section class="spotify-widget">
    <h2>My Top Tracks</h2>
    <p class="period">Last 4 weeks</p>

    <p v-if="loading">Loading Spotify...</p>

    <p v-else-if="error">
      {{ error }}
    </p>

    <a
      v-else
      v-for="(track, index) in tracks"
      :key="track.url"
      :href="track.url"
      target="_blank"
      rel="noopener noreferrer"
      class="track"
    >
      <span class="rank">
        {{ index + 1 }}
      </span>

      <img :src="track.image" :alt="track.album" />

      <div>
        <div class="track-name">
          {{ track.name }}
        </div>

        <div class="artist">
          {{ track.artist }}
        </div>
      </div>
    </a>
  </section>
</template>
<style scoped>
.spotify-widget {
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

.spotify-widget h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.period {
  margin: 4px 0 14px;
  color: #888;
  font-size: 12px;
}

.track {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 9px 0;
  border-top: 1px solid #222;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.track:first-of-type {
  border-top: none;
}

.rank {
  width: 16px;
  flex-shrink: 0;
  color: #777;
  font-size: 12px;
  text-align: center;
}

.track img {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 6px;
  object-fit: cover;
}

.track-name {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist {
  min-width: 0;
  margin-top: 3px;
  overflow: hidden;
  color: #888;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track:hover {
  background: #1a1a1a;
}
</style>
