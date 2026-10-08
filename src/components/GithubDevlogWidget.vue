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

/* ------------------------------------------------------------------ */
/* "How this site works" — static architecture summary                 */
/* ------------------------------------------------------------------ */

interface TechChip {
  id: string
  name: string
}

interface ArchitectureEntry {
  id: string
  label: string
  value: string
  /** Optional external link — the value becomes clickable. */
  link?: string
  /** Optional sub-line, shown under the value. */
  note?: string
}

interface ArchitectureGroup {
  id: string
  label: string
  entries: ArchitectureEntry[]
}

const coreTech: TechChip[] = [
  { id: 'vue', name: 'Vue.js' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'go', name: 'Go' },
]

const architectureGroups: ArchitectureGroup[] = [
  {
    id: 'hosting',
    label: 'Hosting',
    entries: [
      {
        id: 'frontend-hosting',
        label: 'Frontend',
        value: 'GitHub Pages · gh-pages',
      },
      {
        id: 'backend-hosting',
        label: 'Backend',
        value: 'Vercel',
      },
    ],
  },
  {
    id: 'services',
    label: 'External services',
    entries: [
      {
        id: 'spotify',
        label: 'Spotify tracks & artists',
        value: 'Spotify Web API',
        link: 'https://developer.spotify.com/',
      },
      {
        id: 'github-profile',
        label: 'GitHub profile & repos',
        value: 'GitHub REST API',
        link: 'https://docs.github.com/en/rest',
      },
      {
        id: 'github-contribs',
        label: 'Contribution graph',
        value: 'github-contributions-api',
        link: 'https://github.com/grubersjoe/github-contributions-api',
      },
      {
        id: 'messages',
        label: 'Anonymous messages',
        value: 'Google Sheets (DB) · Cloud Console (API)',
        note: 'Vercel proxies requests — it does not host the data.',
      },
    ],
  },
]

const architectureOpen = ref(false)

/* ------------------------------------------------------------------ */
/* Devlog fetch + helpers                                              */
/* ------------------------------------------------------------------ */

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

    <!-- ---------------------------------------------------------------- -->
    <!-- How this site works — collapsible                                  -->
    <!-- ---------------------------------------------------------------- -->
    <section
      class="architecture"
      :class="{ 'is-open': architectureOpen }"
    >
      <button
        type="button"
        class="architecture-toggle"
        :aria-expanded="architectureOpen"
        aria-controls="architecture-panel"
        @click="architectureOpen = !architectureOpen"
      >
        <span class="architecture-toggle-chevron" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>

        <span class="architecture-toggle-content">
          <strong>How this site works</strong>
          <span>Stack, hosting, and external services</span>
        </span>
      </button>

      <Transition name="expand">
        <div
          v-if="architectureOpen"
          id="architecture-panel"
          class="architecture-panel"
        >
          <!-- Core tech: chips -->
          <div class="architecture-group">
            <p class="architecture-group-label">Core tech</p>

            <div class="tech-chips">
              <span
                v-for="tech in coreTech"
                :key="tech.id"
                class="tech-chip"
              >
                {{ tech.name }}
              </span>
            </div>
          </div>

          <!-- Groups: hosting, external services -->
          <div
            v-for="group in architectureGroups"
            :key="group.id"
            class="architecture-group"
          >
            <p class="architecture-group-label">{{ group.label }}</p>

            <ul class="architecture-list">
              <li
                v-for="entry in group.entries"
                :key="entry.id"
                class="architecture-entry"
              >
                <span class="architecture-entry-label">
                  {{ entry.label }}
                </span>

                <span class="architecture-entry-value">
                  <a
                    v-if="entry.link"
                    :href="entry.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="architecture-link"
                  >
                    {{ entry.value }}
                    <span class="architecture-link-icon" aria-hidden="true">↗</span>
                  </a>
                  <template v-else>{{ entry.value }}</template>
                </span>

                <span v-if="entry.note" class="architecture-entry-note">
                  {{ entry.note }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </section>

    <!-- ---------------------------------------------------------------- -->
    <!-- Commit history                                                     -->
    <!-- ---------------------------------------------------------------- -->
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
  margin: 15px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.devlog-heading p {
  margin: 15px;
  color: #777;
  font-size: 12px;
}

/* Small right-aligned stat so the header doesn't feel empty on wide screens. */
.devlog-stat {
  margin: 15px;
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
/* Architecture section                                                */
/* ------------------------------------------------------------------ */

.architecture {
  border-top: 1px solid var(--devlog-border);
  background: rgba(255, 255, 255, 0.008);
}

.architecture-toggle {
  display: flex;
  align-items: center;
  gap: 12px;

  width: 100%;
  padding: 14px 16px;

  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;

  cursor: pointer;

  transition: background 0.15s ease;
}

.architecture-toggle:hover {
  background: rgba(255, 255, 255, 0.02);
}

.architecture-toggle:focus-visible {
  outline: 2px solid rgba(184, 155, 94, 0.55);
  outline-offset: -3px;
}

.architecture-toggle-chevron {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;
  flex-shrink: 0;

  color: #666;

  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.architecture-toggle-chevron svg {
  width: 14px;
  height: 14px;
}

.architecture.is-open .architecture-toggle-chevron {
  transform: rotate(90deg);
  color: #b89b5e;
}

.architecture-toggle-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.architecture-toggle-content strong {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.architecture-toggle-content > span {
  color: #777;
  font-size: 11px;
  line-height: 1.3;
}

/* -------- Panel -------- */

.architecture-panel {
  padding: 0 16px 18px;
}

.architecture-group {
  margin-top: 16px;
}

.architecture-group:first-child {
  margin-top: 6px;
}

.architecture-group-label {
  margin: 0 0 10px;

  color: #666;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* -------- Core tech chips -------- */

.tech-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-chip {
  display: inline-flex;
  align-items: center;

  padding: 5px 11px;

  border: 1px solid rgba(184, 155, 94, 0.28);
  border-radius: 6px;
  background: rgba(184, 155, 94, 0.07);

  color: #d4b56a;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.005em;
  line-height: 1.2;
}

/* -------- Entry list -------- */

.architecture-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.architecture-entry {
  display: grid;
  grid-template-columns: 170px 1fr;
  column-gap: 16px;
  row-gap: 3px;

  padding: 10px 0;

  border-bottom: 1px solid var(--devlog-border);
}

.architecture-entry:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.architecture-entry-label {
  align-self: start;
  padding-top: 2px;

  color: #888;
  font-size: 11px;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

.architecture-entry-value {
  min-width: 0;

  color: #ddd;
  font-size: 12px;
  line-height: 1.45;

  overflow-wrap: break-word;
}

.architecture-link {
  color: #6b9bd4;
  text-decoration: none;

  transition: color 0.15s ease;
}

.architecture-link:hover {
  color: #8bb6e6;
  text-decoration: underline;
}

.architecture-link-icon {
  display: inline-block;
  margin-left: 3px;

  font-size: 10px;
  opacity: 0.75;
}

.architecture-entry-note {
  grid-column: 2;

  color: #666;
  font-size: 10.5px;
  font-style: italic;
  line-height: 1.45;
}

/* -------- Expand transition -------- */

.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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

  /* Architecture entries stack: label on top, value below, note below. */
  .architecture-entry {
    grid-template-columns: 1fr;
    row-gap: 3px;
  }

  .architecture-entry-note {
    grid-column: 1;
  }

  .architecture-toggle-content > span {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .devlog-loading::before {
    animation: none;
    opacity: 0.6;
  }

  .architecture-toggle-chevron,
  .architecture-toggle,
  .commit,
  .commit-dot,
  .commit-message,
  .commit-sha,
  .expand-enter-active,
  .expand-leave-active {
    transition: none;
  }

  .expand-enter-from,
  .expand-leave-to {
    transform: none;
  }
}
</style>