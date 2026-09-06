// src/data/mockQuestions.ts
export interface Question {
  id: string;
  questionText: string;
  options: string[]; // length 4
  correctAnswer: number; // index 0-3
}

export const mockQuestions: Record<string, Question[]> = {
  "javascript-basics": [
    {
      id: "q1",
      questionText: "Which of the following is a primitive data type in JavaScript?",
      options: ["Object", "Array", "String", "Function"],
      correctAnswer: 2,
    },
    {
      id: "q2",
      questionText: "What is the output of \`console.log(typeof null)\`?",
      options: ["object", "null", "undefined", "function"],
      correctAnswer: 0,
    },
    {
      id: "q3",
      questionText: "Which keyword is used to declare a block‑scoped variable?",
      options: ["var", "let", "const", "both let and const"],
      correctAnswer: 3,
    },
    {
      id: "q4",
      questionText: "How do you create a new array from an existing array without mutating it?",
      options: ["arr.slice()", "arr.splice()", "arr.filter()", "arr.map()"],
      correctAnswer: 0,
    },
    {
      id: "q5",
      questionText: "Which method adds an element to the end of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      correctAnswer: 0,
    },
    {
      id: "q6",
      questionText: "What does the spread operator ( ... ) do in an object literal?",
      options: ["Creates a shallow copy", "Merges objects", "Deletes properties", "None of the above"],
      correctAnswer: 1,
    },
    {
      id: "q7",
      questionText: "Which of these is NOT a JavaScript loop construct?",
      options: ["for", "while", "do…while", "repeat"],
      correctAnswer: 3,
    },
    {
      id: "q8",
      questionText: "Which statement is true about == and === in JavaScript?",
      options: ["Both compare value only", "=== compares type and value, == does type coercion", "== compares type and value, === does type coercion", "They are interchangeable"],
      correctAnswer: 1,
    },
    {
      id: "q9",
      questionText: "What is the result of \`[1, 2, 3] + [4, 5, 6]\`?",
      options: ["[1,2,3,4,5,6]", "'1,2,34,5,6'", "'1,2,34,5,6'", "NaN"],
      correctAnswer: 1,
    },
    {
      id: "q10",
      questionText: "Which event fires when a form is submitted?",
      options: ["onSubmit", "onClick", "onChange", "onLoad"],
      correctAnswer: 0,
    },
  ],
  "react-fundamentals": [
    {
      id: "q1",
      questionText: "Which hook replaces componentDidMount?",
      options: ["useEffect", "useState", "useRef", "useCallback"],
      correctAnswer: 0,
    },
    {
      id: "q2",
      questionText: "What does the second argument of useEffect([]) signify?",
      options: ["Run on every render", "Run only once after mount", "Run on unmount", "Run when dependencies change"],
      correctAnswer: 1,
    },
    {
      id: "q3",
      questionText: "How do you pass data from parent to child component?",
      options: ["State", "Props", "Context", "Refs"],
      correctAnswer: 1,
    },
    {
      id: "q4",
      questionText: "Which method is used to update state based on previous state?",
      options: ["setState(newState)", "setState(prev => newState)", "this.setState", "useEffect"],
      correctAnswer: 1,
    },
    {
      id: "q5",
      questionText: "What is the purpose of React.Fragment?",
      options: ["Add extra DOM node", "Group children without extra node", "Provide context", "Optimize rendering"],
      correctAnswer: 1,
    },
    {
      id: "q6",
      questionText: "Which of these is a valid way to create a ref?",
      options: ["useRef()", "createRef()", "Both A and B", "Neither"],
      correctAnswer: 2,
    },
    {
      id: "q7",
      questionText: "What does the React key prop help with?",
      options: ["Styling", "Performance by identifying list items", "Event handling", "Data fetching"],
      correctAnswer: 1,
    },
    {
      id: "q8",
      questionText: "Which hook would you use for memoizing a value?",
      options: ["useMemo", "useCallback", "useEffect", "useRef"],
      correctAnswer: 0,
    },
    {
      id: "q9",
      questionText: "When a component re-renders, which hook runs after the DOM updates?",
      options: ["useEffect", "useLayoutEffect", "useReducer", "useState"],
      correctAnswer: 0,
    },
    {
      id: "q10",
      questionText: "What does JSX compile to?",
      options: ["HTML strings", "React.createElement calls", "DOM nodes", "CSS"],
      correctAnswer: 1,
    },
  ],
  // Additional quizzes can be added here following the same structure
};
