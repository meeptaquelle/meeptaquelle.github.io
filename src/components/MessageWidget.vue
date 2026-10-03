<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '@/services/api'

interface Message {
  id: number
  name: string
  message: string
  created_at: string
}

const messages = ref<Message[]>([])
const name = ref('Anonymous')
const message = ref('')
const loading = ref(true)
const sending = ref(false)
const error = ref<string | null>(null)

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
  if (!message.value.trim() || sending.value) {
    return
  }

  sending.value = true
  error.value = null

  try {
    const response = await api.post('/api/messages', {
      name: name.value.trim() || 'Anonymous',
      message: message.value.trim(),
    })

    const createdMessage: Message = response.data

    messages.value.push(createdMessage)

    message.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send message'
  } finally {
    sending.value = false
  }
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

      <p v-else-if="error">
        {{ error }}
      </p>

      <p v-else-if="messages.length === 0">No messages yet.</p>

      <div v-for="item in messages" :key="item.id" class="message">
        <div class="message-name">
          {{ item.name }}
        </div>

        <div class="message-content">
          {{ item.message }}
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

        <textarea v-model="message" placeholder="Say something..." maxlength="500" rows="3" />
      </label>

      <button type="submit" :disabled="sending || !message.trim()">
        {{ sending ? 'Sending...' : 'Send' }}
      </button>
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

.message-form button {
  width: 100%;
  padding: 9px;
  border: 0;
  border-radius: 8px;
  background: #fff;
  color: #111;
  font-weight: 600;
  cursor: pointer;
}

.message-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
