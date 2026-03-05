import { useState } from 'react';
import { useQuizStore } from '@/store/quizStore';
import Image from 'next/image';
import { getResultBreedImage } from '@/lib/imageHelpers';
import { useRouter } from 'next/navigation';
import { ChevronRight, GraduationCap, AlertTriangle, Calendar, Clock, Target, Shield, Search } from 'lucide-react';

export const ResultStep = () => {
  const router = useRouter();
  const { 
    nextStep, dogName, dogBreed, dogAge, commands, priorityProblem, trainingTime,
    flow, puppyGoal, focus, prevention, referralCode, setReferralCode, email,
  } = useQuizStore();
  
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [code, setCode] = useState(referralCode || '');

  const resultImage = getResultBreedImage(dogBreed);

  const handleApplyCode = () => {
    setReferralCode(code);
    setShowReferralModal(false);
  };

  // Helper para data de previsão (Hoje + 7 dias)
  const getPredictionDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleUnlock = () => {
    const params = new URLSearchParams();
    if (dogName) params.set('name', dogName);
    if (dogBreed) params.set('breed', dogBreed);
    if (priorityProblem) params.set('problem', priorityProblem);
    if (trainingTime) params.set('time', trainingTime);
    if (email) params.set('email', email);
    
    router.push(`/pay?${params.toString()}`);
  };

  const renderDynamicFields = () => {
    if (flow === 'puppy') {
      return (
        <>
          <div className="flex items-start gap-3 border-b border-gray-200 pb-3">
            <Target className="w-5 h-5 text-[#2a5fff] mt-0.5 flex-shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[14px] font-montserrat text-[#78787b]">Objetivo principal:</span>
              <span className="text-[14px] font-montserrat font-bold text-[#2a5fff]">
                {puppyGoal || 'Educação de filhote'}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3 border-b border-gray-200 pb-3">
            <Shield className="w-5 h-5 text-[#35B440] mt-0.5 flex-shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[14px] font-montserrat text-[#78787b]">Foco na prevenção:</span>
              <span className="text-[14px] font-montserrat font-bold text-[#35B440]">
                {prevention.length > 0 ? `${prevention.length} comportamentos` : 'Rotina equilibrada'}
              </span>
            </div>
          </div>
        </>
      );
    }

    if (flow === 'general') {
      return (
        <div className="flex items-start gap-3 border-b border-gray-200 pb-3">
          <Search className="w-5 h-5 text-[#2a5fff] mt-0.5 flex-shrink-0" />
          <div className="flex flex-col w-full">
            <span className="text-[14px] font-montserrat text-[#78787b]">Foco do plano:</span>
            <span className="text-[14px] font-montserrat font-bold text-[#2a5fff]">
              {focus || 'Evolução geral'}
            </span>
          </div>
        </div>
      );
    }

    // Default (Behavior & Commands)
    return (
      <div className="flex items-start gap-3 border-b border-gray-200 pb-3">
        <AlertTriangle className="w-5 h-5 text-[#2a5fff] mt-0.5 flex-shrink-0" />
        <div className="flex flex-col w-full">
          <span className="text-[14px] font-montserrat text-[#78787b]">Problema urgente a ser resolvido:</span>
          <span className="text-[14px] font-montserrat font-bold text-[#2a5fff]">
            {priorityProblem || 'Comportamento geral'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        {/* Header Image */}
        <div className="relative w-full h-[250px] flex-shrink-0">
          <Image
            src={resultImage}
            alt={dogBreed || 'Cão'}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-[32px] font-black font-bbanonym leading-tight tracking-[-0.25px]">
              {dogName}
            </h1>
            <p className="text-[16px] font-montserrat font-medium opacity-90">
              {dogBreed} • {dogAge}
            </p>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col gap-6">
          {/* Profile Details */}
          <div className="bg-[#f5f5f5] rounded-[16px] p-5 flex flex-col gap-4">
            
            {/* Comandos aprendidos */}
            <div className="flex items-start gap-3 border-b border-gray-200 pb-3">
              <GraduationCap className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col w-full">
                <span className="text-[14px] font-montserrat text-[#78787b]">Comandos aprendidos:</span>
                <span className="text-[14px] font-montserrat font-bold text-black">
                  {commands.length > 0 ? commands.join(', ') : 'Nenhum'}
                </span>
              </div>
            </div>

            {renderDynamicFields()}

            {/* Previsão de melhora */}
            <div className="flex items-start gap-3 border-b border-gray-200 pb-3">
              <Calendar className="w-5 h-5 text-[#35B440] mt-0.5 flex-shrink-0" />
              <div className="flex flex-col w-full">
                <span className="text-[14px] font-montserrat text-[#78787b]">Previsão de solução com o PetGuia:</span>
                <span className="text-[14px] font-montserrat font-bold text-[#35B440]">
                  {getPredictionDate()}
                </span>
              </div>
            </div>

            {/* Tempo de treinamento */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col w-full">
                <span className="text-[14px] font-montserrat text-[#78787b]">Tempo de treinamento por dia:</span>
                <span className="text-[14px] font-montserrat font-bold text-black">
                  {trainingTime || '15 min/dia'}
                </span>
              </div>
            </div>
          </div>

          {/* Trainers Block */}
          <div className="bg-[#f5f5f5] rounded-[12px] p-4 flex flex-col gap-3">
            <div className="relative w-full h-[200px] rounded-[8px] overflow-hidden">
              <Image
                src="/images/quiz/result-trainers.webp"
                alt="Treinadores PetGuia"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-[16px] font-bold font-montserrat text-[#000000] leading-tight mb-1">
                Tenha o acompanhamento de profissionais experientes
              </h3>
              <p className="text-[14px] font-montserrat text-[#6b7280] leading-normal">
                O seu plano é criado por profissionais em comportamento canino, com base em adestramento positivo.
              </p>
            </div>
          </div>
          
          {/* Referral Code Link */}
          <button 
            onClick={() => setShowReferralModal(true)}
            className="text-[#2a5fff] text-[14px] font-medium font-montserrat text-center underline"
          >
            Tem um código de indicação?
          </button>
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100 flex justify-center z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        <button
          onClick={handleUnlock}
          className="w-full max-w-[500px] py-[16px] px-8 rounded-[12px] bg-[#2a5fff] text-white text-[18px] font-bold font-montserrat tracking-[-0.18px] hover:bg-[#2550d9] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
        >
          Quero desbloquear o plano
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[320px] bg-white rounded-[20px] p-6 animate-in zoom-in-95 duration-200 shadow-2xl">
            <h2 className="text-[18px] font-bold font-montserrat text-black mb-4 text-center">
              Código de indicação
            </h2>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Digite o código"
              className="w-full p-3 bg-[#f5f5f5] rounded-[8px] text-[16px] font-montserrat mb-4 focus:outline-none focus:ring-2 focus:ring-[#2a5fff]"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowReferralModal(false)}
                className="flex-1 py-3 text-[#78787b] font-medium font-montserrat text-[14px] bg-gray-100 rounded-[8px]"
              >
                Cancelar
              </button>
              <button 
                onClick={handleApplyCode}
                className="flex-1 py-3 text-white font-medium font-montserrat text-[14px] bg-[#2a5fff] rounded-[8px]"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
