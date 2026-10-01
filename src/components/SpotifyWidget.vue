<script setup lang="ts">
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
    const response = await fetch('http://127.0.0.1:8080/api/spotify/top-tracks')

    if (!response.ok) {
      throw new Error('Failed to fetch Spotify data')
    }

    tracks.value = await response.json()
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
  max-width: 700px;
  box-sizing: border-box;
  padding: 24px;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  background: #111;
  color: #fff;
}

.spotify-widget h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.period {
  margin: 4px 0 20px;
  color: #888;
  font-size: 14px;
}

.track {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  border-top: 1px solid #222;
}

.track:first-of-type {
  border-top: none;
}

.rank {
  width: 20px;
  color: #777;
  font-size: 14px;
  text-align: center;
}

.track img {
  width: 52px;
  height: 52px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.track-name {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
}

.artist {
  margin-top: 4px;
  color: #888;
  font-size: 13px;
}

.track {
  cursor: pointer;
  transition: background 0.15s ease;
}

.track:hover {
  background: #1a1a1a;
}

.track-name,
.artist {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.track {
  color: inherit;
  text-decoration: none;
}
</style>
