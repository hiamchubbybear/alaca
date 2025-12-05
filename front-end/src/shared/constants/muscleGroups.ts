export type MuscleKey = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'abs' | 'legs' | 'glutes'

export type MuscleGroup = {
  name: string
  description: string
  functions: string[]
  exercises: string[]
  location: string
}

export const muscleGroups: Record<MuscleKey, MuscleGroup> = {
  chest: {
    name: 'Ngực',
    description:
      'Các cơ ngực, chủ yếu là cơ ngực lớn và cơ ngực nhỏ, chịu trách nhiệm cho các chuyển động đẩy và khép cánh tay.',
    functions: ['Chuyển động đẩy', 'Khép cánh tay', 'Gập vai'],
    exercises: ['Bench Press', 'Chống đẩy', 'Chest Flyes', 'Dips'],
    location: 'Phần trên ngực phía trước'
  },
  back: {
    name: 'Lưng',
    description:
      'Các cơ lưng bao gồm cơ lưng xô, cơ thoi và cơ thang. Chúng rất quan trọng cho các chuyển động kéo và tư thế.',
    functions: ['Chuyển động kéo', 'Hỗ trợ tư thế', 'Co vai lại'],
    exercises: ['Pull-ups', 'Rows', 'Deadlifts', 'Lat Pulldowns'],
    location: 'Thân sau'
  },
  shoulders: {
    name: 'Vai',
    description: 'Cơ delta là cơ vai chính, chịu trách nhiệm cho việc dạng cánh tay, gập và duỗi.',
    functions: ['Dạng cánh tay', 'Gập vai', 'Duỗi vai'],
    exercises: ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Flyes'],
    location: 'Điểm nối cánh tay với thân'
  },
  biceps: {
    name: 'Cơ nhị đầu',
    description:
      'Cơ nhị đầu cánh tay nằm ở phía trước cánh tay trên và chịu trách nhiệm cho việc gập khuỷu tay và xoay cẳng tay.',
    functions: ['Gập khuỷu tay', 'Xoay cẳng tay', 'Gập vai'],
    exercises: ['Bicep Curls', 'Hammer Curls', 'Chin-ups', 'Cable Curls'],
    location: 'Phía trước cánh tay trên'
  },
  triceps: {
    name: 'Cơ tam đầu',
    description: 'Cơ tam đầu cánh tay nằm ở phía sau cánh tay trên và chịu trách nhiệm cho việc duỗi khuỷu tay.',
    functions: ['Duỗi khuỷu tay', 'Duỗi cánh tay'],
    exercises: ['Tricep Dips', 'Overhead Extension', 'Close-grip Bench Press', 'Tricep Pushdowns'],
    location: 'Phía sau cánh tay trên'
  },
  abs: {
    name: 'Cơ bụng',
    description: 'Các cơ bụng, bao gồm cơ thẳng bụng và cơ chéo, cung cấp sự ổn định cho lõi và gập thân.',
    functions: ['Ổn định lõi', 'Gập thân', 'Xoay'],
    exercises: ['Crunches', 'Planks', 'Leg Raises', 'Russian Twists'],
    location: 'Phía trước thân, giữa ngực và xương chậu'
  },
  legs: {
    name: 'Chân',
    description:
      'Các cơ chân bao gồm cơ tứ đầu, gân kheo, mông và bắp chân. Chúng là nhóm cơ lớn nhất và thiết yếu cho chuyển động.',
    functions: ['Đi bộ', 'Chạy', 'Nhảy', 'Ngồi xổm'],
    exercises: ['Squats', 'Lunges', 'Leg Press', 'Deadlifts'],
    location: 'Phần dưới cơ thể từ hông đến bàn chân'
  },
  glutes: {
    name: 'Mông',
    description:
      'Các cơ mông (cơ mông lớn, cơ mông giữa, cơ mông nhỏ) là những cơ lớn nhất trong cơ thể, chịu trách nhiệm cho việc duỗi hông và ổn định.',
    functions: ['Duỗi hông', 'Dạng hông', 'Hỗ trợ tư thế'],
    exercises: ['Squats', 'Hip Thrusts', 'Lunges', 'Glute Bridges'],
    location: 'Vùng mông'
  }
}
