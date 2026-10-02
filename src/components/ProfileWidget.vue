<script setup lang="ts">
const profile = {
  name: 'Muhammad Miftahul Asyhar',
  role: 'Software Engineer',
  location: 'Balikpapan, Indonesia',

  summary:
    'Informatics graduate proficient in the software development life cycle, with hands-on experience in software development, system analysis, UI/UX design, and full-stack development. Experienced in building a finance database management website during a six-month internship at Universitas Balikpapan, and currently contributing to ERP development and bug fixes at PT. Bahana Cipta Internusa.',

  education: [
    {
      institution: 'Assalaam Boarding School',
      period: '2014 — 2020',
    },
    {
      institution: 'Institut Teknologi Kalimantan',
      period: '2020 — 2026',
      degree: 'Bachelor of Informatics',
      detail: 'GPA 3.04',
    },
  ],

  experience: [
    {
      role: 'Software Developer Intern',
      company: 'Universitas Balikpapan',
      period: '2025',
      description:
        'Developed a finance database management website over a six-month internship, covering use case and ERD design, UI/UX, and full-stack development.',
    },
    {
      role: 'Programmer Intern',
      company: 'PT. Bahana Cipta Internusa',
      period: '2026 — Present',
      description:
        'Contributing to ERP development through feature implementation, bug fixes, and ongoing software development tasks.',
    },
  ],

  skills: {
    frontend: ['Vue.js', 'React.js'],
    backend: ['Go', 'Laravel', 'Node.js / Express'],
    database: ['MySQL', 'Google Sheets'],
    tools: ['Git', 'Docker', 'Postman', 'DBeaver'],
  },
}
</script>

<template>
  <section class="profile-widget">
    <!-- Profile Header -->
    <header class="profile-header">
      <div class="profile-avatar">M</div>

      <div class="profile-heading">
        <h2>{{ profile.name }}</h2>
        <p>{{ profile.role }}</p>
        <span>{{ profile.location }}</span>
      </div>
    </header>

    <!-- Summary -->
    <section class="profile-section">
      <h3>Summary</h3>

      <p class="summary">
        {{ profile.summary }}
      </p>
    </section>

    <!-- Education -->
    <section class="profile-section">
      <h3>Education</h3>

      <div class="timeline">
        <article
          v-for="education in profile.education"
          :key="`${education.institution}-${education.period}`"
          class="timeline-item"
        >
          <div class="timeline-marker"></div>

          <div class="timeline-content">
            <div class="timeline-header">
              <strong>{{ education.institution }}</strong>
              <span>{{ education.period }}</span>
            </div>

            <p v-if="education.degree">
              {{ education.degree }}
            </p>

            <small v-if="education.detail">
              {{ education.detail }}
            </small>
          </div>
        </article>
      </div>
    </section>

    <!-- Work Experience -->
    <section class="profile-section">
      <h3>Work Experience</h3>

      <div class="experience-list">
        <article
          v-for="experience in profile.experience"
          :key="`${experience.company}-${experience.role}`"
          class="experience-item"
        >
          <div class="experience-header">
            <div>
              <strong>{{ experience.role }}</strong>
              <span>{{ experience.company }}</span>
            </div>

            <small>{{ experience.period }}</small>
          </div>

          <p>
            {{ experience.description }}
          </p>
        </article>
      </div>
    </section>

    <!-- Skills -->
    <section class="profile-section">
      <h3>Skills</h3>

      <div class="skills">
        <div v-for="(items, category) in profile.skills" :key="category" class="skill-group">
          <span class="skill-category">
            {{ category }}
          </span>

          <div class="skill-list">
            <span v-for="skill in items" :key="skill" class="skill">
              {{ skill }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.profile-widget {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  color: #fff;
}

/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

.profile-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.profile-avatar {
  width: 56px;
  height: 56px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #444;
  border-radius: 50%;

  background: #181818;
  color: #fff;

  font-size: 20px;
  font-weight: 600;
}

.profile-heading {
  min-width: 0;
}

.profile-heading h2 {
  margin: 0;

  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.profile-heading p {
  margin: 3px 0 0;

  color: #aaa;
  font-size: 12px;
}

.profile-heading span {
  display: block;
  margin-top: 3px;

  color: #666;
  font-size: 11px;
}

/*
|--------------------------------------------------------------------------
| Sections
|--------------------------------------------------------------------------
*/

.profile-section {
  padding: 18px 0;
  border-top: 1px solid #222;
}

.profile-section h3 {
  margin: 0 0 12px;

  color: #777;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

.summary {
  margin: 0;

  color: #aaa;
  font-size: 12px;
  line-height: 1.65;
}

/*
|--------------------------------------------------------------------------
| Timeline
|--------------------------------------------------------------------------
*/

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.timeline-marker {
  width: 7px;
  height: 7px;
  flex-shrink: 0;

  margin-top: 5px;

  border: 1px solid #777;
  border-radius: 50%;
  background: #222;
}

.timeline-content {
  min-width: 0;
  flex: 1;
}

.timeline-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.timeline-header strong {
  color: #ddd;
  font-size: 12px;
  font-weight: 500;
}

.timeline-header span {
  flex-shrink: 0;

  color: #555;
  font-size: 10px;
}

.timeline-content p {
  margin: 4px 0 0;

  color: #888;
  font-size: 11px;
}

.timeline-content small {
  display: block;
  margin-top: 3px;

  color: #666;
  font-size: 10px;
}

/*
|--------------------------------------------------------------------------
| Experience
|--------------------------------------------------------------------------
*/

.experience-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.experience-item {
  padding: 12px;

  border: 1px solid #222;
  border-radius: 10px;

  background: #141414;
}

.experience-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.experience-header strong,
.experience-header span {
  display: block;
}

.experience-header strong {
  color: #ddd;
  font-size: 12px;
  font-weight: 500;
}

.experience-header span {
  margin-top: 3px;

  color: #777;
  font-size: 11px;
}

.experience-header small {
  flex-shrink: 0;

  color: #555;
  font-size: 10px;
}

.experience-item p {
  margin: 10px 0 0;

  color: #888;
  font-size: 11px;
  line-height: 1.55;
}

/*
|--------------------------------------------------------------------------
| Skills
|--------------------------------------------------------------------------
*/

.skills {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.skill-category {
  width: 65px;
  flex-shrink: 0;

  padding-top: 4px;

  color: #666;
  font-size: 10px;
  text-transform: capitalize;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.skill {
  padding: 4px 7px;

  border: 1px solid #292929;
  border-radius: 6px;

  background: #161616;
  color: #aaa;

  font-size: 10px;
}

/*
|--------------------------------------------------------------------------
| Small screens
|--------------------------------------------------------------------------
*/

@media (max-width: 500px) {
  .profile-widget {
    padding: 16px;
  }

  .timeline-header,
  .experience-header {
    flex-direction: column;
    gap: 3px;
  }

  .skill-group {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
```
