import { useState } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { breeds } from '@/constants/breeds';
import { StepWrapper } from '../StepWrapper';
import { Search } from 'lucide-react';

export const BreedStep = () => {
  const { setDogBreed, nextStep, prevStep } = useQuizStore();
  const { title } = quizData.shared.breed;
  const [search, setSearch] = useState('');

  const filteredBreeds = breeds.filter(breed => 
    breed.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (breed: string) => {
    setDogBreed(breed);
    setTimeout(() => {
      nextStep();
    }, 200);
  };

  return (
    <StepWrapper title={title} showContinueButton={false} onBack={prevStep}>
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#89898b] w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar raça..."
          className="w-full pl-12 pr-4 py-4 bg-[#ececec] rounded-[12px] text-[16px] font-montserrat font-medium text-black placeholder:text-[#89898b] focus:outline-none focus:ring-2 focus:ring-[#2a5fff] transition-all"
        />
      </div>
      
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-2">
        {filteredBreeds.map((breed) => (
          <button
            key={breed}
            onClick={() => handleSelect(breed)}
            className="w-full p-4 bg-white border border-[#ececec] rounded-[12px] text-left hover:bg-[#f5f5f5] active:scale-[0.98] transition-all duration-200"
          >
            <p className="font-montserrat font-medium text-[16px] text-black tracking-[-0.6px]">
              {breed}
            </p>
          </button>
        ))}
        {filteredBreeds.length === 0 && (
          <p className="text-center text-[#78787b] py-4">Nenhuma raça encontrada</p>
        )}
      </div>
    </StepWrapper>
  );
};
