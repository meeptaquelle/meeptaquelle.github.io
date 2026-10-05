<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  categories,
  projects,
  types,
  type Project,
  type ProjectCategory,
  type ProjectType,
} from '../data/ProjectData'

const selectedCategory = ref<string>('all')
const selectedType = ref<string>('all')

  const previewImage = ref<string | null>(null)

function openImage(image: string) {
  previewImage.value = image
}

function closeImage() {
  previewImage.value = null
}

const filteredProjects = computed(() => {
  return projects.filter((project) => {
    const categoryMatch =
      selectedCategory.value === 'all' || project.category === selectedCategory.value

    const typeMatch = selectedType.value === 'all' || project.type === selectedType.value

    return categoryMatch && typeMatch
  })
})

const groupedProjects = computed(() => {
  const groups = new Map<number, Project[]>()

  for (const project of filteredProjects.value) {
    if (!groups.has(project.year)) {
      groups.set(project.year, [])
    }

    groups.get(project.year)!.push(project)
  }

  return [...groups.entries()]
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, projects]) => ({
      year,
      projects,
    }))
})

function getCategoryLabel(category: ProjectCategory) {
  return categories.find((item) => item.value === category)?.label ?? category
}

function getTypeLabel(type: ProjectType) {
  return types.find((item) => item.value === type)?.label ?? type
}
</script>

<template>
  <div class="project-widget">
    <!-- Header -->
    <div class="project-header">
      <div>
        <h2>Projects</h2>
        <p>A history of things I've built.</p>
      </div>

      <span class="project-count"> {{ filteredProjects.length }} projects </span>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <span class="filter-label">Category</span>

        <div class="filter-list">
          <button
            v-for="category in categories"
            :key="category.value"
            type="button"
            class="filter-button"
            :class="{ active: selectedCategory === category.value }"
            @click="selectedCategory = category.value"
          >
            {{ category.label }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-label">Source</span>

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

    <!-- Projects -->
    <div class="project-list">
      <template v-for="group in groupedProjects" :key="group.year">
        <div class="year-section">
          <div class="year-label">
            {{ group.year }}
          </div>

          <div class="projects">
            <article v-for="project in group.projects" :key="project.id" class="project-card">
              <div class="project-main">
                <div class="project-info">
                  <div class="project-title-row">
                    <h3>
                      {{ getTypeLabel(project.type) }}
                      <span class="title-separator">|</span>
                      {{ project.name }}
                    </h3>

                    <span v-if="project.status" class="project-status">
                      {{ project.status }}
                    </span>
                  </div>

                  <div class="project-meta">
                    <span>{{ getCategoryLabel(project.category) }}</span>
                  </div>

                  <p class="project-description">
                    {{ project.description }}
                  </p>
 <div
  v-if="project.attachments?.length"
  class="project-attachments"
>
  <button
    v-for="(attachment, index) in project.attachments"
    :key="index"
    type="button"
    class="project-attachment-button"
    @click="openImage(attachment)"
  >
    <img
      :src="attachment"
      :alt="`${project.name} image ${index + 1}`"
      class="project-attachment"
    />
  </button>
</div>
                </div>
                <!-- Links -->
                <div v-if="project.link || project.repository" class="project-links">
                  <a
                    v-if="project.link"
                    :href="project.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="project-link"
                  >
                    View Project
                    <span>↗</span>
                  </a>

                  <a
                    v-if="project.repository"
                    :href="project.repository"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="project-link secondary"
                  >
                    Repository
                    <span>↗</span>
                  </a>
                </div>
              </div>

              <!-- Tools -->
              <div class="project-tools">
                <span v-for="tool in project.tools" :key="tool" class="tool">
                  {{ tool }}
                </span>
              </div>
            </article>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div v-if="filteredProjects.length === 0" class="empty-state">
        <span>No projects found.</span>
      </div>
    </div>
  </div>
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
    alt="Project preview"
    class="image-preview-image"
  />
</div>
</template>

<style scoped>
.project-widget {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  color: #fff;
}

/* Header */

.project-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 24px;
}

.project-header h2 {
  margin: 0;

  font-size: 20px;
  font-weight: 600;
}

.project-header p {
  margin: 5px 0 0;

  color: #777;
  font-size: 12px;
}

.project-count {
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

/* Project list */

.project-list {
  display: flex;
  flex-direction: column;
}

.year-section {
  display: grid;
  grid-template-columns: 55px 1fr;
  gap: 20px;

  margin-bottom: 28px;
}

.year-label {
  padding-top: 3px;

  color: #555;
  font-size: 11px;
  font-weight: 600;
}

.projects {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Project card */

.project-card {
  padding: 15px;

  border: 1px solid #222;
  border-radius: 10px;

  background: #0e0e0e;

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.project-card:hover {
  border-color: #333;
  background: #121212;
}

.project-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.project-info {
  min-width: 0;
}

.project-title-row h3 {
  margin: 0;

  font-size: 14px;
  font-weight: 600;
}

.title-separator {
  margin: 0 5px;
  color: #444;
}



.project-title-row h3 {
  margin: 0;

  font-size: 14px;
  font-weight: 600;
}

.project-status {
  padding: 2px 6px;

  border: 1px solid #292929;
  border-radius: 4px;

  color: #666;

  font-size: 9px;
  text-transform: uppercase;
}

.project-meta {
  display: flex;
  align-items: center;

  margin-top: 4px;

  color: #666;
  font-size: 10px;
}

.separator {
  color: #333;
}

.project-description {
  max-width: 620px;

  margin: 10px 0 0;

  color: #999;
  font-size: 12px;
  line-height: 1.6;
}

/* Links */

.project-links {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  color: #aaa;

  font-size: 11px;
  text-decoration: none;

  white-space: nowrap;
}

.project-link:hover {
  color: #fff;
  text-decoration: underline;
}

.project-link span {
  font-size: 12px;
}

.project-link.secondary {
  color: #666;
}

.project-link.secondary:hover {
  color: #aaa;
}

/* Tools */

.project-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;

  margin-top: 14px;
  padding-top: 12px;

  border-top: 1px solid #1d1d1d;
}

.tool {
  padding: 4px 7px;

  border: 1px solid #242424;
  border-radius: 4px;

  color: #777;

  font-size: 10px;
}

/* Empty state */

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

/* Responsive */

@media (max-width: 650px) {
  .project-widget {
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

  .year-section {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .project-main {
    flex-direction: column;
    gap: 12px;
  }

  .project-links {
    width: 100%;
  }
}
.project-attachments {
  display: flex;
  gap: 8px;

  margin-top: 14px;

  overflow-x: auto;
  scrollbar-width: none;
}

.project-attachments::-webkit-scrollbar {
  display: none;
}.project-attachment-button {
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

.project-attachment {
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

.project-attachment-button:hover .project-attachment {
  border-color: #555;
  transform: scale(1.03);
}
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
</style>
