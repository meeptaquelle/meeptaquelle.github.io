
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '@/services/api'

interface DevlogCommit {
  sha: string
  message: string
  author: string
  date: string
  url: string
}

interface DevlogResponse {
  frontend: DevlogCommit[]
  backend: DevlogCommit[]
}

const frontendCommits = ref<DevlogCommit[]>([])
const backendCommits = ref<DevlogCommit[]>([])

const loading = ref(true)
const error = ref(false)

const fetchDevlog = async () => {
  loading.value = true
  error.value = false

  try {
    const response = await api.get<DevlogResponse>('/api/github/devlog')

    frontendCommits.value = response.data.frontend
    backendCommits.value = response.data.backend
  } catch (err) {
    console.error('Failed to fetch devlog:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  const commitDate = new Date(date)
  const now = new Date()

  const diff = now.getTime() - commitDate.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return commitDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const shortSha = (sha: string) => sha.slice(0, 7)

const cleanMessage = (message: string) => {
  return message.split('\n')[0]
}

onMounted(fetchDevlog)
</script>

<template>
  <div class="devlog-widget">
    <div class="devlog-header">
      <div>
        <h2>Devlog</h2>
        <p>Recent development activity.</p>
      </div>
    </div>

    <div v-if="loading" class="devlog-loading">
      Loading commits...
    </div>

    <div v-else-if="error" class="devlog-error">
      Failed to load development activity.
    </div>

    <div v-else class="devlog-columns">
      <!-- Frontend -->
      <section class="devlog-column">
        <div class="repo-header">
          <div class="repo-indicator"></div>

          <div>
            <h3>Frontend</h3>
            <span>meeptaquelle.github.io</span>
          </div>
        </div>

        <div v-if="frontendCommits.length" class="commit-list">
          <a
            v-for="commit in frontendCommits"
            :key="commit.sha"
            :href="commit.url"
            target="_blank"
            rel="noopener noreferrer"
            class="commit"
          >
            <div class="commit-dot"></div>

            <div class="commit-content">
              <div class="commit-message">
                {{ cleanMessage(commit.message) }}
              </div>

              <div class="commit-meta">
                <span>{{ shortSha(commit.sha) }}</span>
                <span>{{ formatDate(commit.date) }}</span>
              </div>
            </div>
          </a>
        </div>

        <div v-else class="empty-state">
          No commits found.
        </div>
      </section>

      <!-- Backend -->
      <section class="devlog-column">
        <div class="repo-header">
          <div class="repo-indicator"></div>

          <div>
            <h3>Backend</h3>
            <span>profile-backend</span>
          </div>
        </div>

        <div v-if="backendCommits.length" class="commit-list">
          <a
            v-for="commit in backendCommits"
            :key="commit.sha"
            :href="commit.url"
            target="_blank"
            rel="noopener noreferrer"
            class="commit"
          >
            <div class="commit-dot"></div>

            <div class="commit-content">
              <div class="commit-message">
                {{ cleanMessage(commit.message) }}
              </div>

              <div class="commit-meta">
                <span>{{ shortSha(commit.sha) }}</span>
                <span>{{ formatDate(commit.date) }}</span>
              </div>
            </div>
          </a>
        </div>

        <div v-else class="empty-state">
          No commits found.
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.devlog-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.devlog-header {
  padding-bottom: 18px;
}

.devlog-header h2 {
  margin: 0;
}

.devlog-header p {
  margin: 4px 0 0;
  opacity: 0.6;
}

.devlog-columns {
  flex: 1;
  min-height: 0;

  display: grid;
  grid-template-columns: 1fr 1fr;

  border-top: 1px solid var(--border-color);
}

.devlog-column {
  min-width: 0;
  overflow-y: auto;
  padding: 16px;
}

.devlog-column + .devlog-column {
  border-left: 1px solid var(--border-color);
}

.repo-header {
  display: flex;
  align-items: center;
  gap: 10px;

  margin-bottom: 14px;
}

.repo-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.repo-header h3 {
  margin: 0;
  font-size: 14px;
}

.repo-header span {
  display: block;
  margin-top: 2px;

  font-size: 11px;
  opacity: 0.5;
}

.commit-list {
  display: flex;
  flex-direction: column;
}

.commit {
  position: relative;

  display: flex;
  gap: 10px;

  padding: 10px 0;

  color: inherit;
  text-decoration: none;

  border-bottom: 1px solid var(--border-color);

  transition: opacity 0.15s ease;
}

.commit:hover {
  opacity: 0.65;
}

.commit-dot {
  width: 6px;
  height: 6px;

  margin-top: 6px;

  border: 1px solid currentColor;
  border-radius: 50%;

  flex-shrink: 0;
}

.commit-content {
  min-width: 0;
  flex: 1;
}

.commit-message {
  overflow: hidden;

  font-size: 13px;
  line-height: 1.4;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.commit-meta {
  display: flex;
  gap: 8px;

  margin-top: 4px;

  font-size: 10px;
  opacity: 0.45;
}

.devlog-loading,
.devlog-error,
.empty-state {
  padding: 20px 0;

  font-size: 12px;
  opacity: 0.5;
}

@media (max-width: 600px) {
  .devlog-columns {
    grid-template-columns: 1fr;
  }

  .devlog-column + .devlog-column {
    border-left: 0;
    border-top: 1px solid var(--border-color);
  }
}
</style>
