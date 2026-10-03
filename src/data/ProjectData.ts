export type ProjectCategory =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'mobile'
  | 'iot'
  | 'machine-learning'
  | 'game-development'
  | 'devops'

export type ProjectType = 'work'  | 'college' | 'personal'

export type ProjectStatus = 'completed' | 'ongoing' | 'archived'

export interface Project {
  id: string
  name: string
  description: string
  year: number

  category: ProjectCategory
  type: ProjectType

  tools: string[]

  link?: string
  repository?: string

  status?: ProjectStatus
}

export const categories = [
  { value: 'all', label: 'All' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'iot', label: 'IoT' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'game-development', label: 'Game Development' },
  { value: 'devops', label: 'DevOps' },
] as const

export const types = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work' },
  { value: 'internship', label: 'Internship' },
  { value: 'college', label: 'College' },
  { value: 'thesis', label: 'Thesis' },
  { value: 'personal', label: 'Personal' },
  { value: 'freelance', label: 'Freelance' },
] as const

export const projects: Project[] = [
  {
    id: 'membahana',
    name: 'Membahana ERP',
    description:
      'Enterprise resource planning system development, contributing to unfinished modules, feature implementation, bug fixes, and changes based on development tickets.',
    year: 2026,
    category: 'fullstack',
    type: 'work',
    tools: ['Vue.js', 'Laravel', 'MySQL', 'Git', 'Postman'],
    status: 'ongoing',
  },

  {
    id: 'finance-management',
    name: 'Finance Management System',
    description:
      'Finance database management website developed during a six-month internship, including database management and CRUD functionality.',
    year: 2025,
    category: 'fullstack',
    type: 'work',
    tools: ['Vue.js', 'Tailwind CSS', 'MySQL', 'Git'],
    status: 'completed',
  },

  {
    id: 'ghost-ai',
    name: 'Ghost AI System',
    description:
      'Horror game AI system using Finite State Machine and Multi-Agent System to model coordinated ghost behavior.',
    year: 2026,
    category: 'game-development',
    type: 'college',
    tools: ['Unity', 'C#', 'NavMesh', 'FSM', 'Multi-Agent System'],
    status: 'completed',
  },

  {
    id: 'speech-helper',
    name: 'Speech Helper',
    description:
      'Mobile application providing text-to-speech and soundboard functionality with local data storage.',
    year: 2024,
    category: 'mobile',
    type: 'college',
    tools: ['Flutter', 'Dart', 'SQLite'],
    status: 'completed',
  },

  {
    id: 'smart-home-security',
    name: 'Smart Home Security System',
    description:
      'IoT security prototype that detects movement and sends notifications through Telegram.',
    year: 2024,
    category: 'iot',
    type: 'personal',
    tools: ['ESP32', 'PIR Sensor', 'Buzzer', 'Telegram Bot', 'Wokwi'],
    status: 'completed',
  },
]
