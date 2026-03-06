'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const PLAN_PRODUCT_ID: Record<string, string> = {
  annual:     'anual_petguia_web',
  semiannual: 'semestral_petguia_web',
  monthly:    'mensal_petguia_web',
  week1:      '7dias_petguia_web',
  week4:      '4semanas_petguia_web',
  week12:     '12semanas_petguia_web',
};

function calcCurrentPeriodEnd(planType: string | null): string {
  const now = new Date();
  switch (planType) {
    case 'annual':
      now.setFullYear(now.getFullYear() + 1);
      break;
    case 'semiannual':
      now.setMonth(now.getMonth() + 6);
      break;
    case 'week12':
      now.setDate(now.getDate() + 84);
      break;
    case 'week4':
      now.setDate(now.getDate() + 28);
      break;
    case 'week1':
      now.setDate(now.getDate() + 7);
      break;
    default:
      // monthly ou desconhecido → +1 mês
      now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  const subscriptionId = searchParams.get('subscription_id') || null;
  const planTypeFromQuery = searchParams.get('plan_type') || null;
  const productIdFromQuery = searchParams.get('product_id') || null;

  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadyExists, setAlreadyExists] = useState(false);

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setAlreadyExists(false);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Por favor, verifique.');
      return;
    }

    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        if (
          signUpError.message.toLowerCase().includes('already registered') ||
          signUpError.message.toLowerCase().includes('already exists') ||
          signUpError.status === 422
        ) {
          setAlreadyExists(true);
        } else {
          setError(signUpError.message);
        }
        return;
      }

      const userId = signUpData?.user?.id;
      if (userId) {
        const resolvedProductId = productIdFromQuery
          ?? (planTypeFromQuery ? PLAN_PRODUCT_ID[planTypeFromQuery] ?? null : null);

        const { error: insertError } = await supabase.from('subscriptions').insert({
          user_id: userId,
          email,
          status: 'active',
          plan_type: planTypeFromQuery,
          product_id: resolvedProductId,
          external_id: subscriptionId,
          current_period_end: calcCurrentPeriodEnd(planTypeFromQuery),
          is_trial: false,
          will_renew: true,
          period_type: 'NORMAL',
          last_webhook_event: 'account_created_web',
          webhook_updated_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('[Success] Erro ao inserir subscription no Supabase:', insertError);
        }
      } else {
        console.warn('[Success] signUp bem-sucedido mas user.id não retornado — subscription não inserida.');
      }

      window.location.href = 'https://petguiabrasil.com.br/app';
    } catch {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

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
          Parabéns, você agora é usuário (a) do maior aplicativo de cães do Brasil!
        </h1>
        <p className="text-[#6b7280] text-sm leading-relaxed">
          Crie seu login abaixo para entrar no aplicativo PetGuia.
        </p>
      </div>

      {/* Sign up form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4 text-left">
        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-semibold text-[#111827]">
            E-mail:
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a5fff] focus:border-transparent"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-semibold text-[#111827]">
            Crie sua senha:
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a5fff] focus:border-transparent"
          />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-[#111827]">
            Confirme sua senha:
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita sua senha"
            className={`w-full border rounded-xl px-4 py-3 text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#2a5fff] focus:border-transparent ${
              passwordMismatch ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {passwordMismatch && (
            <p className="text-red-500 text-xs mt-1">As senhas não coincidem.</p>
          )}
        </div>

        {/* Generic error */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Already exists message */}
        {alreadyExists && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-700 text-sm text-center">
              Você já tem uma conta! Faça login no app com seu email e senha.
            </p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || passwordMismatch || !email || !password || !confirmPassword}
          className="w-full bg-[#2a5fff] hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar conta'
          )}
        </button>
      </form>
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
