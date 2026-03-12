// Engineering resource data

export type Role = 'Student' | 'Researcher' | 'Contributor' | 'Admin';

export const roles: Role[] = ['Student', 'Researcher', 'Contributor', 'Admin'];

export const categories = [
  'Mechanical Engineering',
  'Electrical & Electronics',
  'Mechatronics',
  'Robotics & Automation',
  'Embedded Systems',
  'Programming (C, C++, Python, MATLAB)',
  'CAD & Simulation (SolidWorks, AutoCAD, Proteus, ANSYS)',
  'Final Year Projects',
  'Computer Science',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering'
];

export interface Resource {
  title: string;
  category: string;
  type: 'PDF' | 'Blueprint' | 'Code' | 'Video' | 'Article' | 'Tutorial';
  year: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Undergraduate' | 'Research';
  tags: string[];
  description?: string;
  url?: string;
}

export const resources: Resource[] = [
  {
    title: 'Finite Element Analysis Fundamentals',
    category: 'Mechanical Engineering',
    type: 'PDF',
    year: 2024,
    level: 'Undergraduate',
    tags: ['simulation', 'ansys', 'materials', 'stress analysis'],
    description: 'Comprehensive guide to FEA concepts and applications'
  },
  {
    title: 'High-Efficiency Motor Drive Blueprint',
    category: 'Electrical & Electronics',
    type: 'Blueprint',
    year: 2023,
    level: 'Research',
    tags: ['power electronics', 'drive', 'control', 'motors'],
    description: 'Advanced motor drive design for industrial applications'
  },
  {
    title: 'Autonomous Robot Control in Python',
    category: 'Robotics & Automation',
    type: 'Code',
    year: 2025,
    level: 'Intermediate',
    tags: ['python', 'slam', 'navigation', 'ros'],
    description: 'Complete codebase for autonomous robot navigation'
  },
  {
    title: 'STM32 Embedded Systems Lab',
    category: 'Embedded Systems',
    type: 'Video',
    year: 2024,
    level: 'Beginner',
    tags: ['firmware', 'c', 'microcontroller', 'stm32'],
    description: 'Hands-on STM32 programming tutorials'
  },
  {
    title: 'Machine Learning for Engineers',
    category: 'Computer Science',
    type: 'PDF',
    year: 2024,
    level: 'Advanced',
    tags: ['ai', 'ml', 'python', 'tensorflow'],
    description: 'Applying ML techniques to engineering problems'
  },
  {
    title: 'SolidWorks Advanced Modeling',
    category: 'CAD & Simulation',
    type: 'Tutorial',
    year: 2024,
    level: 'Intermediate',
    tags: ['solidworks', '3d modeling', 'cad', 'simulation'],
    description: 'Master advanced SolidWorks features and workflows'
  },
  {
    title: 'Power System Analysis',
    category: 'Electrical & Electronics',
    type: 'PDF',
    year: 2023,
    level: 'Undergraduate',
    tags: ['power systems', 'load flow', 'fault analysis'],
    description: 'Fundamentals of power system analysis and design'
  },
  {
    title: 'Arduino Robotics Projects',
    category: 'Robotics & Automation',
    type: 'Code',
    year: 2024,
    level: 'Beginner',
    tags: ['arduino', 'robotics', 'c++', 'sensors'],
    description: '15+ robotics projects for beginners'
  },
  {
    title: 'MATLAB Signal Processing',
    category: 'Programming (C, C++, Python, MATLAB)',
    type: 'Tutorial',
    year: 2024,
    level: 'Intermediate',
    tags: ['matlab', 'signal processing', 'dsp', 'filters'],
    description: 'Digital signal processing with MATLAB'
  },
  {
    title: 'PCB Design Fundamentals',
    category: 'Electrical & Electronics',
    type: 'Tutorial',
    year: 2024,
    level: 'Beginner',
    tags: ['pcb', 'circuit design', 'altium', 'kicad'],
    description: 'From schematic to manufactured PCB'
  },
  {
    title: 'Structural Analysis Handbook',
    category: 'Civil Engineering',
    type: 'PDF',
    year: 2023,
    level: 'Undergraduate',
    tags: ['structures', 'steel', 'concrete', 'loads'],
    description: 'Complete structural analysis reference'
  },
  {
    title: 'ROS2 Navigation Stack',
    category: 'Robotics & Automation',
    type: 'Code',
    year: 2024,
    level: 'Advanced',
    tags: ['ros2', 'navigation', 'slam', 'autonomous'],
    description: 'ROS2 navigation for autonomous robots'
  }
];

// Code snippet examples
export const codeSnippets = {
  c: `#include <stdio.h>

int main(void) {
  float v = 12.0f;
  float i = 1.5f;
  printf("Power = %.2f W\\n", v * i);
  return 0;
}`,
  cpp: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> data = {1, 2, 3, 4, 5};
    int sum = 0;
    
    for (int x : data) {
        sum += x;
    }
    
    std::cout << "Sum: " << sum << std::endl;
    return 0;
}`,
  python: `import numpy as np

def calculate_power(voltage: float, current: float) -> float:
    """Calculate electrical power in watts"""
    return voltage * current

# Example usage
voltage = 12.0
current = 1.5
power = calculate_power(voltage, current)
print(f"Power: {power} W")`,
  matlab: `% MATLAB Signal Processing Example
fs = 1000; % Sampling frequency
t = 0:1/fs:1; % Time vector
f = 50; % Signal frequency

% Generate sine wave
x = sin(2*pi*f*t);

% Add noise
x_noisy = x + 0.5*randn(size(x));

% Plot
figure;
plot(t, x_noisy);
xlabel('Time (s)');
ylabel('Amplitude');
title('Noisy Sine Wave');`
};

// Get resources by category
export function getResourcesByCategory(category: string): Resource[] {
  return resources.filter(r => r.category === category);
}

// Get resources by type
export function getResourcesByType(type: Resource['type']): Resource[] {
  return resources.filter(r => r.type === type);
}

// Get resources by level
export function getResourcesByLevel(level: Resource['level']): Resource[] {
  return resources.filter(r => r.level === level);
}

// Search resources
export function searchResources(query: string): Resource[] {
  const lowerQuery = query.toLowerCase();
  return resources.filter(r =>
    r.title.toLowerCase().includes(lowerQuery) ||
    r.category.toLowerCase().includes(lowerQuery) ||
    r.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    r.description?.toLowerCase().includes(lowerQuery)
  );
}
