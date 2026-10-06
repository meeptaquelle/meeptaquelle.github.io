<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import api from '@/services/api'

interface Message {
  id: number
  name: string
  message: string
  gif_url: string
  created_at: string
}

/* Mirrors the backend allowlist. Kept in sync manually — if you add a
 * host on the Go side, add it here too, otherwise users get a confusing
 * "preview unavailable" on a URL the server would have accepted. */
const ALLOWED_GIF_HOSTS = new Set([
  'media.tenor.com',
  'c.tenor.com',
  'media.giphy.com',
  'i.giphy.com',
  'media0.giphy.com',
  'media1.giphy.com',
  'media2.giphy.com',
  'media3.giphy.com',
  'media4.giphy.com',
])

function looksLikeGifUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return false
    return ALLOWED_GIF_HOSTS.has(u.hostname.toLowerCase())
  } catch {
    return false
  }
}

const messages = ref<Message[]>([])
const name = ref('Anonymous')
const message = ref('')
const gifUrl = ref('')
const loading = ref(true)
const sending = ref(false)
const error = ref<string | null>(null)

// GIF UI state
const showGifInput = ref(false)
const gifFailed = ref(false)

// The full URL a preview <img> should point at, or empty string.
const gifPreviewSrc = computed(() => {
  const u = gifUrl.value.trim()
  return u || ''
})

// Same condition the send button uses, so we can't be "enabled" but send nothing.
const canSend = computed(() => {
  if (sending.value) return false
  return message.value.trim() !== '' || gifUrl.value.trim() !== ''
})

// Any time the URL changes, the previously-loaded image is invalid.
watch(gifUrl, () => {
  gifFailed.value = false
})

async function loadMessages(): Promise<void> {
  try {
    const response = await api.get('/api/messages')
    messages.value = response.data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch messages'
  } finally {
    loading.value = false
  }
}

async function sendMessage(): Promise<void> {
  if (!canSend.value) return

  sending.value = true
  error.value = null

  try {
    const response = await api.post('/api/messages', {
      name: name.value.trim() || 'Anonymous',
      message: message.value.trim(),
      gif_url: gifUrl.value.trim(),
    })

    messages.value.push(response.data as Message)

    // Reset the form
    message.value = ''
    gifUrl.value = ''
    gifFailed.value = false
    showGifInput.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send message'
  } finally {
    sending.value = false
  }
}

function toggleGifInput(): void {
  showGifInput.value = !showGifInput.value
  if (!showGifInput.value) {
    gifUrl.value = ''
    gifFailed.value = false
  }
}

function removeGif(): void {
  gifUrl.value = ''
  gifFailed.value = false
}

onMounted(() => {
  loadMessages()
})
</script>

<template>
  <section class="message-widget">
    <h2>Messages</h2>

    <div class="messages">
      <p v-if="loading">Loading messages...</p>

      <p v-else-if="error">{{ error }}</p>

      <p v-else-if="messages.length === 0">No messages yet.</p>

      <div v-for="item in messages" :key="item.id" class="message">
        <div class="message-name">{{ item.name }}</div>

        <div class="message-body">
          <div v-if="item.message" class="message-content">
            {{ item.message }}
          </div>

          <img
            v-if="item.gif_url"
            :src="item.gif_url"
            class="message-gif"
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
          />
        </div>
      </div>
    </div>

    <form class="message-form" @submit.prevent="sendMessage">
      <label>
        Name

        <input v-model="name" type="text" placeholder="Anonymous" maxlength="50" />
      </label>

      <label>
        Message

        <textarea
          v-model="message"
          placeholder="Say something..."
          maxlength="500"
          rows="3"
        />
      </label>

      <!-- Optional GIF URL input, revealed by the GIF toggle below -->
      <div v-if="showGifInput" class="gif-field">
        <input
          v-model="gifUrl"
          type="url"
          placeholder="Paste a direct GIF link (Tenor or Giphy)"
          maxlength="500"
          autocomplete="off"
          spellcheck="false"
          @keydown.enter.prevent
        />

        <p v-if="gifUrl.trim() && !looksLikeGifUrl(gifUrl.trim())" class="gif-hint gif-hint--error">
          Paste a direct media link, not a page URL. On Tenor: open a GIF →
          right-click → "Copy image address".
        </p>
      </div>

      <!-- Live preview of whatever URL is currently entered -->
      <div v-if="gifPreviewSrc" class="gif-preview" :class="{ 'is-broken': gifFailed }">
        <img
          :src="gifPreviewSrc"
          alt="GIF preview"
          referrerpolicy="no-referrer"
          @load="gifFailed = false"
          @error="gifFailed = true"
        />
        <button type="button" class="gif-remove" @click="removeGif" aria-label="Remove GIF">
          ×
        </button>
        <p v-if="gifFailed" class="gif-hint gif-hint--error">
          Preview unavailable — check the URL.
        </p>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="gif-toggle"
          :class="{ 'is-active': showGifInput }"
          @click="toggleGifInput"
        >
          GIF
        </button>

        <button type="submit" :disabled="!canSend">
          {{ sending ? 'Sending...' : 'Send' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.message-widget {
  width: 100%;
  max-width: none;
  min-width: 0;
  max-height: 500px;
  overflow: scroll;
  scrollbar-width: thin;
  scrollbar-color: #444 transparent;

  box-sizing: border-box;
  padding: 16px;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  background: #111;
  color: #fff;
}
.message-widget h2 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 12px;

  height: 200px;
  overflow-y: auto;

  margin-bottom: 20px;
  padding-right: 4px;

  scrollbar-width: thin;
  scrollbar-color: #444 transparent;
}

.message {
  animation: message-enter 0.2s ease-out;
}

.message-name {
  margin-bottom: 4px;
  color: #aaa;
  font-size: 12px;
}

/* Wrapper so a message can hold text, a GIF, or both, each with the
   right spacing without either one being forced into the other's bubble. */
.message-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.message-content {
  width: fit-content;
  max-width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  background: #1c1c1c;
  font-size: 13px;
  line-height: 1.4;
  overflow-wrap: break-word;
}

.message-gif {
  display: block;
  max-width: 100%;
  max-height: 220px;
  border-radius: 10px;
  background: #1c1c1c;
}

.message-form {
  padding-top: 16px;
  border-top: 1px solid #2a2a2a;
}

.message-form label {
  display: block;
  margin-bottom: 12px;
  color: #aaa;
  font-size: 12px;
}

.message-form input,
.message-form textarea {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 9px 10px;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  background: #181818;
  color: #fff;
  font: inherit;
  box-sizing: border-box;
  outline: none;
}

.message-form input:focus,
.message-form textarea:focus {
  border-color: #555;
}

.message-form textarea {
  resize: vertical;
}

/* --- GIF field --------------------------------------------------- */

.gif-field {
  margin-bottom: 12px;
}

.gif-field input {
  margin-top: 0;
}

.gif-hint {
  margin: 6px 2px 0;
  color: #777;
  font-size: 11px;
  line-height: 1.4;
}

.gif-hint--error {
  color: #d47a7a;
}

/* --- GIF preview ------------------------------------------------- */

.gif-preview {
  position: relative;
  margin-bottom: 12px;
  padding: 8px;
  border: 1px solid #2a2a2a;
  border-radius: 10px;
  background: #181818;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.gif-preview img {
  display: block;
  max-width: 100%;
  max-height: 180px;
  border-radius: 6px;
}

/* Hide the broken-image icon when the load fails; the hint below takes
   its place. */
.gif-preview.is-broken img {
  display: none;
}

.gif-preview.is-broken .gif-remove {
  top: 6px;
  right: 6px;
}

.gif-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gif-remove:hover {
  background: rgba(0, 0, 0, 0.9);
}

/* --- Actions row ------------------------------------------------- */

.form-actions {
  display: flex;
  gap: 8px;
}

.form-actions button {
  padding: 9px 12px;
  border: 0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.form-actions button[type='submit'] {
  flex: 1;
  background: #fff;
  color: #111;
}

.form-actions button[type='submit']:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gif-toggle {
  background: #1c1c1c;
  color: #aaa;
  border: 1px solid #2a2a2a !important;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.gif-toggle:hover {
  background: #242424;
  color: #fff;
}

.gif-toggle.is-active {
  background: #b89b5e;
  color: #111;
  border-color: #b89b5e !important;
}

@keyframes message-enter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>