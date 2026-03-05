import Image from 'next/image';

interface QuizProgressBarProps {
  progress: number;
}

export const QuizProgressBar = ({ progress }: QuizProgressBarProps) => {
  return (
    <div className="w-full px-6 pt-5 pb-4 bg-white flex flex-col items-center z-10 relative">
      <div className="mb-4 relative w-[160px] h-[80px]">
         <Image 
           src="/images/quiz/logo-quiz.png" 
           alt="PetGuia Logo" 
           fill 
           className="object-contain"
           priority 
         />
      </div>
      <div className="w-full h-[6px] bg-[#F3F4F6] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#2a5fff] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
