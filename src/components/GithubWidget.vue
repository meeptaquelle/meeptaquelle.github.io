<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface HeatmapDay {
  date: string
  count: number
  level: number
  empty?: boolean
}

interface GitHubProfile {
  login: string
  name: string
  avatar_url: string
  bio: string
  public_repos: number
  followers: number
  following: number
  html_url: string
}

interface GitHubRepo {
  name: string
  full_name: string
  html_url: string
  updated_at: string
}

interface GitHubResponse {
  profile: GitHubProfile
  repos: GitHubRepo[]
}

interface GitHubContribution {
  date: string
  count: number
  level: number
}

interface GitHubContributions {
  total: Record<string, number>
  contributions: GitHubContribution[]
}

const contributionCount = computed(() => {
  if (!contributions.value) {
    return 0
  }

  return contributions.value.contributions.reduce((total, day) => total + day.count, 0)
})
const contributions = ref<GitHubContributions | null>(null)
const data = ref<GitHubResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const heatmapWeeks = computed<HeatmapDay[][]>(() => {
  if (!contributions.value) {
    return []
  }

  const days = contributions.value.contributions

  if (days.length === 0) {
    return []
  }

  const firstDate = new Date(`${days[0].date}T00:00:00`)
  const firstDay = firstDate.getDay()

  const paddedDays: HeatmapDay[] = [
    ...Array.from({ length: firstDay }, (_, index) => ({
      date: `empty-start-${index}`,
      count: 0,
      level: 0,
      empty: true,
    })),
    ...days,
  ]

  // Only keep enough data for 52 complete weeks.
  const maxDays = 52 * 7
  const trimmedDays = paddedDays.slice(-maxDays)

  const weeks: HeatmapDay[][] = []

  for (let i = 0; i < trimmedDays.length; i += 7) {
    weeks.push(trimmedDays.slice(i, i + 7))
  }

  return weeks
})
async function loadContributions(): Promise<void> {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/github/contributions')

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub contributions')
    }

    contributions.value = await response.json()
  } catch (err) {
    console.error(err)
  }
}
async function loadGitHub(): Promise<void> {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/github')

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub data')
    }

    data.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch GitHub data'
  } finally {
    loading.value = false
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
onMounted(() => {
  loadGitHub()
  loadContributions()
})
</script>

<template>
  <section class="github-widget">
    <h2>GitHub</h2>

    <p v-if="loading">Loading...</p>

    <p v-else-if="error">
      {{ error }}
    </p>

    <template v-else-if="data">
      <div class="github-profile">
        <img :src="data.profile.avatar_url" :alt="data.profile.login" class="github-avatar" />

        <div>
          <a
            :href="data.profile.html_url"
            target="_blank"
            rel="noopener noreferrer"
            class="github-name"
          >
            {{ data.profile.name }}
          </a>

          <div class="github-username">@{{ data.profile.login }}</div>

          <p class="github-bio">
            {{ data.profile.bio }}
          </p>
        </div>
      </div>

      <div class="contribution-section">
        <div class="section-title">Contributions</div>

        <div class="contribution-grid">
          <div v-for="(week, weekIndex) in heatmapWeeks" :key="weekIndex" class="contribution-week">
            <div
              v-for="day in week"
              :key="day.date"
              class="contribution-day"
              :class="`level-${day.level}`"
              :title="day.empty ? '' : `${day.count} contributions on ${day.date}`"
            ></div>
          </div>
        </div>

        <div class="contribution-total">{{ contributionCount }} contributions in the last year</div>
      </div>

      <div class="github-stats">
        <div>
          <strong>{{ data.profile.public_repos }}</strong>
          <span>repositories</span>
        </div>

        <div>
          <strong>{{ data.profile.followers }}</strong>
          <span>followers</span>
        </div>

        <div>
          <strong>{{ data.profile.following }}</strong>
          <span>following</span>
        </div>
      </div>

      <div class="github-repos">
        <h3>Recently updated</h3>

        <a
          v-for="repo in data.repos"
          :key="repo.full_name"
          :href="repo.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="github-repo"
        >
          <div>
            <strong>{{ repo.name }}</strong>
            <span>{{ formatDate(repo.updated_at) }}</span>
          </div>
        </a>
      </div>

      <a
        :href="data.profile.html_url"
        target="_blank"
        rel="noopener noreferrer"
        class="github-link"
      >
        View GitHub →
      </a>
    </template>
  </section>
</template>

<style scoped>
.github-widget {
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

.github-widget h2 {
  margin: 0 0 20px;
  font-size: 20px;
}

.github-profile {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.github-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

.github-name {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
}

.github-username {
  margin-top: 2px;
  color: #777;
  font-size: 13px;
}

.github-bio {
  margin: 8px 0 0;
  color: #aaa;
  font-size: 13px;
}

.github-stats {
  display: flex;
  gap: 24px;
  margin-top: 20px;
  padding: 16px 0;
  border-top: 1px solid #2a2a2a;
  border-bottom: 1px solid #2a2a2a;
}

.github-stats div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.github-stats strong {
  font-size: 16px;
}

.github-stats span {
  color: #777;
  font-size: 12px;
}

.github-repos {
  margin-top: 20px;
}

.github-repos h3 {
  margin: 0 0 10px;
  color: #aaa;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.github-repo {
  display: block;
  padding: 10px 0;
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid #1d1d1d;
}

.github-repo:last-child {
  border-bottom: 0;
}

.github-repo strong {
  display: block;
  font-size: 14px;
}

.github-repo span {
  display: block;
  margin-top: 3px;
  color: #666;
  font-size: 12px;
}

.github-link {
  display: block;
  margin-top: 16px;
  color: #aaa;
  font-size: 13px;
  text-decoration: none;
}

.github-link:hover,
.github-name:hover,
.github-repo:hover strong {
  text-decoration: underline;
}

.contribution-section {
  margin-top: 20px;
}

.section-title {
  margin-bottom: 10px;
  color: #aaa;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}
.contribution-grid {
  display: grid;
  grid-template-columns: repeat(52, minmax(0, 1fr));
  gap: 2px;
  width: 100%;
  overflow: hidden;
}

.contribution-week {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  gap: 2px;
  min-width: 0;
}

.contribution-day {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 1px;
  background: #1d1d1d;
}

.contribution-day.level-1 {
  background: #0e4429;
}

.contribution-day.level-2 {
  background: #006d32;
}

.contribution-day.level-3 {
  background: #26a641;
}

.contribution-day.level-4 {
  background: #39d353;
}

.contribution-total {
  margin-top: 8px;
  color: #777;
  font-size: 12px;
}
</style>
