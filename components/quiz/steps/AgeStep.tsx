import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { StepWrapper } from '../StepWrapper';

export const AgeStep = () => {
  const { setDogAge, nextStep, prevStep, flow } = useQuizStore();
  const { title, subtitle_behavior_commands, subtitle_puppy_general, options } = quizData.shared.age;
  
  const subtitle = (flow === 'behavior' || flow === 'commands') 
    ? subtitle_behavior_commands 
    : subtitle_puppy_general;

  const handleSelect = (option: string) => {
    setDogAge(option);
    setTimeout(() => {
      nextStep();
    }, 200);
  };

  return (
    <StepWrapper title={title} subtitle={subtitle} showContinueButton={false} onBack={prevStep}>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className="w-full p-4 bg-[#ececec] rounded-[12px] text-left hover:bg-[#e0e0e0] active:scale-[0.98] transition-all duration-200 group"
          >
            <p className="font-montserrat font-medium text-[16px] text-black tracking-[-0.6px] group-hover:text-[#2a5fff] transition-colors">
              {option}
            </p>
          </button>
        ))}
      </div>
    </StepWrapper>
  );
};
