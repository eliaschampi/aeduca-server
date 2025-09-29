export type StudentResult = {
  result_code: string;
  register_code: string;
  eval_code: string;
  section_code: string | null;
  correct_count: number;
  incorrect_count: number;
  blank_count: number;
  score: number;
  calculated_at: string;
  student_code: string;
  roll_code: string;
  group_name: string;
  level_code: string;
  name: string;
  last_name: string;
  level_name: string;
  eval_name: string;
  eval_date: string;
};

export type StudentAnswer = {
  question_code: string;
  student_answer: string | null;
  order_in_eval: number;
  correct_key: string;
  is_correct: boolean;
  is_blank: boolean;
  is_multiple: boolean;
  section_code?: string;
  section_name?: string;
};

// Chart.js optimized types
export type ScoreEvolutionItem = {
  eval_code: string;
  eval_name: string;
  eval_date: string; // ISO date for Chart.js time axis
  score: number; // Numeric for Chart.js datasets
};

export type CourseScoreItem = {
  course_code: string;
  course_name: string;
  average_score: number; // Rounded for Chart.js doughnut
};

export type CourseEvolutionItem = {
  eval_code: string;
  eval_name: string;
  eval_date: string; // ISO date for Chart.js time axis
  course_code: string;
  course_name: string;
  score: number; // Numeric for Chart.js bar chart
};

export type SectionScore = {
  section_code: string;
  section_name: string;
  correct_count: number;
  incorrect_count: number;
  blank_count: number;
  total_questions: number;
  score: number;
};
