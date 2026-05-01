import type { PilatesWorkout } from '../domain/PilatesDomainTypes';
import { pilatesImageAssets as P } from './pilatesImageAssets';

export const pilatesCatalog: PilatesWorkout[] = [
  {
    id: 'core-fundamentals',
    title: 'Core Fundamentals',
    level: 'beginner',
    category: 'core',
    estimatedMinutes: 18,
    description:
      'Foundation moves for deep core activation, breathing, and neutral spine — ideal to start the day.',
    coverImage: P[3],
    exercises: [
      {
        id: 'cf-1',
        name: 'Breathing & imprint',
        description:
          'Lie supine, knees bent. Inhale wide into ribs; exhale and gently imprint lower back toward the mat.',
        durationSec: 60,
        image: P[1],
        imageCropPosition: 'center',
      },
      {
        id: 'cf-2',
        name: 'Dead bug prep',
        description:
          'Arms to ceiling, knees at table-top. Alternate lowering opposite arm and leg with control.',
        durationSec: 90,
        image: P[2],
        imageCropPosition: 'center',
      },
      {
        id: 'cf-3',
        name: 'Single-leg stretch',
        description:
          'Head and shoulders lifted if comfortable. Pull one knee in, extend the other leg long at hip height.',
        durationSec: 60,
        image: P[7],
        imageCropPosition: 'center',
      },
      {
        id: 'cf-4',
        name: 'Bridge articulation',
        description:
          'Peel spine up vertebra by vertebra, then roll down with control. Keep knees aligned over ankles.',
        durationSec: 120,
        image: P[6],
        imageCropPosition: 'center',
      },
      {
        id: 'cf-5',
        name: 'Side-lying clams',
        description:
          'Stack hips and shoulders. Open top knee without rolling the pelvis backward.',
        durationSec: 90,
        image: P[4],
        imageCropPosition: 'left',
      },
    ],
  },
  {
    id: 'power-flow',
    title: 'Power Flow',
    level: 'intermediate',
    category: 'strength',
    estimatedMinutes: 28,
    description:
      'Dynamic sequences linking strength and control — expect plank variations and spinal mobility.',
    coverImage: P[5],
    exercises: [
      {
        id: 'pf-1',
        name: 'Plank hold',
        description:
          'Shoulders over wrists, long line from head to heels. Breathe steadily; soften grip on the floor.',
        durationSec: 45,
        image: P[5],
        imageCropPosition: 'center',
      },
      {
        id: 'pf-2',
        name: 'Forearm plank rocks',
        description:
          'Minimal shift forward and back from forearms. Keep ribs knitted, hips level.',
        durationSec: 60,
        image: P[6],
        imageCropPosition: 'center',
      },
      {
        id: 'pf-3',
        name: 'Spine stretch forward',
        description:
          'Seated, legs hip-width. Round forward from head, articulating through the spine.',
        durationSec: 75,
        image: P[7],
        imageCropPosition: 'top',
      },
      {
        id: 'pf-4',
        name: 'Swimming prep',
        description:
          'Prone, arms long. Lift chest slightly; alternate small arm and leg reaches.',
        durationSec: 90,
        image: P[8],
        imageCropPosition: 'center',
      },
      {
        id: 'pf-5',
        name: 'Side plank (modified)',
        description:
          'Forearm or hand support, hips stacked. Hold or add a controlled hip lift.',
        durationSec: 45,
        image: P[9],
        imageCropPosition: 'right',
      },
      {
        id: 'pf-6',
        name: 'Roll-down to half roll-back',
        description:
          'Seated tall. Nod chin, peel back to mid-back, then return with breath.',
        durationSec: 90,
        image: P[10],
        imageCropPosition: 'center',
      },
    ],
  },
  {
    id: 'deep-stretch',
    title: 'Deep Stretch & Restore',
    level: 'advanced',
    category: 'mobility',
    estimatedMinutes: 22,
    description:
      'Longer holds and gentle mobility to release hips, thoracic spine, and neck tension.',
    coverImage: P[4],
    exercises: [
      {
        id: 'ds-1',
        name: 'Cat–cow',
        description:
          'Hands under shoulders, knees under hips. Flex and extend the spine slowly.',
        durationSec: 100,
        image: P[1],
        imageCropPosition: 'center',
      },
      {
        id: 'ds-2',
        name: 'Child’s pose variation',
        description:
          'Knees wide, arms forward or alongside. Breathe into upper back expansion.',
        durationSec: 130,
        image: P[2],
        imageCropPosition: 'top',
      },
      {
        id: 'ds-3',
        name: 'Figure-four stretch',
        description:
          'Supine, ankle over opposite knee. Draw thigh gently toward you for glute/hip release.',
        durationSec: 90,
        image: P[7],
        imageCropPosition: 'center',
      },
      {
        id: 'ds-4',
        name: 'Supine twist',
        description:
          'Knees together, drop to one side; switch. Keep shoulders grounded if possible.',
        durationSec: 40,
        image: P[10],
        imageCropPosition: 'center',
      },
    ],
  },
];

export function getWorkoutById(id: string): PilatesWorkout | undefined {
  return pilatesCatalog.find((w) => w.id === id);
}
