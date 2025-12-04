export type MuscleKey =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'legs'
  | 'glutes'

export const muscleGroups: Record<
  MuscleKey,
  {
    name: string
    description: string
    functions: string[]
    exercises: string[]
    location: string
  }
> = {
  chest: {
    name: 'Chest',
    description:
      'The chest muscles, primarily the pectoralis major and minor, are responsible for pushing movements and arm adduction.',
    functions: ['Pushing movements', 'Arm adduction', 'Shoulder flexion'],
    exercises: ['Bench Press', 'Push-ups', 'Chest Flyes', 'Dips'],
    location: 'Front upper torso'
  },
  back: {
    name: 'Back',
    description:
      'The back muscles include the latissimus dorsi, rhomboids, and trapezius. They are crucial for pulling movements and posture.',
    functions: ['Pulling movements', 'Posture support', 'Shoulder retraction'],
    exercises: ['Pull-ups', 'Rows', 'Deadlifts', 'Lat Pulldowns'],
    location: 'Posterior torso'
  },
  shoulders: {
    name: 'Shoulders',
    description:
      'The deltoids are the primary shoulder muscles, responsible for arm abduction, flexion, and extension.',
    functions: ['Arm abduction', 'Shoulder flexion', 'Shoulder extension'],
    exercises: ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes'],
    location: 'Upper arm connection to torso'
  },
  biceps: {
    name: 'Biceps',
    description:
      'The biceps brachii are located on the front of the upper arm and are responsible for elbow flexion and forearm supination.',
    functions: ['Elbow flexion', 'Forearm supination', 'Shoulder flexion'],
    exercises: ['Bicep Curls', 'Hammer Curls', 'Chin-ups', 'Cable Curls'],
    location: 'Front of upper arm'
  },
  triceps: {
    name: 'Triceps',
    description:
      'The triceps brachii are located on the back of the upper arm and are responsible for elbow extension.',
    functions: ['Elbow extension', 'Arm extension'],
    exercises: ['Tricep Dips', 'Overhead Extension', 'Close-grip Bench Press', 'Tricep Pushdowns'],
    location: 'Back of upper arm'
  },
  abs: {
    name: 'Abdominals',
    description:
      'The abdominal muscles, including the rectus abdominis and obliques, provide core stability and trunk flexion.',
    functions: ['Core stability', 'Trunk flexion', 'Rotation'],
    exercises: ['Crunches', 'Planks', 'Leg Raises', 'Russian Twists'],
    location: 'Front of torso, between chest and pelvis'
  },
  legs: {
    name: 'Legs',
    description:
      'The leg muscles include quadriceps, hamstrings, glutes, and calves. They are the largest muscle group and essential for movement.',
    functions: ['Walking', 'Running', 'Jumping', 'Squatting'],
    exercises: ['Squats', 'Lunges', 'Leg Press', 'Deadlifts'],
    location: 'Lower body from hips to feet'
  },
  glutes: {
    name: 'Glutes',
    description:
      'The gluteal muscles (gluteus maximus, medius, minimus) are the largest muscles in the body, responsible for hip extension and stabilization.',
    functions: ['Hip extension', 'Hip abduction', 'Posture support'],
    exercises: ['Squats', 'Hip Thrusts', 'Lunges', 'Glute Bridges'],
    location: 'Buttocks area'
  }
}


