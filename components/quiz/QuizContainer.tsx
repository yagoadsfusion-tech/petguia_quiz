import { useQuizStore } from '@/store/quizStore';
import { QuizProgressBar } from './QuizProgressBar';
import { IntroStep } from './steps/IntroStep';
import { IntentionStep } from './steps/IntentionStep';
import { GenderStep } from './steps/GenderStep';
import { NameStep } from './steps/NameStep';
import { AgeStep } from './steps/AgeStep';
import { BreedStep } from './steps/BreedStep';
import { SocialProofStep } from './steps/SocialProofStep';
import { HealthStep } from './steps/HealthStep';
import { ActivityStep } from './steps/ActivityStep';
import { CommandsStep } from './steps/CommandsStep';
import { IdentificationStep } from './steps/IdentificationStep';
import { IntermediateStep } from './steps/IntermediateStep';
import { ProblemsStep } from './steps/ProblemsStep';
import { IdentificationProblemStep } from './steps/IdentificationProblemStep';
import { ContextStep } from './steps/ContextStep';
import { ImpactStep } from './steps/ImpactStep';
import { SpecificSituationStep } from './steps/SpecificSituationStep';
import { PathABStep } from './steps/PathABStep';
import { ProgressScreen } from './steps/ProgressScreen';
import { TimeStep } from './steps/TimeStep';
import { PreparationStep } from './steps/PreparationStep';
import { ResultStep } from './steps/ResultStep';
import { PaywallScreen } from './steps/PaywallScreen';
import { GiftScreen } from './steps/GiftScreen';
import { BlockageStep } from './steps/BlockageStep';
import { BehaviorCommandsStep } from './steps/BehaviorCommandsStep';
import { PuppyGoalStep } from './steps/PuppyGoalStep';
import { PreventionStep } from './steps/PreventionStep';
import { DailyChallengeStep } from './steps/DailyChallengeStep';
import { ExploratoryStep } from './steps/ExploratoryStep';
import { FocusStep } from './steps/FocusStep';
import { useEffect, useState } from 'react';
import { track } from '@/lib/mixpanelClient';

const STEP_EVENT_NAMES: Record<string, string> = {
  carousel:                  'intro',
  intention:                 'intention',
  gender:                    'genero',
  name:                      'nome',
  age:                       'idade',
  breed:                     'raca',
  social_proof:              'prova_social',
  health:                    'saude',
  activity:                  'atividade',
  intermediate:              'intermediario',
  time:                      'tempo',
  preparation:               'preparacao',
  result:                    'resultado',
  // behavior
  commands:                  'comandos',
  identification_commands:   'identificacao_comandos',
  problems:                  'problemas',
  identification_problem:    'identificacao_problema',
  context:                   'contexto',
  impact:                    'impacto',
  specific_situation_1:      'situacao_especifica',
  path_ab_1:                 'path_ab',
  progress_1:                'progresso',
  // commands
  blockage:                  'bloqueio',
  behavior_commands:         'comandos_comportamento',
  identification_light:      'identificacao_leve',
  specific_situation_2:      'situacao_especifica',
  path_ab_2:                 'path_ab',
  progress_2:                'progresso',
  // puppy
  puppy_goal:                'objetivo_filhote',
  prevention:                'prevencao',
  daily_challenge:           'desafio_diario',
  identification_puppy:      'identificacao_filhote',
  specific_situation_3:      'situacao_especifica',
  path_ab_3:                 'path_ab',
  progress_3:                'progresso',
  // general
  exploratory:               'exploratorio',
  focus:                     'foco',
  identification_general:    'identificacao_geral',
  specific_situation_4:      'situacao_especifica',
  path_ab_4:                 'path_ab',
  progress_4:                'progresso',
};

const stepComponents: Record<string, React.ComponentType> = {
  carousel: IntroStep,
  intention: IntentionStep,
  gender: GenderStep,
  name: NameStep,
  age: AgeStep,
  breed: BreedStep,
  social_proof: SocialProofStep,
  health: HealthStep,
  activity: ActivityStep,
  intermediate: IntermediateStep,
  time: TimeStep,
  preparation: PreparationStep,
  result: ResultStep,
  gift: GiftScreen,
  paywall: PaywallScreen,
  
  // Behavior
  commands: CommandsStep,
  identification_commands: IdentificationStep,
  problems: ProblemsStep,
  identification_problem: IdentificationProblemStep,
  context: ContextStep,
  impact: ImpactStep,
  specific_situation_1: SpecificSituationStep,
  path_ab_1: PathABStep,
  progress_1: ProgressScreen,
  
  // Commands
  blockage: BlockageStep,
  behavior_commands: BehaviorCommandsStep,
  identification_light: IdentificationStep,
  specific_situation_2: SpecificSituationStep,
  path_ab_2: PathABStep,
  progress_2: ProgressScreen,
  
  // Puppy
  puppy_goal: PuppyGoalStep,
  prevention: PreventionStep,
  daily_challenge: DailyChallengeStep,
  identification_puppy: IdentificationStep,
  specific_situation_3: SpecificSituationStep,
  path_ab_3: PathABStep,
  progress_3: ProgressScreen,
  
  // General
  exploratory: ExploratoryStep,
  focus: FocusStep,
  identification_general: IdentificationStep,
  specific_situation_4: SpecificSituationStep,
  path_ab_4: PathABStep,
  progress_4: ProgressScreen,
};

export const QuizContainer = () => {
  const { currentStep, flow } = useQuizStore();
  const [isClient, setIsClient] = useState(false);

  const behaviorSteps = [
    'carousel', 'intention', 'gender', 'name', 'age', 'breed', 'social_proof', 
    'health', 'activity', 'commands', 'identification_commands', 'intermediate', 
    'problems', 'identification_problem', 'context', 'impact', 'specific_situation_1', 
    'path_ab_1', 'progress_1', 'time', 'preparation', 'result', 'gift', 'paywall'
  ];

  const commandsSteps = [
    'carousel', 'intention', 'gender', 'name', 'age', 'breed', 'social_proof', 
    'health', 'activity', 'intermediate', 'commands', 'blockage', 'behavior_commands', 
    'identification_light', 'specific_situation_2', 'path_ab_2', 'progress_2', 
    'time', 'preparation', 'result', 'gift', 'paywall'
  ];

  const puppySteps = [
    'carousel', 'intention', 'gender', 'name', 'age', 'breed', 'social_proof', 
    'health', 'activity', 'intermediate', 'puppy_goal', 'prevention', 'daily_challenge', 
    'identification_puppy', 'specific_situation_3', 'path_ab_3', 'progress_3', 
    'time', 'preparation', 'result', 'gift', 'paywall'
  ];

  const generalSteps = [
    'carousel', 'intention', 'gender', 'name', 'age', 'breed', 'social_proof', 
    'health', 'activity', 'intermediate', 'exploratory', 'focus', 'identification_general', 
    'specific_situation_4', 'path_ab_4', 'progress_4',     'time', 'preparation', 
    'result', 'gift', 'paywall'
  ];

  let currentFlowSteps = behaviorSteps;
  if (flow === 'commands') currentFlowSteps = commandsSteps;
  if (flow === 'puppy') currentFlowSteps = puppySteps;
  if (flow === 'general') currentFlowSteps = generalSteps;

  const stepId = currentFlowSteps[currentStep - 1] || 'paywall';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || stepId === 'paywall' || !flow) return;
    const eventName = STEP_EVENT_NAMES[stepId];
    if (!eventName) return;

    if (['carousel', 'intention'].includes(stepId)) {
      track(`quiz_${eventName}`);
    } else {
      track(`${flow}_${eventName}`);
    }
  }, [isClient, stepId, flow]);

  if (!isClient) return null;

  const Component = stepComponents[stepId] || PaywallScreen;
  
  // Hide progress bar on interstitials and special screens
  const hiddenProgressBarSteps = [
    'carousel', 'result', 'gift', 'paywall', 'preparation', 'social_proof', 
    'intermediate', 'progress_1', 'progress_2', 'progress_3', 'progress_4'
  ];
  
  const showProgressBar = !hiddenProgressBarSteps.includes(stepId);
  
  // Adjusted for dynamic flow length
  const progress = Math.min(100, Math.max(0, ((currentStep - 1) / (currentFlowSteps.length - 2)) * 100));

  return (
    <div className="flex flex-col h-full bg-white relative">
      {showProgressBar && <QuizProgressBar progress={progress} />}
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <Component />
      </div>
    </div>
  );
};
