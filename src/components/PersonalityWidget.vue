<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  bandForScore,
  personalityCards,
  personalityDisclaimer,
  personalityOverview,
  personalityTraits,
  type PersonalityTrait,
} from '@/data/PersonalityData'

const activeTraitId = ref<PersonalityTrait['id'] | null>(null)
const showOverview = ref(false)

/* Lookup so cards can pull their level color from the trait data without
 * duplicating the level on each card. */
const traitById = new Map(personalityTraits.map((t) => [t.id, t]))

const activeTrait = computed(
  () => personalityTraits.find((t) => t.id === activeTraitId.value) ?? null,
)

function toggleTrait(id: PersonalityTrait['id']): void {
  activeTraitId.value = activeTraitId.value === id ? null : id
}

/* Both OCEAN bars and facet bars share the same math. */
function barSize(score: number, maxScore: number): string {
  return `${(score / maxScore) * 100}%`
}

function scoreStyle(score: number, maxScore: number) {
  const band = bandForScore(score, maxScore)
  return {
    '--score-accent': band.color,
    '--score-tint': band.tint,
  } as Record<string, string>
}

/* Used only where the label is genuinely needed (header pills, aria).
 * Color no longer depends on this. */
</script>

<template>
  <section class="personality-widget">
    <!-- ----------------------------------------------------------------- -->
    <!-- Header                                                            -->
    <!-- ----------------------------------------------------------------- -->
    <header class="widget-header">
      <h2>Personality</h2>
      <p>Measured using the Big Five (OCEAN) personality test.</p>
    </header>

    <!-- ----------------------------------------------------------------- -->
    <!-- Card row — one hook per dimension                                 -->
    <!-- ----------------------------------------------------------------- -->
    <div class="card-row">
<article
  v-for="card in personalityCards"
  :key="card.id"
  class="card"
  :style="scoreStyle(
    traitById.get(card.id)?.score ?? 0,
    traitById.get(card.id)?.maxScore ?? 1,
  )"
>
        <div class="card-icon" aria-hidden="true">
          <component :is="card.icon" />
        </div>

        <p class="card-phrase">{{ card.phrase }}</p>

        <span class="card-letter" aria-hidden="true">{{ card.id }}</span>
      </article>
    </div>

    <!-- ----------------------------------------------------------------- -->
    <!-- Vertical OCEAN chart — click a column to expand facets            -->
    <!-- ----------------------------------------------------------------- -->
    <div class="chart-wrap">
      <div class="chart" role="group" aria-label="Big Five scores">
<div
  v-for="trait in personalityTraits"
  :key="trait.id"
  class="chart-col"
  :class="{ 'is-active': activeTraitId === trait.id }"
  :style="scoreStyle(trait.score, trait.maxScore)"
>
          <button
            type="button"
            class="chart-col-btn"
            :aria-expanded="activeTraitId === trait.id"
            :aria-controls="`trait-details-${trait.id}`"
            :aria-label="`${trait.name}, ${trait.score} out of ${trait.maxScore}, ${trait.level}. Click to view facets.`"
            @click="toggleTrait(trait.id)"
          >
            <span class="chart-level">{{ trait.level }}</span>

            <span class="chart-score">{{ trait.score }}</span>

            <span class="chart-track">
              <span
                class="chart-fill"
                :style="{ height: barSize(trait.score, trait.maxScore) }"
              />
              <span class="chart-midline" aria-hidden="true" />
            </span>

            <span class="chart-letter">{{ trait.id }}</span>

            <span class="chart-name">{{ trait.name }}</span>
          </button>
        </div>
      </div>

      <p v-if="!activeTrait" class="chart-hint">
        Tap a trait to see its facets
      </p>
    </div>

    <!-- ----------------------------------------------------------------- -->
    <!-- Detail panel — only shown for the active trait                    -->
    <!-- ----------------------------------------------------------------- -->
    <Transition name="expand">
<div
  v-if="activeTrait"
  :id="`trait-details-${activeTrait.id}`"
  class="trait-detail"
  :style="scoreStyle(activeTrait.score, activeTrait.maxScore)"
>
        <header class="detail-header">
          <div class="detail-meta">
            <h3>{{ activeTrait.name }}</h3>

            <p class="detail-score">
              <span class="detail-score-value">{{ activeTrait.score }}</span>
              <span class="detail-score-max"> / {{ activeTrait.maxScore }}</span>
              <span class="detail-score-sep" aria-hidden="true">·</span>
              <span class="detail-score-level">{{ activeTrait.level }}</span>
            </p>
          </div>

          <button
            type="button"
            class="detail-close"
            aria-label="Close details"
            @click="activeTraitId = null"
          >
            ×
          </button>
        </header>

        <p class="detail-description">{{ activeTrait.description }}</p>

        <p class="facets-label">Facets</p>

        <div class="facets">
<div
  v-for="facet in activeTrait.facets"
  :key="facet.id"
  class="facet"
  :style="scoreStyle(facet.score, facet.maxScore)"
>
            <div class="facet-header">
              <span class="facet-name">{{ facet.name }}</span>

              <span class="facet-meta">
                <span class="facet-score">
                  {{ facet.score }} / {{ facet.maxScore }}
                </span>
                <span class="facet-sep" aria-hidden="true">·</span>
                <span class="facet-level">{{ facet.level }}</span>
              </span>
            </div>

            <div
              class="facet-bar"
              role="progressbar"
              :aria-valuenow="facet.score"
              :aria-valuemin="0"
              :aria-valuemax="facet.maxScore"
              :aria-label="facet.name"
            >
              <div
                class="facet-bar-fill"
                :style="{ width: barSize(facet.score, facet.maxScore) }"
              />
            </div>

            <p class="facet-description">{{ facet.description }}</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ----------------------------------------------------------------- -->
    <!-- Overview — collapsed by default, sits below the chart              -->
    <!-- ----------------------------------------------------------------- -->
    <div class="overview-wrap">
      <button
        type="button"
        class="overview-toggle"
        :aria-expanded="showOverview"
        aria-controls="personality-overview"
        @click="showOverview = !showOverview"
      >
        <span class="overview-toggle-chevron" :class="{ 'is-open': showOverview }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
        {{ showOverview ? 'Hide' : 'Read' }} full interpretation
      </button>

      <Transition name="expand">
<p
  v-if="showOverview"
  id="personality-overview"
  class="widget-overview"
  v-html="personalityOverview"
></p>
      </Transition>
    </div>

    <!-- ----------------------------------------------------------------- -->
    <!-- Footer                                                            -->
    <!-- ----------------------------------------------------------------- -->
    <footer class="widget-footer">
      <p>{{ personalityDisclaimer }}</p>
    </footer>
  </section>
</template>

<style scoped>
/* ------------------------------------------------------------------ */
/* Local tokens                                                        */
/* ------------------------------------------------------------------ */

.personality-widget {
  --pw-border: var(--color-border, #2a2a2a);
  --pw-border-strong: var(--color-border-light, #3a3a3a);
  --pw-surface: var(--color-surface, #111);
  --pw-surface-hover: var(--color-surface-hover, #161616);
  --pw-text: var(--color-text, #fff);
  --pw-text-secondary: var(--color-text-secondary, #b0b0b0);
  --pw-text-muted: var(--color-text-muted, #8a8a8a);
  --pw-text-subtle: var(--color-text-subtle, #666);
  --pw-radius: var(--radius-md, 12px);

  width: 100%;
  box-sizing: border-box;
  padding: 24px;
  color: var(--pw-text);
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

.widget-header {
  margin-bottom: 20px;
}

.widget-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.widget-header p {
  margin: 4px 0 0;
  color: var(--pw-text-muted);
  font-size: 12px;
}

/* ------------------------------------------------------------------ */
/* Card row                                                            */
/* ------------------------------------------------------------------ */

.card-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 24px;
}

.card {
  position: relative;

  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 14px 12px 14px;

  border: 1px solid var(--pw-border);
  border-radius: var(--pw-radius);
  background: var(--pw-surface);

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.card:hover {
  border-color: color-mix(in srgb, var(--score-accent) 45%, var(--pw-border));
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 26px;
  height: 26px;

  border-radius: 7px;
  background: var(--score-tint);
  color: var(--score-accent);
}

.card-icon :deep(svg) {
  width: 14px;
  height: 14px;
}

.card-phrase {
  margin: 0;

  color: var(--pw-text);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.005em;
}

.card-letter {
  position: absolute;
  top: 12px;
  right: 12px;

  color: var(--pw-text-subtle);

  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

/* ------------------------------------------------------------------ */
/* Chart                                                               */
/* ------------------------------------------------------------------ */

.chart-wrap {
  margin-bottom: 8px;
}

.chart {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.chart-col {
  --chart-accent: #8a8a8a;
}



.chart-col-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  width: 100%;
  padding: 10px 6px 12px;

  border: 1px solid transparent;
  border-radius: var(--pw-radius);
  background: transparent;

  color: inherit;
  font: inherit;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.chart-col-btn:hover {
  background: rgba(255, 255, 255, 0.025);
  border-color: var(--pw-border);
}


.chart-col.is-active .chart-col-btn {
  background: var(--pw-surface-hover);
  border-color: color-mix(in srgb, var(--score-accent) 55%, var(--pw-border));
}


.chart-col-btn:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--score-accent) 70%, transparent);
  outline-offset: 2px;
}

.chart-level {
  padding: 2px 7px;

  border-radius: 999px;
  background: var(--score-tint);
  color: var(--score-accent);

  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}
.chart-score {
  color: var(--score-accent);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}

.chart-track {
  position: relative;

  display: block;
  width: 100%;
  height: 150px;

  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);

  overflow: hidden;
}

.chart-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  display: block;

  border-radius: 6px 6px 0 0;
  background: var(--score-accent);

  transition: height 0.4s ease;
}


.chart-midline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 50%;

  height: 1px;

  background: rgba(255, 255, 255, 0.09);

  pointer-events: none;
}

.chart-letter {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 22px;
  height: 22px;

  border-radius: 6px;
  background: var(--score-tint);
  color: var(--score-accent);

  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-size: 10px;
  font-weight: 600;
}

.chart-name {
  min-height: 26px;

  color: var(--pw-text-muted);
  font-size: 10.5px;
  line-height: 1.25;
  text-align: center;
}

.chart-hint {
  margin: 12px 0 0;

  color: var(--pw-text-subtle);
  font-size: 10.5px;
  text-align: center;
  letter-spacing: 0.01em;
}

/* ------------------------------------------------------------------ */
/* Trait detail panel                                                  */
/* ------------------------------------------------------------------ */

.trait-detail {
  --detail-accent: #8a8a8a;

  margin: 16px 0 20px;
  padding: 18px;

  border: 1px solid var(--pw-border);
  border-radius: var(--pw-radius);
  background: var(--pw-surface);
}


.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  margin-bottom: 12px;
}

.detail-meta h3 {
  margin: 0;

  color: var(--pw-text);
  font-size: 15px;
  font-weight: 600;
}

.detail-score {
  margin: 4px 0 0;

  font-size: 12px;
}

.detail-score-value {
  color: var(--score-accent);
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-weight: 600;
}


.detail-score-max {
  color: var(--pw-text-subtle);

  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}

.detail-score-sep {
  margin: 0 6px;
  color: var(--pw-text-subtle);
}


.detail-score-level {
  color: var(--score-accent);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.detail-close {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 26px;
  height: 26px;
  flex-shrink: 0;

  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--pw-text-subtle);

  font-size: 18px;
  line-height: 1;

  cursor: pointer;

  transition: background 0.15s ease, color 0.15s ease;
}

.detail-close:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--pw-text);
}

.detail-description {
  margin: 0 0 18px;

  color: var(--pw-text-secondary);
  font-size: 12.5px;
  line-height: 1.6;
}

.facets-label {
  margin: 0 0 10px;

  color: var(--pw-text-subtle);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ------------------------------------------------------------------ */
/* Facets                                                              */
/* ------------------------------------------------------------------ */

.facets {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 0;
}

.facet {
  --facet-accent: #8a8a8a;

  padding: 12px 0;

  border-bottom: 1px solid var(--pw-border);
}

.facet-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  margin-bottom: 8px;
}

.facet-name {
  min-width: 0;

  color: var(--pw-text);
  font-size: 12.5px;
  font-weight: 500;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.facet-meta {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;

  flex-shrink: 0;

  font-size: 10.5px;
  white-space: nowrap;
}

.facet-score {
  color: var(--pw-text-secondary);

  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  font-weight: 500;
}

.facet-sep {
  color: var(--pw-text-subtle);
}

.facet-level {
  color: var(--score-accent);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.facet-bar {
  height: 3px;
  margin-bottom: 9px;

  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);

  overflow: hidden;
}

.facet-bar-fill {
  display: block;
  height: 100%;

  border-radius: inherit;
  background: var(--score-accent);

  transition: width 0.3s ease;
}

.facet-description {
  margin: 0;

  color: var(--pw-text-muted);
  font-size: 11px;
  line-height: 1.55;
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

.overview-wrap {
  margin-top: 20px;
}

.overview-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 6px 2px;

  border: 0;
  background: transparent;
  color: var(--pw-text-muted);

  font: inherit;
  font-size: 11.5px;
  font-weight: 500;

  cursor: pointer;

  transition: color 0.15s ease;
}

.overview-toggle:hover {
  color: var(--pw-text);
}

.overview-toggle-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 12px;
  height: 12px;

  transition: transform 0.2s ease;
}

.overview-toggle-chevron svg {
  width: 11px;
  height: 11px;
}

.overview-toggle-chevron.is-open {
  transform: rotate(90deg);
}

.widget-overview {
  margin: 12px 0 0;
  padding: 4px 0 4px 14px;

  border-left: 2px solid color-mix(in srgb, #b89b5e 60%, transparent);

  color: var(--pw-text-secondary);
  font-size: 12.5px;
  line-height: 1.65;
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

.widget-footer {
  margin-top: 22px;
  padding-top: 16px;

  border-top: 1px solid var(--pw-border);
}

.widget-footer p {
  margin: 0;

  color: var(--pw-text-muted);
  font-size: 10.5px;
  line-height: 1.5;
}

/* ------------------------------------------------------------------ */
/* Expand transition                                                   */
/* ------------------------------------------------------------------ */

.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ------------------------------------------------------------------ */
/* Responsive — mobile: cards snap-scroll, chart stays vertical        */
/* ------------------------------------------------------------------ */

@media (max-width: 700px) {
  .personality-widget {
    padding: 18px;
  }

  /* Card row becomes a snap-scrolling filmstrip */
  .card-row {
    display: flex;
    gap: 10px;

    margin: 0 -18px 22px;
    padding: 2px 18px 10px;

    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;

    -webkit-mask-image: linear-gradient(
      to right,
      #000 calc(100% - 48px),
      transparent
    );
    mask-image: linear-gradient(
      to right,
      #000 calc(100% - 48px),
      transparent
    );
  }

  .card-row::-webkit-scrollbar {
    display: none;
  }

  .card {
    flex: 0 0 66%;
    scroll-snap-align: start;
  }

  /* Chart stays vertical but tightens up */
  .chart {
    gap: 4px;
  }

  .chart-col-btn {
    padding: 8px 3px 10px;
    gap: 5px;
  }

  .chart-level {
    padding: 2px 5px;
    font-size: 8px;
  }

  .chart-score {
    font-size: 13px;
  }

  .chart-track {
    height: 120px;
  }

  .chart-letter {
    width: 20px;
    height: 20px;
    font-size: 9px;
  }

  /* Name is redundant on mobile — the cards above carry it */
  .chart-name {
    display: none;
  }

  /* Facets collapse to one column */
  .facets {
    grid-template-columns: 1fr;
  }

  .trait-detail {
    padding: 16px;
  }

  .detail-meta h3 {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .chart-col-btn,
  .chart-fill,
  .facet-bar-fill,
  .overview-toggle-chevron,
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