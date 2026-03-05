import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { StepWrapper } from '../StepWrapper';

export const SpecificSituationStep = () => {
  const { setSpecificSituation, nextStep, prevStep, priorityProblem, flow, dogName } = useQuizStore();
  
  let title;
  let options;

  if (flow === 'behavior') {
    const { titulo_grupo1, opcoes_grupo1, titulo_grupo2, opcoes_grupo2 } = quizData.entry1_behavior.specific_situation;
    const useGroup2 = priorityProblem === "Pula nas visitas";
    title = useGroup2 ? titulo_grupo2 : titulo_grupo1;
    options = useGroup2 ? opcoes_grupo2 : opcoes_grupo1;
  } else if (flow === 'commands') {
    title = quizData.entry2_commands.specific_situation.title;
    options = quizData.entry2_commands.specific_situation.options;
  } else if (flow === 'puppy') {
    title = quizData.entry3_puppy.specific_situation.title.replace('{dogName}', dogName);
    options = quizData.entry3_puppy.specific_situation.options;
  } else if (flow === 'general') {
    title = quizData.entry4_general.specific_situation.title;
    options = quizData.entry4_general.specific_situation.options;
  } else {
    // Default fallback
    title = quizData.entry1_behavior.specific_situation.titulo_grupo1;
    options = quizData.entry1_behavior.specific_situation.opcoes_grupo1;
  }

  const handleSelect = (option: string) => {
    setSpecificSituation(option);
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
