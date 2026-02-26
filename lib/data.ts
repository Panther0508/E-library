export type Role = 'Student' | 'Researcher' | 'Contributor' | 'Admin';

export const categories = [
  'Mechanical Engineering',
  'Electrical & Electronics',
  'Mechatronics',
  'Robotics & Automation',
  'Embedded Systems',
  'Programming (C, C++, Python, MATLAB)',
  'CAD & Simulation (SolidWorks, AutoCAD, Proteus, ANSYS)',
  'Final Year Projects'
];

export const resources = [
  {
    title: 'Finite Element Analysis Fundamentals',
    category: 'Mechanical Engineering',
    type: 'PDF',
    year: 2024,
    level: 'Undergraduate',
    tags: ['simulation', 'ansys', 'materials']
  },
  {
    title: 'High-Efficiency Motor Drive Blueprint',
    category: 'Electrical & Electronics',
    type: 'Blueprint',
    year: 2023,
    level: 'Research',
    tags: ['power electronics', 'drive', 'control']
  },
  {
    title: 'Autonomous Robot Control in Python',
    category: 'Robotics & Automation',
    type: 'Code',
    year: 2025,
    level: 'Intermediate',
    tags: ['python', 'slam', 'navigation']
  },
  {
    title: 'STM32 Embedded Systems Lab',
    category: 'Embedded Systems',
    type: 'Video',
    year: 2022,
    level: 'Beginner',
    tags: ['firmware', 'c', 'microcontroller']
  }
];

export const codeSnippet = `#include <stdio.h>\n\nint main(void) {\n  float v = 12.0f;\n  float i = 1.5f;\n  printf(\"Power = %.2f W\\n\", v * i);\n  return 0;\n}`;
