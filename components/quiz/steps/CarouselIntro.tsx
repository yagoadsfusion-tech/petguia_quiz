import { useState } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export const CarouselIntro = () => {
  const { nextStep } = useQuizStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = quizData.carousel.slides;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      nextStep();
    }
  };

  return (
    <div className="flex flex-col h-full px-6 pb-8 pt-4">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative w-full max-w-[320px] aspect-square mb-8">
          <Image
            src={`/images/quiz/carousel-slide-${currentSlide + 1}.webp`}
            alt={`Slide ${currentSlide + 1}`}
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-[24px] font-black font-bbanonym text-[#2a5fff] leading-tight mb-4 tracking-[-0.25px]">
          {slides[currentSlide].title}
        </h1>
        
        <p className="text-[14px] font-normal font-montserrat text-[#78787b] leading-snug tracking-[-0.13px] mb-8 max-w-[380px] mx-auto">
          {slides[currentSlide].subtitle}
        </p>
        
        <div className="flex gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentSlide ? 'bg-[#2a5fff] w-8' : 'bg-[#ececec] w-2'
              )}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full py-[14px] px-8 rounded-[12px] bg-[#2a5fff] text-white text-[18px] font-medium font-montserrat tracking-[-0.18px] shadow-[0_4px_8px_rgba(42,95,255,0.3)] hover:bg-[#2550d9] active:scale-[0.98] transition-all duration-200"
      >
        Continuar
      </button>
    </div>
  );
};
