import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { StepWrapper } from '../StepWrapper';
import { cn } from '@/lib/utils';

export const HealthStep = () => {
  const { toggleHealthCondition, nextStep, prevStep, healthConditions, flow } = useQuizStore();
  const { title, subtitle_behavior_commands, subtitle_puppy, subtitle_general, options } = quizData.shared.health;

  let subtitle = subtitle_behavior_commands;
  if (flow === 'puppy') subtitle = subtitle_puppy;
  if (flow === 'general') subtitle = subtitle_general;

  const handleToggle = (option: string) => {
    toggleHealthCondition(option);
  };

  return (
    <StepWrapper 
      title={title} 
      subtitle={subtitle} 
      onContinue={nextStep} 
      isContinueDisabled={healthConditions.length === 0}
      onBack={prevStep}
    >
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = healthConditions.includes(option);
          return (
            <button
              key={option}
              onClick={() => handleToggle(option)}
              className={cn(
                "w-full p-4 rounded-[12px] text-left transition-all duration-200 border-2",
                isSelected 
                  ? "bg-[#2a5fff] border-[#2a5fff]" 
                  : "bg-[#ececec] border-transparent hover:bg-[#e0e0e0]"
              )}
            >
              <p className={cn(
                "font-montserrat font-medium text-[16px] tracking-[-0.6px]",
                isSelected ? "text-white" : "text-black"
              )}>
                {option}
              </p>
            </button>
          );
        })}
      </div>
    </StepWrapper>
  );
};
