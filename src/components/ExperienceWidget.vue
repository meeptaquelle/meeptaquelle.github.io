<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  experiences,
  types,
  type Experience,
  type ExperienceType,
} from '../data/ExperienceData'

const selectedType = ref<string>('all')

const previewImage = ref<string | null>(null)

function openImage(image: string) {
  previewImage.value = image
}

function closeImage() {
  previewImage.value = null
}

const filteredExperiences = computed(() => {
  return experiences
    .filter((experience) => {
      return (
        selectedType.value === 'all' ||
        experience.type === selectedType.value
      )
    })
    .sort((a, b) => b.startYear - a.startYear)
})

const getExperiencePeriod = (experience: Experience) => {
  if (experience.status === 'ongoing') {
    return `${experience.startYear}–Present`
  }

  if (experience.endYear != null) {
    return `${experience.startYear}–${experience.endYear}`
  }

  return `${experience.startYear}`
}

function getTypeLabel(type: ExperienceType) {
  return types.find((item) => item.value === type)?.label ?? type
}
</script>

<template>
  <div class="experience-widget">
    <!-- Header -->
    <div class="experience-header">
      <div>
        <h2>Experience</h2>
        <p>A history of things I've been involved in.</p>
      </div>

      <span class="experience-count">
        {{ filteredExperiences.length }} experiences
      </span>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <span class="filter-label">Type</span>

        <div class="filter-list">
          <button
            v-for="type in types"
            :key="type.value"
            type="button"
            class="filter-button"
            :class="{ active: selectedType === type.value }"
            @click="selectedType = type.value"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Experience List -->
    <div class="experience-list">
  <div
    v-for="experience in filteredExperiences"
    :key="experience.id"
    class="experience-card"
  >
    <div class="experience-period">
      {{ getExperiencePeriod(experience) }}
    </div>

    <div class="experience-main">
      <div class="experience-info">
        <div class="experience-title-row">
          <h3>
            {{ getTypeLabel(experience.type) }}
            <span class="title-separator">|</span>
            {{ experience.title }}
          </h3>

          <span
            v-if="experience.status"
            class="experience-status"
          >
            {{ experience.status }}
          </span>
        </div>

        <div class="experience-meta">
          <span>{{ experience.organization }}</span>
        </div>

        <p class="experience-description">
          {{ experience.description }}
        </p>

        <!-- Attachments -->
        <div
          v-if="experience.attachments?.length"
          class="experience-attachments"
        >
          <button
            v-for="(attachment, index) in experience.attachments"
            :key="index"
            type="button"
            class="experience-attachment-button"
            @click="openImage(attachment)"
          >
            <img
              :src="attachment"
              :alt="`${experience.title} image ${index + 1}`"
              class="experience-attachment"
            />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div
    v-if="filteredExperiences.length === 0"
    class="empty-state"
  >
    <span>No experiences found.</span>
  </div>
</div>

      <!-- Empty State -->
      <div
        v-if="filteredExperiences.length === 0"
        class="empty-state"
      >
        <span>No experiences found.</span>
      </div>
    </div>

  <!-- Image Preview -->
  <div
    v-if="previewImage"
    class="image-preview"
    @click.self="closeImage"
  >
    <button
      type="button"
      class="image-preview-close"
      aria-label="Close image preview"
      @click="closeImage"
    >
      ×
    </button>

    <img
      :src="previewImage"
      alt="Experience preview"
      class="image-preview-image"
    />
  </div>
</template>

<style scoped>
.experience-widget {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  color: #fff;
}

/* Header */

.experience-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.experience-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.experience-header p {
  margin: 5px 0 0;
  color: #777;
  font-size: 12px;
}

.experience-count {
  color: #666;
  font-size: 11px;
}

/* Filters */

.filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #222;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.filter-label {
  flex: 0 0 70px;
  color: #555;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.filter-button {
  padding: 5px 9px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: #666;
  font-size: 11px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.filter-button:hover {
  background: #181818;
  color: #aaa;
}

.filter-button.active {
  border-color: #333;
  background: #1c1c1c;
  color: #fff;
}

/* Experience List */

.experience-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Experience Card */

.experience-card {
  position: relative;
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 20px;
  padding: 15px;
  border: 1px solid #222;
  border-radius: 10px;
  background: #0e0e0e;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.experience-card:hover {
  border-color: #333;
  background: #121212;
}

.experience-period {
  padding-top: 2px;
  color: #555;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.experience-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.experience-info {
  min-width: 0;
}

.experience-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.experience-title-row h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.title-separator {
  margin: 0 5px;
  color: #444;
}

.experience-status {
  padding: 2px 6px;
  border: 1px solid #292929;
  border-radius: 4px;
  color: #666;
  font-size: 9px;
  text-transform: uppercase;
}

.experience-meta {
  display: flex;
  align-items: center;
  margin-top: 4px;
  color: #666;
  font-size: 10px;
}

.experience-description {
  max-width: 620px;
  margin: 10px 0 0;
  color: #999;
  font-size: 12px;
  line-height: 1.6;
}

/* Attachments */

.experience-attachments {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  overflow-x: auto;
  scrollbar-width: none;
}

.experience-attachments::-webkit-scrollbar {
  display: none;
}

.experience-attachment-button {
  flex: 0 0 auto;
  width: 180px;
  height: 110px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
}

.experience-attachment {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid #222;
  border-radius: 7px;
  background: #111;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.experience-attachment-button:hover .experience-attachment {
  border-color: #555;
  transform: scale(1.03);
}

/* Empty State */

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border: 1px dashed #222;
  border-radius: 10px;
  color: #555;
  font-size: 12px;
}

/* Image Preview */

.image-preview {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(8px);
  z-index: 1000;
  cursor: pointer;
}

.image-preview-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border: 1px solid #333;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  cursor: default;
}

.image-preview-close {
  position: absolute;
  top: 20px;
  right: 24px;
  width: 36px;
  height: 36px;
  border: 1px solid #333;
  border-radius: 50%;
  background: #111;
  color: #aaa;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.image-preview-close:hover {
  border-color: #555;
  color: #fff;
}

/* Responsive */

@media (max-width: 650px) {
  .experience-widget {
    padding: 16px;
  }

  .filter-group {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }

  .filter-label {
    flex: none;
  }

  .experience-card {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .experience-period {
    padding-top: 0;
  }

  .experience-main {
    flex-direction: column;
    gap: 12px;
  }
}
</style>