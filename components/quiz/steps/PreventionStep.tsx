import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { StepWrapper } from '../StepWrapper';
import { cn } from '@/lib/utils';

export const PreventionStep = () => {
  const { togglePrevention, nextStep, prevStep, prevention } = useQuizStore();
  const { title, subtitle, options } = quizData.entry3_puppy.prevention;

  const handleToggle = (option: string) => {
    togglePrevention(option);
  };

  return (
    <StepWrapper 
      title={title} 
      subtitle={subtitle} 
      onContinue={nextStep} 
      isContinueDisabled={prevention.length === 0}
      onBack={prevStep}
    >
      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = prevention.includes(option);
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
