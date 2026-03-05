import { useState } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { StepWrapper } from '../StepWrapper';

export const NameStep = () => {
  const { setDogName, nextStep, prevStep, dogName } = useQuizStore();
  const { title, subtitle, maxLength } = quizData.shared.name;
  const [name, setName] = useState(dogName || '');

  const handleContinue = () => {
    if (name.trim()) {
      setDogName(name.trim());
      nextStep();
    }
  };

  return (
    <StepWrapper 
      title={title} 
      subtitle={subtitle} 
      onContinue={handleContinue} 
      isContinueDisabled={!name.trim()}
      onBack={prevStep}
    >
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={maxLength}
          placeholder="Nome do cão"
          className="w-full p-4 bg-[#ececec] rounded-[12px] text-[18px] font-montserrat font-medium text-black placeholder:text-[#89898b] focus:outline-none focus:ring-2 focus:ring-[#2a5fff] transition-all"
          autoFocus
        />
      </div>
    </StepWrapper>
  );
};
