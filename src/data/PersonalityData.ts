import type { Component } from 'vue'
import {
  FeZap,
  FeTarget,
  FeActivity,
  FeHeart,
  FeMoon,
} from '@kalimahapps/vue-icons/fe'

export type PersonalityLevel = 'Low' | 'Neutral' | 'High'

export interface PersonalityFacet {
  id: string
  name: string
  score: number
  maxScore: number
  level: PersonalityLevel
  description: string
}

export interface PersonalityTrait {
  id: 'O' | 'C' | 'E' | 'A' | 'N'
  name: string
  score: number
  maxScore: number
  level: PersonalityLevel
  description: string
  facets: PersonalityFacet[]
}

export interface PersonalityCard {
  id: PersonalityTrait['id']
  phrase: string
  icon: Component
}

/* ------------------------------------------------------------------ */
/* Card row — one short hook per dimension, in OCEAN order.            */
/* ------------------------------------------------------------------ */

export const personalityCards: PersonalityCard[] = [
  { id: 'O', phrase: 'Curious & imaginative', icon: FeZap },
  { id: 'C', phrase: 'Careful, not consistent', icon: FeTarget },
  { id: 'E', phrase: 'Energetic, not social', icon: FeActivity },
  { id: 'A', phrase: 'Kind, slow to trust', icon: FeHeart },
  { id: 'N', phrase: 'Sensitive & self-aware', icon: FeMoon },
]
export interface ScoreBand {
  id: 'very-low' | 'low' | 'below-mid' | 'above-mid' | 'high' | 'very-high'
  min: number // inclusive, as fraction of max
  max: number // exclusive, as fraction of max
  color: string
  /** Same hue, lower-alpha version for backgrounds/tints. */
  tint: string
}

export const scoreBands: ScoreBand[] = [
  { id: 'very-low',  min: 0.00, max: 0.25, color: '#6e8299', tint: 'rgba(110, 130, 153, 0.14)' },
  { id: 'low',       min: 0.25, max: 0.50, color: '#7a8a9a', tint: 'rgba(122, 138, 154, 0.14)' },
  { id: 'below-mid', min: 0.45, max: 0.60, color: '#8f8f85', tint: 'rgba(154, 143, 122, 0.14)'  },  // ← new
{ id: 'above-mid', min: 0.60, max: 0.78, color: '#a5977a', tint: 'rgba(154, 143, 122, 0.14)'  },
  { id: 'high',      min: 0.75, max: 0.90, color: '#b89b5e', tint: 'rgba(184, 155, 94, 0.14)' },
  { id: 'very-high', min: 0.90, max: 1.01, color: '#d4b56a', tint: 'rgba(212, 181, 106, 0.16)' },
]

export function bandForScore(score: number, maxScore: number): ScoreBand {
  const pct = maxScore > 0 ? score / maxScore : 0
  return (
    scoreBands.find((b) => pct >= b.min && pct < b.max) ??
    scoreBands[scoreBands.length - 1]!
  )
}

/* ------------------------------------------------------------------ */
/* Overview — trimmed to three sentences, hidden behind a toggle.      */
/* ------------------------------------------------------------------ */

export const personalityOverview =
  "I'm highly <strong>curious, imaginative, and intellectually driven</strong>, with a strong " +
  "interest in ideas, creativity, and understanding how things work. I tend " +
  "to think deeply and approach things from different perspectives, while " +
  "being relatively open to questioning established ideas. Emotionally, I " +
  "run <strong>sensitive and self-conscious</strong>, which can make me prone to " +
  "overthinking, anxiety, and worrying about how I'm perceived by others. " +
  "I'm <strong>energetic and drawn to stimulation and excitement</strong>, but I'm not " +
  "particularly motivated by constant social interaction. I'm generally " +
  "<strong>compassionate, helpful, and modest</strong>, although I tend to remain skeptical " +
  "of other people's intentions. My main weakness is <strong>consistency</strong> — I can " +
  "be cautious and responsible, but I struggle with <strong>organization, " +
  "self-discipline, and maintaining motivation</strong> over the long term. Overall, " +
  "I tend to think deeply, feel strongly, and question things, but can struggle " +
  "to consistently turn those thoughts and intentions into sustained action.";

export const personalityDisclaimer =
  'Self-reported personality assessment. Results describe tendencies, not abilities or diagnoses.'

/* ------------------------------------------------------------------ */
/* Traits and facets                                                   */
/* ------------------------------------------------------------------ */

export const personalityTraits: PersonalityTrait[] = [
  {
    id: 'O',
    name: 'Openness',
    score: 102,
    maxScore: 120,
    level: 'High',
    description:
      'Curious, imaginative, and strongly interested in ideas, creativity, and aesthetics.',
    facets: [
      {
        id: 'imagination',
        name: 'Imagination',
        score: 20,
        maxScore: 20,
        level: 'High',
        description:
          'I tend to use imagination and fantasy to construct a richer mental world.',
      },
      {
        id: 'artistic-interests',
        name: 'Artistic Interests',
        score: 20,
        maxScore: 20,
        level: 'High',
        description:
          'I have a strong appreciation for art, aesthetics, and beauty.',
      },
      {
        id: 'emotionality',
        name: 'Emotionality',
        score: 17,
        maxScore: 20,
        level: 'High',
        description:
          'I tend to be aware of and connected to my own emotions.',
      },
      {
        id: 'adventurousness',
        name: 'Adventurousness',
        score: 9,
        maxScore: 20,
        level: 'Low',
        description:
          "I don't have a particularly strong need to seek unfamiliar experiences.",
      },
      {
        id: 'intellect',
        name: 'Intellect',
        score: 20,
        maxScore: 20,
        level: 'High',
        description:
          'I enjoy exploring ideas, abstract concepts, and intellectual problems.',
      },
      {
        id: 'liberalism',
        name: 'Liberalism',
        score: 16,
        maxScore: 20,
        level: 'High',
        description:
          'I am relatively willing to question conventions and established ideas.',
      },
    ],
  },

  {
    id: 'C',
    name: 'Conscientiousness',
    score: 61,
    maxScore: 120,
    level: 'Low',
    description:
      'Less naturally organized and self-disciplined, despite having a strong sense of duty and being cautious with decisions.',
    facets: [
      {
        id: 'self-efficacy',
        name: 'Self-Efficacy',
        score: 11,
        maxScore: 20,
        level: 'Low',
        description:
          'I may have less confidence in my ability to consistently accomplish things through my own drive and self-control.',
      },
      {
        id: 'orderliness',
        name: 'Orderliness',
        score: 9,
        maxScore: 20,
        level: 'Low',
        description:
          'I tend to be less naturally organized and less attached to routines, schedules, and structured systems.',
      },
      {
        id: 'dutifulness',
        name: 'Dutifulness',
        score: 13,
        maxScore: 20,
        level: 'High',
        description:
          'I have a relatively strong sense of duty and obligation.',
      },
      {
        id: 'achievement-striving',
        name: 'Achievement-Striving',
        score: 5,
        maxScore: 20,
        level: 'Low',
        description:
          'I have relatively little natural drive to pursue excellence, recognition, or ambitious achievement.',
      },
      {
        id: 'self-discipline',
        name: 'Self-Discipline',
        score: 6,
        maxScore: 20,
        level: 'Low',
        description:
          'I can have difficulty starting and persisting with unpleasant or difficult tasks.',
      },
      {
        id: 'cautiousness',
        name: 'Cautiousness',
        score: 17,
        maxScore: 20,
        level: 'High',
        description:
          'I tend to think through possibilities and consequences before making decisions.',
      },
    ],
  },

  {
    id: 'E',
    name: 'Extraversion',
    score: 74,
    maxScore: 120,
    level: 'High',
    description:
      'Energetic and stimulation-seeking, but not particularly driven by social connection or attention.',
    facets: [
      {
        id: 'friendliness',
        name: 'Friendliness',
        score: 11,
        maxScore: 20,
        level: 'Low',
        description:
          "I don't naturally reach out to people or form close relationships quickly.",
      },
      {
        id: 'gregariousness',
        name: 'Gregariousness',
        score: 12,
        maxScore: 20,
        level: 'Neutral',
        description:
          'I have a relatively balanced preference for social company versus privacy.',
      },
      {
        id: 'assertiveness',
        name: 'Assertiveness',
        score: 12,
        maxScore: 20,
        level: 'Neutral',
        description:
          'I am neither strongly inclined to take charge nor strongly inclined to stay out of group decisions.',
      },
      {
        id: 'activity-level',
        name: 'Activity Level',
        score: 15,
        maxScore: 20,
        level: 'High',
        description:
          'I tend to prefer a relatively active and fast-paced lifestyle.',
      },
      {
        id: 'excitement-seeking',
        name: 'Excitement-Seeking',
        score: 16,
        maxScore: 20,
        level: 'High',
        description:
          'I am relatively easily bored without stimulation and tend to seek excitement and novelty.',
      },
      {
        id: 'cheerfulness',
        name: 'Cheerfulness',
        score: 8,
        maxScore: 20,
        level: 'Low',
        description:
          'I am less prone to consistently experiencing energetic positive moods such as enthusiasm, optimism, and joy.',
      },
    ],
  },

  {
    id: 'A',
    name: 'Agreeableness',
    score: 85,
    maxScore: 120,
    level: 'High',
    description:
      'Compassionate, altruistic, and modest, while remaining relatively skeptical of other people.',
    facets: [
      {
        id: 'trust',
        name: 'Trust',
        score: 10,
        maxScore: 20,
        level: 'Low',
        description:
          "I tend to be skeptical of other people's intentions and do not readily assume that people are fair or trustworthy.",
      },
      {
        id: 'morality',
        name: 'Morality',
        score: 12,
        maxScore: 20,
        level: 'Neutral',
        description:
          'I have a relatively balanced tendency toward straightforwardness versus strategic social behavior.',
      },
      {
        id: 'altruism',
        name: 'Altruism',
        score: 19,
        maxScore: 20,
        level: 'High',
        description:
          'Helping other people tends to feel genuinely rewarding to me.',
      },
      {
        id: 'cooperation',
        name: 'Cooperation',
        score: 12,
        maxScore: 20,
        level: 'Neutral',
        description:
          'I have a relatively balanced tendency toward compromise and confrontation.',
      },
      {
        id: 'modesty',
        name: 'Modesty',
        score: 18,
        maxScore: 20,
        level: 'High',
        description:
          'I tend not to view myself as superior to other people or seek recognition of superiority.',
      },
      {
        id: 'sympathy',
        name: 'Sympathy',
        score: 14,
        maxScore: 20,
        level: 'High',
        description:
          "I tend to be emotionally affected by other people's suffering and respond with compassion.",
      },
    ],
  },

  {
    id: 'N',
    name: 'Neuroticism',
    score: 99,
    maxScore: 120,
    level: 'High',
    description:
      'Emotionally sensitive and prone to anxiety and self-consciousness, with relatively low anger and moderate stress vulnerability.',
    facets: [
      {
        id: 'anxiety',
        name: 'Anxiety',
        score: 20,
        maxScore: 20,
        level: 'High',
        description:
          'I tend to worry easily and may frequently anticipate that something could go wrong.',
      },
      {
        id: 'anger',
        name: 'Anger',
        score: 11,
        maxScore: 20,
        level: 'Low',
        description:
          'I do not tend to become angry or resentful easily when things go against me.',
      },
      {
        id: 'depression',
        name: 'Melancholy',
        score: 20,
        maxScore: 20,
        level: 'High',
        description:
          'I may be relatively prone to feelings of sadness, discouragement, or low energy.',
      },
      {
        id: 'self-consciousness',
        name: 'Self-Consciousness',
        score: 20,
        maxScore: 20,
        level: 'High',
        description:
          'I tend to be highly aware of how other people might perceive or judge me.',
      },
      {
        id: 'immoderation',
        name: 'Immoderation',
        score: 16,
        maxScore: 20,
        level: 'High',
        description:
          'I may experience strong cravings or impulses and can have difficulty resisting immediate rewards.',
      },
      {
        id: 'vulnerability',
        name: 'Vulnerability',
        score: 12,
        maxScore: 20,
        level: 'Neutral',
        description:
          'My tendency to become confused, helpless, or overwhelmed under pressure is relatively moderate.',
      },
    ],
  },
]