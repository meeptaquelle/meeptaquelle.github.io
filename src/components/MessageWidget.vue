<script setup lang="ts">
import { onMounted, ref } from 'vue'

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
    const response = await fetch('http://127.0.0.1:8080/api/messages')

    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }

    messages.value = await response.json()
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
    const response = await fetch('http://127.0.0.1:8080/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.value.trim() || 'Anonymous',
        message: message.value.trim(),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    const createdMessage: Message = await response.json()

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
  max-width: 700px;
  padding: 24px;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  background: #111;
  color: #fff;
  box-sizing: border-box;
}

.message-widget h2 {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 600;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 24px;
}

.message {
  animation: message-enter 0.2s ease-out;
}

.message-name {
  margin-bottom: 5px;
  color: #aaa;
  font-size: 13px;
}

.message-content {
  width: fit-content;
  max-width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  background: #1c1c1c;
  font-size: 14px;
  line-height: 1.4;
  overflow-wrap: break-word;
}

.message-form {
  padding-top: 20px;
  border-top: 1px solid #2a2a2a;
}

.message-form label {
  display: block;
  margin-bottom: 14px;
  color: #aaa;
  font-size: 13px;
}

.message-form input,
.message-form textarea {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 10px 12px;
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
  padding: 10px;
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
