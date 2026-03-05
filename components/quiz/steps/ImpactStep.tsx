import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { StepWrapper } from '../StepWrapper';

const problemKeyMap: Record<string, string> = {
  "Xixi fora do lugar": "xixi_fora_do_lugar",
  "Latidos em excesso": "latidos_excessivos",
  "Mordidas": "mordidas",
  "Rói e danifica os móveis": "roer_objetos",
  "Pula nas visitas": "pula_nas_visitas",
  "Ansiedade de separação": "ansiedade_de_separacao"
};

export const ImpactStep = () => {
  const { setImpactAnswer, nextStep, prevStep, priorityProblem } = useQuizStore();
  const { por_problema } = quizData.entry1_behavior.impact;

  const key = priorityProblem ? (problemKeyMap[priorityProblem] || 'outro') : 'outro';
  // @ts-expect-error - indexing with string
  const problemData = por_problema[key] || por_problema.outro;
  const { title, options } = problemData;

  const handleSelect = (option: string) => {
    setImpactAnswer(key, option);
    setTimeout(() => {
      nextStep();
    }, 200);
  };

  return (
    <StepWrapper title={title} showContinueButton={false} onBack={prevStep}>
      <div className="flex flex-col gap-3">
        {options.map((option: string) => (
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
