export type ExperienceType =
  | 'work'
  | 'education'
  | 'organization'
  | 'committee'
  | 'activity'

export type ExperienceStatus =
  | 'completed'
  | 'ongoing'

export interface Experience {
  id: string
  title: string
  organization: string
  description: string
  startYear: number
  endYear?: number
  type: ExperienceType
  attachments?: string[]
  status?: ExperienceStatus
}

export const types = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work' },
  { value: 'education', label: 'Education' },
  { value: 'organization', label: 'Organization' },
  { value: 'committee', label: 'Committee' },
  { value: 'activity', label: 'Activity' },
] as const
export const experiences: Experience[] = [
  // =========================
  // EDUCATION
  // =========================

  {
    id: 'sdit-cordova',
    title: 'Elementary School',
    organization: 'SDIT Cordova Samarinda',
    description: 'Completed elementary school education.',
    startYear: 2008,
    endYear: 2014,
    type: 'education',
  },

  {
    id: 'mts-assalaam',
    title: 'Junior High School',
    organization: 'MTs PPMI Assalaam Sukoharjo',
    description: 'Completed junior high school education.',
    startYear: 2014,
    endYear: 2017,
    type: 'education',
  },

  {
    id: 'smk-assalaam',
    title: 'Vocational High School',
    organization: 'SMK PPMI Assalaam Sukoharjo',
    description: 'Major: Computer and Network Engineering (TKJ).',
    startYear: 2017,
    endYear: 2020,
    type: 'education',
  },

  {
    id: 'itk',
    title: 'Bachelor of Informatics',
    organization: 'Institut Teknologi Kalimantan',
    description: 'Major: Informatics. Final GPA: 3.04.',
    startYear: 2020,
    endYear: 2026,
    type: 'education',
  },

  // =========================
  // ORGANIZATION
  // =========================

  {
    id: 'osis-mts-assalaam',
    title: 'OSIS',
    organization: 'MTs PPMI Assalaam',
    description: 'Participated in the student council organization.',
    startYear: 2016,
    type: 'organization',
  },

  {
    id: 'al-qolam',
    title: 'Editorial Team',
    organization: 'Al-Qolam — PPMI Assalaam',
    description: 'Contributed to the school magazine editorial team.',
    startYear: 2016,
    type: 'organization',
  },

  {
    id: 'op3mia',
    title: 'OP3MIA',
    organization: 'PPMI Assalaam',
    description: 'Participated as a member of OP3MIA.',
    startYear: 2018,
    type: 'organization',
  },

  {
    id: 'karnisa',
    title: 'Editorial Team',
    organization: 'Karnisa — PPMI Assalaam',
    description: 'Contributed to the school magazine editorial team.',
    startYear: 2018,
    type: 'organization',
  },

  {
    id: 'matrix',
    title: 'Editorial Team',
    organization: 'Matrix — SMK PPMI Assalaam',
    description: 'Contributed to the school magazine editorial team.',
    startYear: 2018,
    type: 'organization',
  },

  {
    id: 'hmif-magang',
    title: 'Staff — Human Resources Development',
    organization: 'Himpunan Mahasiswa Informatika — Institut Teknologi Kalimantan',
    description: 'Staff magang in the Human Resources Development division.',
    startYear: 2021,
    type: 'organization',
  },

  {
    id: 'hmif-pnp',
    title: 'Staff — Research and Development',
    organization: 'Himpunan Mahasiswa Informatika — Institut Teknologi Kalimantan',
    description: 'Staff member in the PNP (Penelitian dan Pengembangan) division.',
    startYear: 2022,
    type: 'organization',
  },

  {
    id: 'hmif-pmb',
    title: 'Department Secretary',
    organization: 'Himpunan Mahasiswa Informatika — Institut Teknologi Kalimantan',
    description: 'Secretary of the Minat dan Bakat development department.',
    startYear: 2023,
    type: 'organization',
  },

  // =========================
  // WORK
  // =========================

  {
    id: 'surveyor-umkm',
    title: 'UMKM Surveyor',
    organization: 'Balikpapan',
    description: 'Freelance surveyor for UMKM data collection.',
    startYear: 2022,
    type: 'work',
  },

  {
    id: 'uniba-internship',
    title: 'IT Intern',
    organization: 'Universitas Balikpapan',
    description:
      'Contributed to the development of a finance management website, including database management and CRUD functionality.',
    startYear: 2025,
    type: 'work',
  },

  {
    id: 'bci-internship',
    title: 'Software Engineer Intern',
    organization: 'PT. Bahana Cipta Internusa',
    description:
      'Contributed to the development of the Membahana ERP system, implementing unfinished modules, fixing bugs, and making feature changes based on development tickets.',
    startYear: 2026,
    type: 'work',
  },
]