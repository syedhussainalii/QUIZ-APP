// Mock quiz data used by dashboard and quiz pages
export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  questions: number;
  duration: number; // minutes
}

export const quizzes: Quiz[] = [
  {
    id: "javascript-basics",
    title: "JavaScript Basics",
    description: "Test your knowledge of fundamental JavaScript concepts.",
    category: "Programming",
    difficulty: "Easy",
    questions: 10,
    duration: 10,
  },
  {
    id: "react-fundamentals",
    title: "React Fundamentals",
    description: "A quiz covering core React concepts and hooks.",
    category: "Web Development",
    difficulty: "Medium",
    questions: 12,
    duration: 12,
  },
  {
    id: "data-structures",
    title: "Data Structures",
    description: "Assess your understanding of common data structures.",
    category: "Computer Science",
    difficulty: "Hard",
    questions: 15,
    duration: 15,
  },
];
