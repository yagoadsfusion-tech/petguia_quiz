'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { track } from '@/lib/mixpanelClient';
import { getVariantePay } from '@/lib/abTest';
import { useQuizStore } from '@/store/quizStore';

const exitTitleMap: Record<string, string> = {
  'Xixi fora do lugar': 'Com o PetGuia, seu cão para de errar o local do xixi em 7 dias',
  'Mordidas': 'Com o PetGuia, seu cão para de morder em 3 dias',
  'Latidos em excesso': 'Com o PetGuia, seu cão para de latir excessivamente em 1 semana',
  'Puxar guia': 'Com o PetGuia, seu cão aprende a caminhar sem puxar em 1 semana',
  'Comandos básicos': 'Com o PetGuia, seu cão aprende mais de 50 comandos de adestramento',
  'Treino geral': 'Com o PetGuia, seu cão aprende mais de 50 comandos de adestramento',
};

const EXIT_FALLBACK_TITLE = 'Com o PetGuia, seu cão se torna obediente em poucos dias';

function ExitContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { flow: quizFlow } = useQuizStore();
  const flow = quizFlow ?? 'behavior';

  const problem = searchParams.get('problem') || '';
  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';

  const graphTitle = exitTitleMap[problem] ?? EXIT_FALLBACK_TITLE;

  useEffect(() => {
    const paywall_origem = getVariantePay();
    track(`${flow}_exit_visualizado`, { paywall_origem });
  }, [flow]);

  const handleGetDiscount = () => {
    track(`${flow}_exit_cta_clicado`, { paywall_origem: getVariantePay() });
    const params = new URLSearchParams();
    if (problem) params.set('problem', problem);
    if (name) params.set('name', name);
    if (email) params.set('email', email);
    params.set('from', 'exit');
    router.push(`/offer?${params.toString()}`);
  };

  return (
    <div className="min-h-[100dvh] max-w-[500px] mx-auto flex flex-col bg-[#FAF8F4]">

      {/* Seção do gráfico */}
      <div className="flex-1 flex flex-col justify-center px-4 pt-6 pb-2">

        {/* Título dinâmico — fora do container relativo */}
        <h2 className="text-[17px] font-bold text-gray-900 text-center mb-4 leading-snug px-2">
          {graphTitle}
        </h2>

        {/* Container do gráfico com sobreposições */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#FAF8F4]">
          <Image
            src="/images/quiz/grafico.png"
            alt="Gráfico de progresso"
            width={800}
            height={500}
            className="w-full h-auto"
            priority
          />

          {/* Tag "Com o PetGuia" */}
          <span className="absolute top-[2%] right-[5%] bg-[#4CAF50] text-white text-[10px] font-bold px-3 py-1 rounded-full leading-tight">
            Com o PetGuia
          </span>

          {/* Tag "Sem o PetGuia" */}
          <span className="absolute top-[51%] right-[5%] bg-[#F97316] text-white text-[10px] font-bold px-3 py-1 rounded-full leading-tight">
            Sem o PetGuia
          </span>

          {/* Label "Agora" */}
          <span className="absolute bottom-[3%] left-[5%] text-[11px] font-bold text-[#666]">
            Agora
          </span>

          {/* Label "Após 1 semana" */}
          <span className="absolute bottom-[3%] right-[5%] text-[11px] font-bold text-[#4CAF50]">
            Após 1 semana
          </span>
        </div>
      </div>

      {/* Seção da oferta */}
      <div className="bg-white px-6 pt-6 pb-8 flex flex-col items-center gap-4 rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">

        {/* Imagem 65% off */}
        <div className="w-[60%]">
          <Image
            src="/images/quiz/exitoffer.png"
            alt="65% off"
            width={400}
            height={200}
            className="w-full h-auto"
            priority
          />
        </div>

        <h2 className="text-[22px] font-black text-gray-900 text-center leading-tight">
          Esta é a sua última oportunidade
        </h2>

        <p className="text-[14px] text-gray-500 text-center leading-relaxed">
          Aproveite o desconto exclusivo de 65% e veja a rapidez com que o seu
          cão aprende e obedece aos comandos!
        </p>

        <button
          onClick={handleGetDiscount}
          className="w-full h-[58px] bg-[#2a5fff] hover:bg-[#2550d9] active:scale-[0.98] transition-all rounded-full text-white font-bold text-[17px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(42,95,255,0.35)]"
        >
          Obter 65% de desconto →
        </button>
      </div>
    </div>
  );
}

export default function ExitPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 text-[#0a7ea4] animate-spin" />
        </div>
      }
    >
      <ExitContent />
    </Suspense>
  );
}
