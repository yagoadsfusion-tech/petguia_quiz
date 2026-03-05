import { useEffect } from 'react';
import { useQuizStore } from '@/store/quizStore';
import Image from 'next/image';
import { getBreedImage } from '@/lib/imageHelpers';

export const SocialProofStep = () => {
  const { nextStep, dogName, dogBreed, dogAge, flow } = useQuizStore();

  useEffect(() => {
    document.body.style.backgroundColor = '#8780F9';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  const getTitleContent = () => {
    const nameSpan = <span className="text-[#FFD700]">{dogName}</span>;
    
    if (flow === 'behavior' || flow === 'commands') {
      return <>{nameSpan} está em boa companhia!</>;
    }
    if (flow === 'puppy') {
      return <>{nameSpan} está começando do jeito certo!</>;
    }
    if (flow === 'general') {
      return <>{nameSpan} está dando os próximos passos!</>;
    }
    return <>{nameSpan} está em boa companhia!</>;
  };

  const getSubtitle = () => {
    const breed = dogBreed || 'Cães';
    const age = dogAge || '';
    
    if (flow === 'behavior') {
      return `Mais de 20.000 cães e tutores, incluindo ${breed} de ${age}, já transformaram o comportamento com o PetGuia.`;
    }
    if (flow === 'commands') {
      return `Mais de 20.000 cães e tutores, incluindo ${breed} de ${age}, já melhoraram a obediência com o PetGuia.`;
    }
    if (flow === 'puppy') {
      return `Milhares de filhotes, incluindo ${breed} de ${age}, já iniciaram uma rotina equilibrada com o PetGuia.`;
    }
    if (flow === 'general') {
      return `Milhares de cães, incluindo ${breed} de ${age}, evoluem todos os dias com o PetGuia.`;
    }
    return `Mais de 20.000 cães e tutores, incluindo ${breed} de ${age}, já transformaram o comportamento com o PetGuia.`;
  };

  const breedImage = getBreedImage(dogBreed);

  return (
    <div className="relative flex flex-col h-full bg-[#8780F9] overflow-hidden pt-[max(16px,env(safe-area-inset-top))] pb-8">
      {/* Container (conteúdo) */}
      <div className="flex-1 flex flex-col w-full max-w-[600px] mx-auto px-4 justify-between">
        
        {/* imageContainer */}
        <div className="relative w-full mt-1 flex items-center justify-center">
          {/* Imagem do mundo (Background visual da cena) */}
          <div className="relative w-full h-[520px]">
            <Image 
              src="/images/quiz/interstitial-social-proof-bg.webp" 
              alt="Mundo" 
              fill 
              className="object-contain"
              priority
              sizes="(max-width: 600px) 100vw, 600px"
            />
          </div>

          {/* Container do cão */}
          <div 
            className="absolute left-1/2 top-1/2 w-[170px] h-[170px] rounded-[24px] overflow-hidden"
            style={{
              transform: 'translate(-92px, -100px)'
            }}
          >
            <Image
              src={breedImage}
              alt={dogBreed || 'Cão'}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* textContainer */}
        <div className="relative -mt-[60px] mb-4 px-4 text-center z-10">
          <h1 className="text-[22px] leading-[30px] font-bold font-bbanonym text-white mb-2">
            {getTitleContent()}
          </h1>
          
          <p className="text-[16px] leading-[24px] font-medium font-montserrat text-white/95 max-w-[320px] mx-auto">
            {getSubtitle()}
          </p>
        </div>

        {/* Botão */}
        <div className="w-full flex justify-center pb-4">
          <button
            onClick={nextStep}
            className="w-full max-w-[320px] py-4 px-12 rounded-full bg-white text-[#333333] text-[16px] font-bold font-montserrat shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:bg-gray-50 active:scale-[0.98] transition-all duration-200"
          >
            Continuar
          </button>
        </div>

      </div>
    </div>
  );
};
