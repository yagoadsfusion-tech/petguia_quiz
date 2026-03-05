import { useState } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { StepWrapper } from '../StepWrapper';
import { cn } from '@/lib/utils';

export const ProblemsStep = () => {
  const { toggleProblem, nextStep, prevStep, problems, setPriorityProblem } = useQuizStore();
  const { title, subtitle, options } = quizData.entry1_behavior.problems;
  const modalData = quizData.entry1_behavior.priority_modal;
  const [showModal, setShowModal] = useState(false);

  const handleToggle = (option: string) => {
    toggleProblem(option);
  };

  const handleContinue = () => {
    if (problems.length === 1) {
      setPriorityProblem(problems[0]);
      nextStep();
    } else if (problems.length >= 2) {
      setShowModal(true);
    }
  };

  const handlePrioritySelect = (problem: string) => {
    setPriorityProblem(problem);
    nextStep();
  };

  return (
    <>
      <StepWrapper 
        title={title} 
        subtitle={subtitle} 
        onContinue={handleContinue} 
        isContinueDisabled={problems.length === 0}
        onBack={prevStep}
      >
        <div className="flex flex-col gap-3">
          {options.map((option) => {
            const isSelected = problems.includes(option);
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

      {/* Priority Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[500px] bg-white rounded-t-[20px] sm:rounded-[20px] p-6 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
            <h2 className="text-[20px] font-black font-bbanonym text-[#2a5fff] mb-2 text-center tracking-[-0.25px]">
              {modalData.title}
            </h2>
            <p className="text-[14px] font-montserrat text-[#78787b] mb-6 text-center tracking-[-0.13px]">
              {modalData.subtitle}
            </p>
            
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
              {problems.map((problem) => (
                <button
                  key={problem}
                  onClick={() => handlePrioritySelect(problem)}
                  className="w-full p-4 bg-[#ececec] rounded-[12px] text-left hover:bg-[#e0e0e0] active:scale-[0.98] transition-all group"
                >
                  <p className="font-montserrat font-medium text-[16px] text-black tracking-[-0.6px] group-hover:text-[#2a5fff]">
                    {problem}
                  </p>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowModal(false)}
              className="mt-6 w-full py-3 text-[#89898b] font-medium font-montserrat text-[14px] hover:text-[#2a5fff] transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
