
export interface MemberInfo {
  name: string;
  photoUrl?: string;
}

export interface GroupInfo {
  groupName: string;
  leaderName: string;
  leaderPhotoUrl?: string;
  members: (string | MemberInfo)[];
  groupPhotoUrl?: string;
}

export interface TableRow {
  id: string;
  [key: string]: string | number;
}

export interface RoleAssignment {
  name: string;
  role: string;
}

export interface StudentAnswers {
  problemFormulations: string[];
  hypotheses: string[];
  problemFormulation: string; // legacy support
  hypothesis: string; // legacy support
  tableData: TableRow[];
  subTableData?: {
    [experimentId: string]: TableRow[];
  };
  hypothesisTesting: {
    isCorrect: boolean | null;
    reason: string;
  };
  conclusion: string;
  evaluationScore?: number;
  roleAssignments?: RoleAssignment[];
  reflection?: {
    whatLearned: string;
    feelings: string;
    difficulties: string;
    nextSteps: string;
  };
}

export interface EvaluationQuestion {
  id: number;
  type: "multiple-choice" | "sortable";
  question: string;
  options?: string[];
  items?: { id: string; content: string }[];
  answer: string | string[];
}

export interface SubExperiment {
  id: string;
  title: string;
  instruction: string;
  headers: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  videoUrl: string;
  phetUrl: string;
  objectives: string[];
  subExperiments?: SubExperiment[];
  evaluations?: EvaluationQuestion[];
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  answers: any[];
  completedAt: string;
}

export interface AppState {
  groupInfo: GroupInfo | null;
  moduleProgress: {
    [moduleId: string]: {
      answers: StudentAnswers;
      currentStep: number;
      updatedAt?: string;
    };
  };
  quizResult: QuizResult | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'student' | 'admin';
  username?: string;
  groupName?: string;
  leaderName?: string;
  leaderPhotoUrl?: string;
  members?: (string | MemberInfo)[];
  groupPhotoUrl?: string;
  createdAt?: string;
}

export type View = 'LANDING' | 'LOGIN' | 'REGISTER' | 'ADMIN' | 'MENU' | 'MODULE';
