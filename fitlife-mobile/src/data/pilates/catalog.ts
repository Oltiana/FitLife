import type { ImageSourcePropType } from 'react-native';
import type { PilatesWorkout } from '../../domain/PilatesDomainTypes';
import type { PilatesProgram } from '../../domain/PilatesProgramTypes';

export const pilatesImageAssets: ImageSourcePropType[] = [
  require('../../../images/pilates-images/1dd9cb26fd86fff0f8bc38878c2bb92f.jpg'),
  require('../../../images/pilates-images/2aa35f5ad90464621f3fd3218d9662b9.jpg'),
  require('../../../images/pilates-images/42d9c8f71abf07551738af9d44b2dad6.jpg'),
  require('../../../images/pilates-images/64d20176202d15d25f3df24f8e1dd86d.jpg'),
  require('../../../images/pilates-images/91f99bbe3c52ea68e56865489edc7576.jpg'),
  require('../../../images/pilates-images/9d8c9ec1615cff110e566fbbbd6c9e5c.jpg'),
  require('../../../images/pilates-images/9d8fa8f3a43fcd83863207db37738263.jpg'),
  require('../../../images/pilates-images/a0423fc50164c4af8913dac8d915d7cd.jpg'),
  require('../../../images/pilates-images/a6ac00cd6c2d066e85390903007d49b4.jpg'),
  require('../../../images/pilates-images/b863db576f964f80f636536ae8db1e9c.jpg'),
  require('../../../images/pilates-images/dc1c685edbed1dc99b336ee542ba6013.jpg'),
];

const P = pilatesImageAssets;

export const pilatesCatalog: PilatesWorkout[] = [
  {
    id: 'core-fundamentals',
    pilatesProgramId: 'core-fundamentals',
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
    pilatesProgramId: 'power-flow',
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
    pilatesProgramId: 'deep-stretch',
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

export function getCatalogWorkoutById(id: string): PilatesWorkout | undefined {
  return pilatesCatalog.find((w) => w.id === id);
}

export function findCatalogByProgramName(name: string): PilatesWorkout | undefined {
  const key = name.trim().toLowerCase();
  return pilatesCatalog.find((c) => c.title.trim().toLowerCase() === key);
}

export function findCatalogByProgram(program: PilatesProgram): PilatesWorkout | undefined {
  return findCatalogByProgramName(program.name);
}
