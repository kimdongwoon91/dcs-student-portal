export interface StudentData {
  nickname: string;
  dept: string;
  grade: number;
  classNo: number;
  number: number;
  careerType: string;
  careerHope: string;
  achievement: string;
  achieveLevel: string;
  totalScore: number;
  certStatus: string;
  certName: string;
  needCounsel: boolean;
  observeAreas: string[];
  evaluations: Evaluation[];
  records: GrowthRecord[];
  projects: Project[];
  counsels: Counsel[];
}

export interface Evaluation {
  id: string;
  theory: number;
  practice: number;
  totalScore: number;
  achievement: string;
  achieveLevel: string;
  certStatus: string;
  dept: string;
  feedback: string;
  createdTime: string;
}

export interface GrowthRecord {
  id: string;
  date: string;
  content: string;
  observeArea: string;
  dept: string;
}

export interface Project {
  id: string;
  group: string;
  role: string;
  task: string;
  status: string;
  dept: string;
}

export interface Counsel {
  id: string;
  title: string;
  type: string;
  content: string;
  date: string;
  followUp: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
