import { useEffect } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import Image from 'next/image';
import { getIntermediateImage } from '@/lib/intermediateImageHelper';

export const IntermediateStep = () => {
  const { nextStep, dogName, dogBreed, activityLevel, dogGender } = useQuizStore();
  const { title } = quizData.interstitials.intermediate;

  useEffect(() => {
    document.body.style.backgroundColor = '#4c54fe';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      nextStep();
    }, 10000); // 10s
    return () => clearTimeout(timer);
  }, [nextStep]);

  const article = (dogGender === 'Fêmea') ? 'a' : 'o';
  // Use the title from quizData but replace placeholders
  const displayTitle = title.replace('{article}', article).replace('{dogName}', dogName);
  
  const subtitle = `${dogBreed || 'Cães'} com atividade ${activityLevel?.toLowerCase() || 'moderada'} evoluem melhor com treinos curtos, previsíveis e repetidos ao longo do dia.`;
  const footer = `Estamos organizando o plano do ${dogName} respeitando esse ritmo de aprendizado.`;

  const imageSrc = getIntermediateImage(dogBreed, activityLevel);

  return (
    <div className="relative flex flex-col h-full bg-[#4c54fe] overflow-hidden">
      <div className="relative z-10 flex flex-col h-full px-6 pb-8 pt-12 items-center justify-center text-center">
        
        <div className="relative w-[280px] h-[280px] mb-8 flex items-center justify-center">
           {/* Image container */}
           <div className="absolute inset-0 z-10 rounded-[32px] overflow-hidden bg-[#4c54fe] shadow-lg m-[6px]">
             <Image
               src={imageSrc}
               alt="Intermediate"
               fill
               className="object-cover"
             />
           </div>

           {/* Progress Border Overlay */}
           <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none -rotate-90">
             {/* Track (optional, uncomment if needed) */}
             <rect
               x="4"
               y="4"
               width="272"
               height="272"
               rx="32"
               ry="32"
               fill="none"
               stroke="rgba(255,255,255,0.2)"
               strokeWidth="4"
             />
             
             {/* Animated Progress */}
             <rect
               x="4"
               y="4"
               width="272"
               height="272"
               rx="32"
               ry="32"
               fill="none"
               stroke="white"
               strokeWidth="4"
               strokeDasharray="1000" 
               strokeDashoffset="1000"
               style={{ animation: 'dash 10s linear forwards' }}
               strokeLinecap="round"
             />
           </svg>
        </div>

        <h1 className="text-[26px] font-black font-bbanonym text-white leading-tight mb-4 tracking-[-0.25px]">
          {displayTitle}
        </h1>
        
        <p className="text-[16px] font-normal font-montserrat text-white/95 leading-snug tracking-[-0.13px] max-w-[300px] mx-auto mb-8">
          {subtitle}
        </p>

        <div className="mt-auto w-full max-w-[320px]">
          <div className="bg-white/15 border border-white/25 rounded-[16px] p-4 backdrop-blur-sm">
            <p className="text-[14px] font-medium font-montserrat text-white text-center leading-snug">
              {footer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
