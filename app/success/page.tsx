'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Tutor';
  const email = searchParams.get('email') || '';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center gap-6">
      {/* Logo */}
      <div className="mb-4">
        <Image
          src="/images/quiz/logo-quiz.png"
          alt="PetGuia"
          width={200}
          height={80}
          className="h-20 w-auto object-contain"
        />
      </div>

      {/* Check Icon */}
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
        <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 max-w-md">
        <h1 className="text-[#111827] text-2xl font-bold">
          Parabéns, {name}! Seu plano está ativo.
        </h1>
        <p className="text-[#6b7280] text-sm leading-relaxed">
          Você receberá um e-mail de confirmação em breve. Baixe o app PetGuia para começar!
        </p>
      </div>

      {/* Email info */}
      {email && (
        <div className="w-full max-w-sm bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-1">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Acesse o app com o e-mail</p>
          <p className="text-[#111827] font-bold text-base break-all">{email}</p>
          <p className="text-[#6b7280] text-xs mt-1">
            Use esse e-mail para fazer login no app PetGuia e acessar seu plano.
          </p>
        </div>
      )}

      {/* Button */}
      <Link
        href="https://apps.apple.com/br/app/petguia/id6737484607"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-sm bg-[#2a5fff] hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors mt-4"
      >
        Baixar o PetGuia
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SuccessContent />
    </Suspense>
  );
}
