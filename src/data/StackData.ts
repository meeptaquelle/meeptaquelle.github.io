import { BsFiletypeSql, SiDbeaver, SiExpress, SiMysql, SiPostman } from '@kalimahapps/vue-icons'
import type { Component } from 'vue'
import {
  BiLogoPython,
  BiLogoVuejs,
  BiLogoReact,
  BiLogoPhp,
  BiLogoJavascript,
  BiLogoFlutter,
  BiLogoDjango,
  BiLogoTypescript,
  BiLogoGoLang,
  BiLogoTailwindCss,
  BiLogoGithub,
  BiLogoDocker,
  BiLogoUnity,
} from 'vue-icons-plus/bi'
import { DiDart } from 'vue-icons-plus/di'

import { 
    FaLaravel,
    FaNode,
} from 'vue-icons-plus/fa'
 

export type StackCategory =
  | 'languages'
  | 'frameworks'
  | 'databases'
  | 'tools'
  | 'other'

export interface StackItem {
  id: string
  name: string
  category: StackCategory
  icon: Component
  description: string
}

export interface StackGroup {
  value: StackCategory
  label: string
  items: StackItem[]
}


export const stack: StackGroup[] = [
  {
    value: 'languages',
    label: 'Languages',
    items: [
      {
  id: 'go',
  name: 'Go',
  category: 'languages',
  icon: BiLogoGoLang,
  description: 'A statically typed language designed for simple, efficient, and scalable software.',
},
{
  id: 'python',
  name: 'Python',
  category: 'languages',
  icon: BiLogoPython,
  description: 'A high-level language commonly used for web development, automation, data, and machine learning.',
},
{
  id: 'typescript',
  name: 'TypeScript',
  category: 'languages',
  icon: BiLogoTypescript,
  description: 'A typed superset of JavaScript that adds static type checking for more reliable applications.',
},
{
  id: 'javascript',
  name: 'JavaScript',
  category: 'languages',
  icon: BiLogoJavascript,
  description: 'A programming language widely used to build interactive web applications and backend services.',
},
{
  id: 'php',
  name: 'PHP',
  category: 'languages',
  icon: BiLogoPhp,
  description: 'A server-side scripting language widely used for web development and backend applications.',
},
{
  id: 'dart',
  name: 'Dart',
  category: 'languages',
  icon: DiDart,
  description: 'A client-optimized language used primarily for building applications with Flutter.',
},
{
  id: 'sql',
  name: 'SQL',
  category: 'languages',
  icon: BsFiletypeSql,
  description: 'A language used to query, manage, and manipulate data in relational databases.',
},
    ],
  },

  {
    value: 'frameworks',
    label: 'Frameworks & Libraries',
    items: [
      {
  id: 'laravel',
  name: 'Laravel',
  category: 'frameworks',
  icon: FaLaravel,
  description: 'A PHP framework for building structured web applications and backend APIs.',
},
{
  id: 'vue',
  name: 'Vue',
  category: 'frameworks',
  icon: BiLogoVuejs,
  description: 'A progressive JavaScript framework for building reactive and component-based user interfaces.',
},
{
  id: 'react',
  name: 'React',
  category: 'frameworks',
  icon: BiLogoReact,
  description: 'A JavaScript library for building user interfaces from reusable components.',
},
{
  id: 'node',
  name: 'Node.js',
  category: 'frameworks',
  icon: FaNode,
  description: 'A JavaScript runtime for running server-side applications outside the browser.',
},
{
  id: 'express',
  name: 'Express',
  category: 'frameworks',
  icon: SiExpress,
  description: 'A lightweight Node.js framework commonly used for building web servers and REST APIs.',
},
{
  id: 'django',
  name: 'Django',
  category: 'frameworks',
  icon: BiLogoDjango,
  description: 'A Python web framework designed for building secure and maintainable web applications quickly.',
},
{
  id: 'tailwind',
  name: 'Tailwind CSS',
  category: 'frameworks',
  icon: BiLogoTailwindCss,
  description: 'A utility-first CSS framework for rapidly building custom user interfaces.',
},
{
  id: 'flutter',
  name: 'Flutter',
  category: 'frameworks',
  icon: BiLogoFlutter,
  description: 'A UI toolkit for building cross-platform applications from a single Dart codebase.',
},
    ],
  },

  {
    value: 'databases',
    label: 'Databases',
    items: [
{
  id: 'mysql',
  name: 'MySQL',
  category: 'databases',
  icon: SiMysql,
  description: 'A popular relational database system used for storing and managing structured application data.',
},
    ],
  },

  {
    value: 'tools',
    label: 'Tools',
    items: [
{
  id: 'docker',
  name: 'Docker',
  category: 'tools',
  icon: BiLogoDocker,
  description: 'A platform for packaging applications and their dependencies into portable containers.',
},
{
  id: 'postman',
  name: 'Postman',
  category: 'tools',
  icon: SiPostman,
  description: 'A tool for developing, testing, and documenting APIs and HTTP requests.',
},
{
  id: 'dbeaver',
  name: 'DBeaver',
  category: 'tools',
  icon: SiDbeaver,
  description: 'A database management tool for working with and exploring different database systems.',
},
{
  id: 'github',
  name: 'GitHub',
  category: 'tools',
  icon: BiLogoGithub,
  description: 'A platform for hosting Git repositories, collaborating on code, and managing development projects.',
},
    ],
  },

  {
    value: 'other',
    label: 'Other',
    items: [
      {
        id: 'unity',
        name: 'Unity',
        category: 'other',
        icon: BiLogoUnity,
        description: 'Game Engine for building games'
      },
    ],
  },
]