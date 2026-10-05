<script setup lang="ts">
import {computed, ref } from 'vue'
import {
  FeGithub,
  FeLinkedin,
  FeMusic,
  FeAtSign,
  FeInstagram,
  FeTwitter,
  FeChevronLeft,
  FeChevronRight,
  FeMapPin,
} from '@kalimahapps/vue-icons/fe'

const currentPhoto = ref(0)
const activePhoto = computed(() => {
  return profile.photos[currentPhoto.value] ?? {
    src: '',
    position: '50% 50%',
  }
})
const profile = {
  name: 'Muhammad Miftahul Asyhar',

  aliases: ['Meep', 'Miftahul'],

  role: 'Software Engineer',

  location: 'Balikpapan, Indonesia',
photos: [
  {
    src: '/profile/profile-3.jpeg',
    position: '50% 30%',
  },
  {
    src: '/profile/profile-1.png',
    position: '50% 30%',
  },
  {
    src: '/profile/profile-2.jpg',
    position: '50% 20%',
  },
],

  socials: [
    {
      name: 'GitHub',
      icon: FeGithub,
      url: 'https://github.com/meeptaquelle',
    },
    {
      name: 'LinkedIn',
      icon: FeLinkedin,
      url: 'https://www.linkedin.com/in/muhammad-miftahul-asyhar-90bb05203/',
    },
    {
      name: 'Spotify',
      icon: FeMusic,
      url: 'https://open.spotify.com/user/asyharmiftahul123',
    },
    {
      name: 'Instagram',
      icon: FeInstagram,
      url: 'https://www.instagram.com/miptah.exe/',
    },
        {
      name: 'Threads',
      icon: FeAtSign,
      url: 'https://www.threads.com/@miptah.exe',
    },
      {
      name: 'Twitter/X',
      icon: FeTwitter,
      url: 'https://x.com/miftahasyhr',
    },

  ],
}

function nextPhoto() {
  currentPhoto.value = (currentPhoto.value + 1) % profile.photos.length
}

function previousPhoto() {
  currentPhoto.value =
    (currentPhoto.value - 1 + profile.photos.length) % profile.photos.length
}
</script>
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
<template>
  <section class="profile-widget">
    <!-- Profile -->
    <div class="profile-top">
      <!-- Photo -->
      <div class="profile-photo-wrapper">
        <div class="profile-photo">
<img
  :src="activePhoto.src"
  :style="{ objectPosition: activePhoto.position }"
  class="profile-photo"
  alt="Profile photo"
/>
          <button
            v-if="profile.photos.length > 1"
            type="button"
            class="photo-button photo-button-left"
            aria-label="Previous photo"
            @click="previousPhoto"
          >
            <FeChevronLeft />
          </button>

          <button
            v-if="profile.photos.length > 1"
            type="button"
            class="photo-button photo-button-right"
            aria-label="Next photo"
            @click="nextPhoto"
          >
            <FeChevronRight />
          </button>

          <span v-if="profile.photos.length > 1" class="photo-counter">
            {{ currentPhoto + 1 }} / {{ profile.photos.length }}
          </span>
        </div>

        <div v-if="profile.photos.length > 1" class="photo-dots">
          <button
            v-for="(_, index) in profile.photos"
            :key="index"
            type="button"
            class="photo-dot"
            :class="{ active: currentPhoto === index }"
            :aria-label="`View photo ${index + 1}`"
            @click="currentPhoto = index"
          />
        </div>
      </div>

      <!-- Identity -->
      <div class="profile-identity">
        <h2>{{ profile.name }}</h2>

        <div class="profile-aliases">
          <span v-for="alias in profile.aliases" :key="alias">
            {{ alias }}
          </span>
        </div>

        <p class="profile-role">
          {{ profile.role }}
        </p>

        <p class="profile-location">
          <FeMapPin />
          {{ profile.location }}
        </p>
      </div>
    </div>
    
<div>
  <p class="profile-social-label">Find me on:</p>
<nav class="profile-socials" aria-label="Social links">

  <a
    v-for="social in profile.socials"
    :key="social.name"
    :href="social.url"
    :aria-label="social.name"
    :title="social.name"
    target="_blank"
    rel="noopener noreferrer"
    class="social-link"
  >
    <component :is="social.icon" />
    <span>{{ social.name }}</span>
  </a>
</nav>
</div>
    <!-- Divider -->
    <div class="profile-divider"></div>

    <!-- About -->
    <section class="profile-about">
      <h3>About</h3>

      <p>
        Informatics graduate and
        <strong>software engineer</strong>
        based in
        <strong>Balikpapan</strong>.
        Proficient in building
        <strong>full-stack applications</strong> and occasionally 
        experimenting with new technologies
      </p>
    </section>
  </section>
</template>
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
<style scoped>
.profile-widget {
  width: 100%;
  box-sizing: border-box;
  padding: 24px;

  color: var(--color-text);
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-photo-wrapper {
  flex-shrink: 0;
}

.profile-photo {
  position: relative;

  width: 150px;
  height: 150px;

  overflow: hidden;

  border: 1px solid var(--color-border-light);
  border-radius: 14px;

  background: var(--color-surface-raised);
}

.profile-photo img {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;

  user-select: none;
  pointer-events: none;
}

.photo-button {
  position: absolute;
  top: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;

  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;

  background: rgba(0, 0, 0, 0.55);
  color: #ddd;

  transform: translateY(-50%);

  cursor: pointer;
  opacity: 0;

  transition:
    opacity 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.profile-photo:hover .photo-button {
  opacity: 1;
}

.photo-button:hover {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
}

.photo-button svg {
  width: 14px;
  height: 14px;
}

.photo-button-left {
  left: 8px;
}

.photo-button-right {
  right: 8px;
}

.photo-counter {
  position: absolute;
  right: 8px;
  bottom: 8px;

  padding: 3px 6px;

  border-radius: 5px;

  background: rgba(0, 0, 0, 0.6);
  color: #aaa;

  font-size: 9px;
}

.photo-dots {
  display: flex;
  justify-content: center;
  gap: 5px;

  margin-top: 8px;
}

.photo-dot {
  width: 5px;
  height: 5px;

  padding: 0;

  border: 0;
  border-radius: 50%;

  background: #444;

  cursor: pointer;

  transition:
    width 0.2s ease,
    background 0.2s ease;
}

.photo-dot.active {
  width: 14px;
  border-radius: 999px;
  background: var(--color-accent);
}

.profile-identity {
  min-width: 0;
}

.profile-identity h2 {
  margin: 0;

  color: var(--color-text);
  font-size: 21px;
  font-weight: 600;
  line-height: 1.3;
}

.profile-aliases {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  margin-top: 5px;
}

.profile-aliases span {
  color: var(--color-text-muted);
  font-size: 11px;
}

.profile-aliases span:not(:last-child)::after {
  content: '·';

  margin-left: 6px;

  color: var(--color-text-subtle);
}

.profile-role {
  margin: 16px 0 0;

  color: var(--color-accent);
  font-size: 13px;
  font-weight: 500;
}

.profile-location {
  display: flex;
  align-items: center;
  gap: 5px;

  margin: 5px 0 0;

  color: var(--color-text-muted);
  font-size: 11px;
}

.profile-location svg {
  width: 12px;
  height: 12px;
}

.profile-socials {
  display: flex;
  gap: 12px;
  margin-top: 5px;
}
.profile-social-section {
  margin-top: 22px;
}

.profile-social-label {
 margin-top: 22px;
  color: #777;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.social-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;

  width: 72px;
  height: 72px;
  padding: 0;

  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-muted);

  text-decoration: none;

  transition:
    color var(--transition-fast),
    border-color var(--transition-fast),
    background var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.social-link svg {
  width: 20px;
  height: 20px;
}

.social-link span {
  font-size: 9px;
  line-height: 1;
}

.social-link:hover {
  border-color: var(--color-border-light);
  background: var(--color-surface-hover);
  color: var(--color-text);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
}

.profile-divider {
  height: 1px;

  margin: 22px 0;

  background: var(--color-border);
}

.profile-about h3 {
  margin: 0 0 10px;

  color: var(--color-text-muted);

  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.profile-about p {
  max-width: 700px;

  margin: 0;

  color: var(--color-text-secondary);

  font-size: 12px;
  line-height: 1.7;
}

.profile-about strong {
  color: var(--color-text);
  font-weight: 500;
}

@media (max-width: 500px) {
  .profile-widget {
    padding: 18px;
  }

  .profile-top {
    align-items: flex-start;
    gap: 16px;
  }

  .profile-photo {
    width: 110px;
    height: 110px;
  }

  .profile-identity h2 {
    font-size: 17px;
  }

  .profile-role {
    margin-top: 12px;
  }

  .social-link span {
    display: none;
  }

  .social-link {
    width: 32px;
    height: 32px;

    justify-content: center;

    padding: 0;
  }
}
</style>