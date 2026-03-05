import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizStore, QuizState } from '@/types/quiz';

const initialState: Omit<QuizState, 'flow'> & { flow: QuizState['flow'] } = {
  flow: 'behavior', // Default flow
  currentStep: 1,
  
  dogName: '',
  dogGender: null,
  dogAge: null,
  dogBreed: null,
  
  commands: [],
  problems: [],
  priorityProblem: null,
  healthConditions: [],
  activityLevel: null,
  trainingTime: null,
  referralCode: '',
  
  intention: null,
  identificationScore: null,
  contextAnswers: {},
  impactAnswers: {},
  specificSituation: null,
  trainingStyle: null,
  trainingStartDate: null,
  
  blockage: null,
  behaviorExtra: null,
  puppyGoal: null,
  prevention: [],
  dailyChallenge: null,
  exploratory: [],
  focus: null,
  email: '',
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      ...initialState,

      setFlow: (flow) => set({ flow }),
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

      setDogName: (name) => set({ dogName: name }),
      setDogGender: (gender) => set({ dogGender: gender }),
      setDogAge: (age) => set({ dogAge: age }),
      setDogBreed: (breed) => set({ dogBreed: breed }),

      setIntention: (intention) => set({ intention }),
      
      setCommands: (commands) => set({ commands }),
      toggleCommand: (command) => set((state) => {
        const exists = state.commands.includes(command);
        return {
          commands: exists 
            ? state.commands.filter(c => c !== command)
            : [...state.commands, command]
        };
      }),

      setProblems: (problems) => set({ problems }),
      toggleProblem: (problem) => set((state) => {
        const exists = state.problems.includes(problem);
        return {
          problems: exists
            ? state.problems.filter(p => p !== problem)
            : [...state.problems, problem]
        };
      }),

      setPriorityProblem: (problem) => set({ priorityProblem: problem }),

      setHealthConditions: (conditions) => set({ healthConditions: conditions }),
      toggleHealthCondition: (condition) => set((state) => {
        const exists = state.healthConditions.includes(condition);
        return {
          healthConditions: exists
            ? state.healthConditions.filter(c => c !== condition)
            : [...state.healthConditions, condition]
        };
      }),

      setActivityLevel: (level) => set({ activityLevel: level }),
      setTrainingTime: (time) => set({ trainingTime: time }),
      setReferralCode: (code) => set({ referralCode: code }),

      setIdentificationScore: (score) => set({ identificationScore: score }),
      setContextAnswer: (problem, answer) => set((state) => ({
        contextAnswers: { ...state.contextAnswers, [problem]: answer }
      })),
      setImpactAnswer: (problem, answer) => set((state) => ({
        impactAnswers: { ...state.impactAnswers, [problem]: answer }
      })),
      setSpecificSituation: (situation) => set({ specificSituation: situation }),
      setTrainingStyle: (style) => set({ trainingStyle: style }),
      setTrainingStartDate: (date) => set({ trainingStartDate: date }),

      setBlockage: (blockage) => set({ blockage }),
      setBehaviorExtra: (behavior) => set({ behaviorExtra: behavior }),
      setPuppyGoal: (goal) => set({ puppyGoal: goal }),
      setPrevention: (prevention) => set({ prevention }),
      togglePrevention: (item) => set((state) => {
        const exists = state.prevention.includes(item);
        return {
          prevention: exists
            ? state.prevention.filter(i => i !== item)
            : [...state.prevention, item]
        };
      }),
      setDailyChallenge: (challenge) => set({ dailyChallenge: challenge }),
      setExploratory: (exploratory) => set({ exploratory }),
      toggleExploratory: (item) => set((state) => {
        const exists = state.exploratory.includes(item);
        return {
          exploratory: exists
            ? state.exploratory.filter(i => i !== item)
            : [...state.exploratory, item]
        };
      }),
      setFocus: (focus) => set({ focus }),
      setEmail: (email) => set({ email }),

      resetQuiz: () => set(initialState),
    }),
    {
      name: 'petguia-quiz-storage',
    }
  )
);
