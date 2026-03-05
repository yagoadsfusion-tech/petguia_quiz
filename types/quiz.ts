export type QuizFlow = 'behavior' | 'commands' | 'puppy' | 'general';

export interface QuizState {
  flow: QuizFlow | null;
  currentStep: number;
  // User Data
  dogName: string;
  dogGender: 'Macho' | 'Fêmea' | null;
  dogAge: string | null;
  dogBreed: string | null;
  
  // Answers
  commands: string[];
  problems: string[];
  priorityProblem: string | null;
  healthConditions: string[];
  activityLevel: string | null;
  trainingTime: string | null;
  referralCode: string;
  
  // Additional fields
  intention: string | null;
  identificationScore: number | null; // For sliders
  contextAnswers: Record<string, string>;
  impactAnswers: Record<string, string>;
  specificSituation: string | null;
  trainingStyle: string | null; // path_ab
  trainingStartDate: string | null; // path_ab date picker
  
  // New fields for other flows
  blockage: string | null;
  behaviorExtra: string | null;
  puppyGoal: string | null;
  prevention: string[];
  dailyChallenge: string | null;
  exploratory: string[];
  focus: string | null;
  email: string;
}

export interface QuizActions {
  setFlow: (flow: QuizFlow) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  setDogName: (name: string) => void;
  setDogGender: (gender: 'Macho' | 'Fêmea') => void;
  setDogAge: (age: string) => void;
  setDogBreed: (breed: string) => void;
  
  setIntention: (intention: string) => void;
  setCommands: (commands: string[]) => void;
  toggleCommand: (command: string) => void;
  setProblems: (problems: string[]) => void;
  toggleProblem: (problem: string) => void;
  setPriorityProblem: (problem: string) => void;
  setHealthConditions: (conditions: string[]) => void;
  toggleHealthCondition: (condition: string) => void;
  setActivityLevel: (level: string) => void;
  setTrainingTime: (time: string) => void;
  setReferralCode: (code: string) => void;
  
  setIdentificationScore: (score: number) => void;
  setContextAnswer: (problem: string, answer: string) => void;
  setImpactAnswer: (problem: string, answer: string) => void;
  setSpecificSituation: (situation: string) => void;
  setTrainingStyle: (style: string) => void;
  setTrainingStartDate: (date: string) => void;

  setBlockage: (blockage: string) => void;
  setBehaviorExtra: (behavior: string) => void;
  setPuppyGoal: (goal: string) => void;
  setPrevention: (prevention: string[]) => void;
  togglePrevention: (item: string) => void;
  setDailyChallenge: (challenge: string) => void;
  setExploratory: (exploratory: string[]) => void;
  toggleExploratory: (item: string) => void;
  setFocus: (focus: string) => void;
  setEmail: (email: string) => void;

  resetQuiz: () => void;
}

export type QuizStore = QuizState & QuizActions;
