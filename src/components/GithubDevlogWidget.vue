<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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

const totalCommits = computed(
  () => frontendCommits.value.length + backendCommits.value.length,
)

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
    <header class="devlog-header">
      <div class="devlog-heading">
        <h2>Devlog</h2>
        <p>Recent development activity.</p>
      </div>

      <div v-if="!loading && !error && totalCommits" class="devlog-stat">
        <span class="devlog-stat-value">{{ totalCommits }}</span>
        <span class="devlog-stat-label">
          {{ totalCommits === 1 ? 'commit' : 'commits' }}
        </span>
      </div>
    </header>

    <div v-if="loading" class="devlog-loading">
      Loading commits...
    </div>

    <div v-else-if="error" class="devlog-error">
      Failed to load development activity.
    </div>

    <div v-else class="devlog-columns">
      <!-- Frontend -->
      <section class="devlog-column devlog-column--frontend">
        <div class="repo-header">
          <span class="repo-indicator" />

          <div class="repo-meta">
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
            <span class="commit-dot" />

            <div class="commit-content">
              <div class="commit-message">
                {{ cleanMessage(commit.message) }}
              </div>

              <div class="commit-meta">
                <span class="commit-sha">{{ shortSha(commit.sha) }}</span>
                <span class="commit-time">{{ formatDate(commit.date) }}</span>
              </div>
            </div>
          </a>
        </div>

        <div v-else class="empty-state">
          No commits found.
        </div>
      </section>

      <!-- Backend -->
      <section class="devlog-column devlog-column--backend">
        <div class="repo-header">
          <span class="repo-indicator" />

          <div class="repo-meta">
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
            <span class="commit-dot" />

            <div class="commit-content">
              <div class="commit-message">
                {{ cleanMessage(commit.message) }}
              </div>

              <div class="commit-meta">
                <span class="commit-sha">{{ shortSha(commit.sha) }}</span>
                <span class="commit-time">{{ formatDate(commit.date) }}</span>
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
/* ------------------------------------------------------------------ */
/* Local tokens                                                        */
/* ------------------------------------------------------------------ */

.devlog-widget {
  --devlog-surface: var(--color-surface, #111);
  --devlog-border: var(--border-color, #2a2a2a);

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

.devlog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;

}

.devlog-heading h2 {
  margin: 10px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.devlog-heading p {
  margin: 10px;
  color: #777;
  font-size: 12px;
}

/* Small right-aligned stat so the header doesn't feel empty on wide screens. */
.devlog-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.devlog-stat-value {
  color: #d4b56a;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
}

.devlog-stat-label {
  margin-top: 3px;
  color: #666;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ------------------------------------------------------------------ */
/* Columns                                                             */
/* ------------------------------------------------------------------ */

.devlog-columns {
  flex: 1;
  min-height: 0;

  display: grid;
  grid-template-columns: 1fr 1fr;

  border-top: 1px solid var(--devlog-border);
}

.devlog-column {
  min-width: 0;
  overflow-y: auto;
  padding: 16px;

  scrollbar-width: thin;
  scrollbar-color: #333 transparent;
}

.devlog-column::-webkit-scrollbar {
  width: 6px;
}

.devlog-column::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 3px;
}

.devlog-column + .devlog-column {
  border-left: 1px solid var(--devlog-border);
}

/* Per-repo accent — frontend picks up the site's ambient blue, backend
   reuses the gold already in the palette. Both are deliberately muted
   so they read as identifiers rather than highlights. */
.devlog-column--frontend {
  --repo-accent: #6b9bd4;
}

.devlog-column--backend {
  --repo-accent: #b89b5e;
}

/* ------------------------------------------------------------------ */
/* Repo header                                                         */
/* ------------------------------------------------------------------ */

.repo-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.repo-indicator {
  width: 8px;
  height: 8px;
  flex-shrink: 0;

  border-radius: 50%;
  background: var(--repo-accent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--repo-accent) 55%, transparent);
}

.repo-meta {
  min-width: 0;
}

.repo-header h3 {
  margin: 0;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.repo-header span {
  display: block;
  margin-top: 2px;

  color: #666;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.01em;
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

.commit-list {
  position: relative;
  display: flex;
  flex-direction: column;
}

/*
 * One continuous line running through all commit dots. Faded at the top
 * and bottom so it doesn't hard-stop against the first and last entries.
 * The dots sit on top of it with a matching background, which "cuts"
 * the line at every commit.
 */
.commit-list::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 14px;
  bottom: 14px;
  width: 1px;

  background: linear-gradient(
    to bottom,
    transparent 0,
    var(--devlog-border) 8%,
    var(--devlog-border) 92%,
    transparent 100%
  );

  pointer-events: none;
}

.commit {
  position: relative;
  z-index: 1;

  display: flex;
  gap: 10px;

  padding: 10px 0;

  color: inherit;
  text-decoration: none;

  border-bottom: 1px solid var(--devlog-border);

  transition: border-color 0.15s ease;
}

.commit:last-child {
  border-bottom: 0;
}

.commit:hover {
  border-color: color-mix(in srgb, var(--repo-accent) 40%, var(--devlog-border));
}

/* ------------------------------------------------------------------ */
/* Commit dot                                                          */
/* ------------------------------------------------------------------ */

.commit-dot {
  width: 6px;
  height: 6px;
  margin-top: 6px;
  flex-shrink: 0;

  /* Background matches the panel so the timeline line appears to pass
     behind the dot rather than through it. */
  background: var(--devlog-surface);
  border: 1px solid #555;
  border-radius: 50%;

  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.commit:hover .commit-dot {
  background: var(--repo-accent);
  border-color: var(--repo-accent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--repo-accent) 60%, transparent);
  transform: scale(1.15);
}

/* ------------------------------------------------------------------ */
/* Commit body                                                         */
/* ------------------------------------------------------------------ */

.commit-content {
  min-width: 0;
  flex: 1;
}

.commit-message {
  overflow: hidden;

  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  line-height: 1.4;

  white-space: nowrap;
  text-overflow: ellipsis;

  transition: color 0.15s ease;
}

.commit:hover .commit-message {
  color: #fff;
}

.commit-meta {
  display: flex;
  align-items: center;
  gap: 8px;

  margin-top: 5px;
}

/* SHA chip — monospace pill so hashes read as identifiers, not prose. */
.commit-sha {
  padding: 1px 6px;

  border-radius: 4px;
  background: rgba(255, 255, 255, 0.04);

  color: #8a8a8a;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.02em;

  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.commit:hover .commit-sha {
  background: color-mix(in srgb, var(--repo-accent) 14%, transparent);
  color: color-mix(in srgb, var(--repo-accent) 80%, #fff);
}

.commit-time {
  color: #5c5c5c;
  font-size: 10px;
  letter-spacing: 0.01em;
}

/* ------------------------------------------------------------------ */
/* States                                                              */
/* ------------------------------------------------------------------ */

.devlog-loading {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 24px 16px;

  color: #666;
  font-size: 12px;
}

/* Small pulsing dot so loading doesn't feel static. */
.devlog-loading::before {
  content: '';
  width: 6px;
  height: 6px;
  flex-shrink: 0;

  border-radius: 50%;
  background: #b89b5e;

  animation: devlog-pulse 1.2s ease-in-out infinite;
}

@keyframes devlog-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

.devlog-error {
  padding: 24px 16px;
  color: #d47a7a;
  font-size: 12px;
}

.empty-state {
  padding: 20px 0;

  color: #555;
  font-size: 12px;
  font-style: italic;
}

/* ------------------------------------------------------------------ */
/* Responsive                                                          */
/* ------------------------------------------------------------------ */

@media (max-width: 600px) {
  .devlog-columns {
    grid-template-columns: 1fr;
  }

  .devlog-column + .devlog-column {
    border-left: 0;
    border-top: 1px solid var(--devlog-border);
  }

  .devlog-stat {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .devlog-loading::before {
    animation: none;
    opacity: 0.6;
  }

  .commit,
  .commit-dot,
  .commit-message,
  .commit-sha {
    transition: none;
  }
}
</style>