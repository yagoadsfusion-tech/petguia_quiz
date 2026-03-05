import { useEffect, useState, useMemo, useRef } from 'react';
import { useQuizStore } from '@/store/quizStore';
import Image from 'next/image';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Lottie from 'lottie-react';
import meditatingDogAnimation from '@/public/images/animation/MeditatingDog1.json';

export const PreparationStep = () => {
  const { nextStep, dogName, dogBreed, setEmail } = useQuizStore();
  const [completedItems, setCompletedItems] = useState<number[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');

  // Tracks whether the popup has already been shown and confirmed
  const emailConfirmedRef = useRef(false);
  // Holds the timer that would advance the checklist/next step
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checklist = useMemo(() => [
    `Analisando perfil de ${dogName}`,
    `Identificando necessidades da raça ${dogBreed || 'Cão'}`,
    'Selecionando melhores treinos',
    'Montando plano personalizado',
  ], [dogName, dogBreed]);

  const testimonials = [
    { name: 'Ana S.', text: 'Meu cachorro mudou completamente! O plano é muito fácil de seguir.', image: '/images/quiz/social-proof-depoimento-1.webp' },
    { name: 'Sandra M.', text: 'Recomendo muito, super fácil de seguir e os resultados são rápidos.', image: '/images/quiz/social-proof-depoimento-2.webp' },
    { name: 'Julia R.', text: 'O melhor investimento que fiz para a educação do meu pet.', image: '/images/quiz/social-proof-depoimento-3.webp' },
    { name: 'Liliana L.', text: 'Amei as dicas para filhotes, me ajudou muito na adaptação.', image: '/images/quiz/social-proof-depoimento-4.webp' },
    { name: 'Mariana T.', text: 'Finalmente consegui ensinar o "fica" e outros comandos básicos.', image: '/images/quiz/social-proof-depoimento-5.webp' },
    { name: 'Juliana F.', text: 'Muito prático e direto ao ponto. Vale cada centavo.', image: '/images/quiz/social-proof-depoimento-6.webp' },
    { name: 'Sofia G.', text: 'Minha rotina está muito mais tranquila depois que comecei o plano.', image: '/images/quiz/social-proof-depoimento-7.webp' },
    { name: 'Roberta P.', text: 'O suporte é excelente e o conteúdo é de primeira qualidade.', image: '/images/quiz/social-proof-depoimento-8.webp' },
  ];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Items 0, 1, 2 appear at 1.5s, 3.0s, 4.5s
    for (let i = 0; i < 3; i++) {
      const t = setTimeout(() => {
        setCompletedItems(prev => [...prev, i]);

        // After 3rd item (index 2) appears, show the email popup
        if (i === 2 && !emailConfirmedRef.current) {
          setShowEmailPopup(true);
        }
      }, 1500 * (i + 1));
      timers.push(t);
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  // Called when user confirms email — resumes the paused flow
  const handleEmailConfirm = () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setEmailError('Por favor, insira um e-mail válido.');
      return;
    }

    setEmail(trimmed);
    emailConfirmedRef.current = true;
    setShowEmailPopup(false);

    // Resume: 4th item after 1.5s, then advance step after 3s
    const t4 = setTimeout(() => {
      setCompletedItems(prev => [...prev, 3]);
    }, 1500);

    const tNext = setTimeout(() => {
      nextStep();
    }, 3000);

    pendingTimerRef.current = tNext;

    return () => {
      clearTimeout(t4);
      clearTimeout(tNext);
    };
  };

  useEffect(() => {
    // Testimonial carousel
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="flex flex-col h-full px-6 pb-8 pt-4 bg-white overflow-hidden">
      <div className="flex flex-col items-center mb-4">
        {/* Circular Progress */}
        <div className="relative w-40 h-40 mb-4">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="80" cy="80" r="72" fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
              cx="80" cy="80" r="72" fill="none" stroke="#3b82f6" strokeWidth="6"
              strokeDasharray="452"
              strokeDashoffset="452"
              style={{ animation: 'dash 7s linear forwards' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Lottie animationData={meditatingDogAnimation} loop className="w-28 h-28 translate-x-1" />
          </div>
        </div>

        <h2 className="text-[20px] font-black font-bbanonym text-[#2a5fff] mb-4 text-center tracking-[-0.25px]">
          Preparando seu plano...
        </h2>

        {/* Checklist */}
        <div className="w-full flex flex-col gap-4 mb-4 max-w-[320px]">
          {checklist.map((item, index) => {
            const isCompleted = completedItems.includes(index);
            return (
              <div key={index} className="flex items-center gap-4">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 border-2 flex-shrink-0',
                  isCompleted ? 'bg-[#10b981] border-[#10b981]' : 'bg-transparent border-gray-200'
                )}>
                  {isCompleted && <Check className="text-white w-4 h-4" />}
                </div>
                <p className={cn(
                  'font-montserrat text-[15px] transition-all duration-500',
                  isCompleted ? 'text-black font-bold' : 'text-gray-400 font-medium'
                )}>
                  {item}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="w-full flex flex-col items-center">
        <div className="relative w-full mb-1">
          <Image
            src="/images/quiz/preparation-louros.png"
            alt="Louros"
            width={320}
            height={30}
            className="w-full object-contain"
          />
          <p className="absolute inset-0 flex items-center justify-center text-[14px] font-bold font-montserrat text-[#78787b] text-center leading-tight px-12">
            Já ajudamos mais de 15.000 tutores a melhorar o comportamento dos seus cães
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="w-full relative h-[140px] overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
          >
            {testimonials.map((testimonial, i) => (
              <div key={i} className="w-full h-full flex-shrink-0 px-2 flex items-center justify-center">
                <div className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 p-4 w-full h-full flex flex-col justify-center items-center text-center">
                  <div className="flex items-center gap-3 mb-2 w-full justify-center">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[14px] font-bold text-[#333]">{testimonial.name}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star key={starIndex} className="w-3 h-3 fill-[#FFD700] text-[#FFD700]" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-600 font-montserrat italic line-clamp-2 leading-snug">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[320px] bg-white rounded-[16px] p-6 flex flex-col items-center gap-4 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Ícone */}
            <div className="relative w-24 h-24">
              <Image src="/images/quiz/emailcerto.webp" alt="E-mail" fill className="object-contain" />
            </div>

            {/* Título */}
            <h2 className="font-bbanonym text-[20px] font-black text-[#111827] text-center leading-tight">
              Para onde enviamos seu plano?
            </h2>

            {/* Subtítulo */}
            <p className="font-montserrat text-[14px] text-[#6b7280] text-center leading-snug">
              Digite seu e-mail para receber o plano personalizado de{' '}
              <span className="font-semibold text-[#111827]">{dogName || 'seu cão'}</span>
            </p>

            {/* Input */}
            <div className="w-full flex flex-col gap-1.5">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (emailError) setEmailError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailConfirm()}
                placeholder="seu@email.com"
                autoFocus
                className={cn(
                  'w-full px-4 py-3 rounded-[8px] border text-[15px] font-montserrat text-[#111827] outline-none transition-all',
                  emailError
                    ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-[#e5e7eb] focus:border-[#2a5fff] focus:ring-2 focus:ring-[#2a5fff]/10'
                )}
              />
              {emailError && (
                <p className="text-red-500 text-[12px] font-montserrat">{emailError}</p>
              )}
            </div>

            {/* Botão */}
            <button
              onClick={handleEmailConfirm}
              className="w-full py-[14px] bg-[#2a5fff] hover:bg-[#2550d9] active:scale-[0.98] text-white font-semibold font-montserrat text-[16px] rounded-[12px] transition-all"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
