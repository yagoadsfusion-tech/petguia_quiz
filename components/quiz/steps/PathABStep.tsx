import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { StepWrapper } from '../StepWrapper';

export const PathABStep = () => {
  const { setTrainingStyle, nextStep, prevStep, flow } = useQuizStore();
  const { title_behavior_commands, title_puppy, title_general, options } = quizData.entry1_behavior.path_ab.path_b;

  let title = title_behavior_commands;
  if (flow === 'puppy') title = title_puppy;
  if (flow === 'general') title = title_general;

  const handleSelect = (option: string) => {
    setTrainingStyle(option);
    setTimeout(() => {
      nextStep();
    }, 200);
  };

  return (
    <StepWrapper title={title} showContinueButton={false} onBack={prevStep}>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className="w-full p-4 bg-[#ececec] rounded-[12px] text-left hover:bg-[#e0e0e0] active:scale-[0.98] transition-all duration-200 group"
          >
            <p className="font-montserrat font-medium text-[16px] text-black tracking-[-0.6px] group-hover:text-[#2a5fff] transition-colors">
              {option.label}
            </p>
          </button>
        ))}
      </div>
    </StepWrapper>
  );
};
