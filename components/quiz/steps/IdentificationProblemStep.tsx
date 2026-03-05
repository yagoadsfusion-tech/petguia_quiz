import { useState } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { StepWrapper } from '../StepWrapper';
import Image from 'next/image';

import { SegmentedSlider } from '@/components/ui/SegmentedSlider';

export const IdentificationProblemStep = () => {
  const { setIdentificationScore, nextStep, prevStep, priorityProblem } = useQuizStore();
  const { statement_template, questionSubtitle, labels } = quizData.entry1_behavior.identification_problem;
  const [value, setValue] = useState(50);

  const handleContinue = () => {
    setIdentificationScore(value);
    nextStep();
  };

  const statement = statement_template.replace('{problema_prioritario}', (priorityProblem || 'esse problema').toLowerCase());

  return (
    <StepWrapper onContinue={handleContinue} onBack={prevStep}>
      <div className="flex flex-col items-center text-center">
        <div className="relative w-full h-[180px] mb-6">
          <Image
            src="/images/quiz/slider2certo-2.webp"
            alt="Identification"
            fill
            className="object-contain"
          />
        </div>

        <h2 className="text-[22px] font-black font-bbanonym text-[#2a5fff] leading-tight mb-2 tracking-[-0.25px]">
          &quot;{statement}&quot;
        </h2>
        
        <p className="text-[14px] font-montserrat text-[#78787b] mb-10">
          {questionSubtitle}
        </p>

        <div className="w-full px-2">
          <SegmentedSlider
            value={value}
            onChange={setValue}
            min={0}
            max={100}
            className="mb-2"
          />
          <div className="flex justify-between mt-2">
            <span className="text-[12px] font-montserrat text-[#89898b] max-w-[100px] text-left leading-tight">
              {labels[0]}
            </span>
            <span className="text-[12px] font-montserrat text-[#89898b] max-w-[100px] text-right leading-tight">
              {labels[1]}
            </span>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};
