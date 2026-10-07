export type ProjectCategory =

  | 'web'
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
  attachments?: string[]
  status?: ProjectStatus
}

export const categories = [
  { value: 'all', label: 'All' },
  { value: 'web', label: 'Website' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'iot', label: 'IoT' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'game-development', label: 'Game Development' },
  { value: 'devops', label: 'DevOps' },
] as const

export const types = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work Project' },
  { value: 'college', label: 'College Project' },
  { value: 'personal', label: 'Personal Project' },
] as const

export const projects: Project[] = [
  {
    id: 'membahana',
    name: 'Membahana ERP',
    description:
      'Enterprise resource planning system development, contributing to unfinished modules, feature implementation, bug fixes, and changes based on development tickets.',
    year: 2026,
    category: 'web',
    type: 'work',
    attachments: ['/projects/project-1.png'],
    link: 'https://membahana.com/',
    tools: ['React.js', 'Laravel', 'MySQL', 'Github', 'Postman'],
    status: 'ongoing',
  },

  {
    id: 'finance-management',
    name: 'Finance Management System',
    description:
      'Finance database management website developed during a six-month internship, including database management and CRUD functionality.',
    year: 2025,
    category: 'web',
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
    type: 'college',
    tools: ['ESP32', 'PIR Sensor', 'Buzzer', 'Telegram Bot', 'Wokwi'],
    status: 'completed',
  },
  {
  id: 'unsupervised-anomaly-detection',
  name: 'Unsupervised Anomaly Detection',
  description:
    'Unsupervised anomaly detection system using a noise-filtered and tail-aware memory bank approach, evaluated on the MVTec AD dataset.',
  year: 2026,
  category: 'machine-learning',
  type: 'college',
  link: 'https://github.com/meeptaquelle/anomaly-detection',
  tools: ['Python', 'WideResNet-50', 'MVTec AD'],
  status: 'completed',
},

{
  id: 'oil-palm-ripeness',
  name: 'Oil Palm Ripeness Classification',
  description:
    'Deep learning model for classifying oil palm fruit ripeness using MobileNetV2, with image preprocessing, data augmentation, and fine-tuning.',
  year: 2025,
  category: 'machine-learning',
  type: 'college',
  link: 'https://colab.research.google.com/drive/12o0jfPPrzWmsqp7-uWfl3dA5v5L0U1M4',
  tools: [
    'Python',
    'TensorFlow',
    'Keras',
    'MobileNetV2',
    'Scikit-learn',
  ],
  status: 'completed',
},

{
  id: 'brain-tumor-detection',
  name: 'Brain Tumor Detection using Otsu Thresholding',
  description:
    'Digital image processing pipeline for detecting and localizing potential brain tumor regions from MRI images using image enhancement, Otsu thresholding, and connected component analysis.',
  year: 2023,
  category: 'machine-learning',
  type: 'college',
  link: 'https://colab.research.google.com/drive/1nlSIeD9us6Y-93zjQYQp9oG25Z6yXOkB',
  tools: [
    'Python',
    'OpenCV',
    'NumPy',
    'Matplotlib',
    'scikit-image',
  ],
  status: 'completed',
},
  {
    id: 'tracer-study',
    name: 'Tracer Study Website',
    description:
      'Tracer study web application developed throughout the software development lifecycle, including requirements planning, system design, implementation, testing, and final presentation.',
    year: 2025,
    category: 'web',
    type: 'college',
    tools: ['Django', 'REST API'],
    status: 'completed',
  },
]
