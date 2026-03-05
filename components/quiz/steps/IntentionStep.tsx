import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { StepWrapper } from '../StepWrapper';
import { QuizFlow } from '@/types/quiz';

export const IntentionStep = () => {
  const { setIntention, setFlow, nextStep } = useQuizStore();
  const { title, options } = quizData.intention;

  const handleSelect = (id: string) => {
    setIntention(id);
    setFlow(id as QuizFlow);
    setTimeout(() => {
      nextStep();
    }, 200);
  };

  return (
    <StepWrapper title={title} showContinueButton={false} showBackButton={false}>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className="w-full p-4 bg-[#ececec] rounded-[12px] flex items-center gap-4 text-left hover:bg-[#e0e0e0] active:scale-[0.98] transition-all duration-200 group"
          >
            <span className="text-2xl">{option.emoji}</span>
            <div>
              <p className="font-montserrat font-medium text-[16px] text-black tracking-[-0.6px] group-hover:text-[#2a5fff] transition-colors">
                {option.title}
              </p>
              {option.description && (
                <p className="font-montserrat text-[13px] text-[#78787b] mt-1 tracking-[-0.13px]">
                  {option.description}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </StepWrapper>
  );
};
