'use client';

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, Shield, Loader2, Lock, ChevronLeft, X, ClipboardList } from 'lucide-react';
import { FaApplePay, FaGooglePay } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import { track } from '@/lib/mixpanelClient';
import { getVariantePay } from '@/lib/abTest';
import { useQuizStore } from '@/store/quizStore';

const OFFER_PLAN_NAME_MAP: Record<string, string> = {
  week1:  '7_dias',
  week4:  '4_semanas',
  week12: '12_semanas',
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// PRODUÇÃO:
const OFFER_PRICE_IDS = {
  week1:  'price_1T7ys66oqWcsG0cdnODbhaHM',
  week4:  'price_1T7ysi6oqWcsG0cdSAKOqZc2',
  week12: 'price_1T7ytG6oqWcsG0cdipvSkiBE',
} as const;

// TESTE:
// const OFFER_PRICE_IDS = {
//   week1:  'price_1T82ry6oqWcsG0cdTqbgNVHZ',
//   week4:  'price_1T82ry6oqWcsG0cdTqbgNVHZ',
//   week12: 'price_1T82ry6oqWcsG0cdTqbgNVHZ',
// } as const;

type WeeklyPlanType = keyof typeof OFFER_PRICE_IDS;

interface WeeklyPlan {
  id: WeeklyPlanType;
  name: string;
  price: number;
  originalPrice: number;
  perDay: number;
  perWeek: number;
  popular: boolean;
}

const WEEKLY_PLANS: WeeklyPlan[] = [
  { id: 'week1',  name: 'Plano de 7 dias',    price: 29.90, originalPrice: 69.90,  perDay: 4.27, perWeek: 29.90, popular: false },
  { id: 'week4',  name: 'Plano de 4 semanas', price: 39.90, originalPrice: 129.90, perDay: 1.43, perWeek: 9.98,  popular: false },
  { id: 'week12', name: 'Plano de 12 semanas',price: 59.90, originalPrice: 199.90, perDay: 0.71, perWeek: 4.99,  popular: true  },
];

interface PlanForForm {
  name: string;
  price: number;
  originalPrice: number;
  monthlyEquivalent: number;
}

// --- Payment Form ---

const PaymentForm = ({
  onBack,
  selectedPlan,
  subscriptionId,
  userEmail,
  petName,
  planId,
  priceId,
  flow,
}: {
  onBack: () => void;
  selectedPlan: PlanForForm;
  subscriptionId: string;
  userEmail: string;
  petName: string;
  planId: string;
  priceId: string;
  flow: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ email: userEmail });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'link'>('card');
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [expressAvailable, setExpressAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const android = /Android/.test(navigator.userAgent);
    setIsIOS(ios);
    setIsAndroid(android);
    if (!ios && !android) setPaymentMethod('link');
  }, []);

  useEffect(() => {
    window.fbq?.('track', 'InitiateCheckout', {
      currency: 'BRL',
      value: selectedPlan.price,
      content_ids: [priceId],
      contents: [{ id: priceId, quantity: 1 }],
      num_items: 1,
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    if (paymentMethod === 'card') {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Por favor, preencha o e-mail corretamente.');
        return;
      }

      setIsProcessing(true);
      setErrorMessage(null);
      const email = formData.email.trim();

      try {
        const successUrl = `/success?name=${encodeURIComponent(petName)}&email=${encodeURIComponent(email)}&plan_type=${encodeURIComponent(planId)}&subscription_id=${encodeURIComponent(subscriptionId)}`;

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}${successUrl}`,
            payment_method_data: { billing_details: { email } },
          },
          redirect: 'if_required',
        });

        if (error) {
          setErrorMessage(error.message ?? 'Ocorreu um erro desconhecido.');
          setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          track(`${flow}_compra_concluida`, {
            plano: OFFER_PLAN_NAME_MAP[planId] ?? planId,
            variante: getVariantePay(),
            source: 'exitoffer',
          });
          window.fbq?.('track', 'Purchase', {
            currency: 'BRL',
            value: selectedPlan.price,
            content_ids: [priceId],
            contents: [{ id: priceId, quantity: 1 }],
            num_items: 1,
          });
          window.location.href = successUrl;
        }
      } catch (e: any) {
        setErrorMessage(e.message || 'Erro no pagamento');
        setIsProcessing(false);
      }
    }
  };

  const onExpressConfirm = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);

    const email = formData.email.trim() || userEmail;
    const successUrl = `/success?name=${encodeURIComponent(petName)}&email=${encodeURIComponent(email)}&plan_type=${encodeURIComponent(planId)}&subscription_id=${encodeURIComponent(subscriptionId)}`;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}${successUrl}` },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message ?? 'Ocorreu um erro desconhecido.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      track(`${flow}_compra_concluida`, {
        plano: OFFER_PLAN_NAME_MAP[planId] ?? planId,
        variante: getVariantePay(),
        source: 'exitoffer',
      });
      window.fbq?.('track', 'Purchase', {
        currency: 'BRL',
        value: selectedPlan.price,
        content_ids: [priceId],
        contents: [{ id: priceId, quantity: 1 }],
        num_items: 1,
      });
      window.location.href = successUrl;
    }
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="relative flex items-center justify-center max-w-lg mx-auto">
          <button
            onClick={onBack}
            className="absolute left-0 p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <Image
            src="/images/quiz/logo-quiz.png"
            alt="PetGuia"
            width={240}
            height={80}
            className="h-[80px] w-auto object-contain"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="max-w-[480px] mx-auto">
          <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-6">

            {/* Resumo do Plano */}
            <div className="bg-[#f9fafb] rounded-[8px] p-3 mb-6 flex items-start gap-3 border border-gray-100">
              <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-[#2a5fff]" />
              </div>
              <div className="flex flex-col">
                <p className="text-[#111827] text-sm font-bold leading-tight">
                  {selectedPlan.name} •{' '}
                  <span className="text-[#2a5fff]">{formatCurrency(selectedPlan.price)}</span>
                </p>
                <p className="text-[#6b7280] text-xs font-medium mt-0.5">
                  Equivalente a {formatCurrency(selectedPlan.monthlyEquivalent)}/semana
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold text-[#111827]">Informações de pagamento</h2>
              <div className="flex items-center gap-1 bg-[#f0fdf4] px-2 py-1 rounded border border-[#dcfce7]">
                <Lock className="w-3 h-3 text-[#16a34a]" />
                <span className="text-[#16a34a] text-[12px] font-medium">Protegido</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Express Pay (Apple Pay / Google Pay / Link) — condicional ao SO e disponibilidade */}
              {(isIOS || isAndroid || expressAvailable !== false) && (
              <div
                onClick={() => setPaymentMethod(isIOS ? 'apple_pay' : isAndroid ? 'google_pay' : 'link')}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay' || paymentMethod === 'link')
                    ? 'border-[#16a34a] bg-white'
                    : 'border-[#e5e7eb] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay' || paymentMethod === 'link')
                        ? 'border-[#16a34a] bg-[#16a34a]'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {(paymentMethod === 'apple_pay' || paymentMethod === 'google_pay' || paymentMethod === 'link') && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-bold text-[#111827]">
                      {isIOS ? 'Apple Pay' : isAndroid ? 'Google Pay' : 'Pagamento Rápido'}
                    </span>
                  </div>
                  {isIOS
                    ? <FaApplePay className="h-10 w-auto text-[#111827]" />
                    : isAndroid
                      ? <FaGooglePay className="h-10 w-auto text-[#111827]" />
                      : null
                  }
                </div>

                {(paymentMethod === 'apple_pay' || paymentMethod === 'google_pay' || paymentMethod === 'link') && (
                  <div className="mt-4 pl-8 animate-in slide-in-from-top-2 fade-in duration-200">
                    <ul className="flex flex-col gap-2.5 mb-5">
                      {isIOS ? (
                        <>
                          <li className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                            <Check className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                            <span>Pagamentos fáceis e privados com o Face/Touch ID</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                            <Check className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                            <span>Mantém suas informações financeiras seguras com criptografia de ponta a ponta</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                            <Check className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                            <span>Protegido pelo número de conta de dispositivo exclusivo do Apple Pay</span>
                          </li>
                        </>
                      ) : isAndroid ? (
                        <>
                          <li className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                            <Check className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                            <span>Pagamentos rápidos e seguros com a sua conta Google</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                            <Check className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                            <span>Mantém suas informações financeiras seguras com criptografia de ponta a ponta</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                            <Check className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                            <span>Nenhuma informação financeira compartilhada com o comerciante</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                            <Check className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                            <span>Pague com um clique usando seus dados salvos no Stripe</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                            <Check className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                            <span>Informações de pagamento protegidas com criptografia de ponta a ponta</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                            <Check className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                            <span>Usado em milhões de compras ao redor do mundo</span>
                          </li>
                        </>
                      )}
                    </ul>
                    <div className="w-full">
                      <ExpressCheckoutElement
                        onReady={(event) => {
                          const m = event.availablePaymentMethods;
                          const available = !!(
                            (isIOS && m?.applePay) ||
                            (isAndroid && m?.googlePay) ||
                            m?.link
                          );
                          setExpressAvailable(available);
                          if (!available) setPaymentMethod('card');
                        }}
                        onConfirm={onExpressConfirm}
                        options={{
                          paymentMethods: {
                            applePay: isIOS ? 'auto' : 'never',
                            googlePay: isAndroid ? 'auto' : 'never',
                            link: 'auto',
                          },
                          buttonTheme: { applePay: 'black', googlePay: 'black' },
                          buttonType: { applePay: 'buy', googlePay: 'buy' },
                          layout: { maxColumns: 1, maxRows: 2 },
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Cartão de crédito */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-[#16a34a] bg-white' : 'border-[#e5e7eb] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'card' ? 'border-[#16a34a] bg-[#16a34a]' : 'border-gray-300 bg-white'
                    }`}>
                      {paymentMethod === 'card' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-bold text-[#111827]">Cartão de crédito</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-80">
                    <div className="h-5 w-8 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png)' }} />
                    <div className="h-5 w-8 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg)' }} />
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#374151] mb-1.5 ml-1">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3.5 rounded-xl bg-[#f3f4f6] border-0 focus:ring-2 focus:ring-[#2a5fff] outline-none transition-all placeholder-gray-400 text-gray-900 font-medium"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="min-h-[200px]">
                      <PaymentElement options={{ terms: { card: 'never' } }} />
                    </div>
                    <button
                      type="submit"
                      disabled={!stripe || isProcessing}
                      className="w-full bg-[#2a5fff] hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-[8px] mt-6 shadow-[0_4px_12px_rgba(42,95,255,0.3)] disabled:opacity-70 flex items-center justify-center text-[16px] transition-all active:scale-[0.98]"
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar pagamento'}
                    </button>
                    {errorMessage && (
                      <div className="text-[#ef4444] text-sm mt-3 font-medium bg-red-50 p-2.5 rounded-lg border border-red-100 text-center">
                        {errorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>

            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-[#16a34a] font-medium text-sm">
                <Shield className="w-4 h-4" />
                <span>Garantia de devolução do dinheiro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Offer Content ---

const PAYWALL_COPY: Record<string, { title: (name: string) => string; subtitle: string | null }> = {
  behavior: {
    title: () => 'Resultados visíveis com apenas 7 dias de treino',
    subtitle: null,
  },
  commands: {
    title: (name) => `Ensine ${name} a obedecer de verdade`,
    subtitle: 'Treinos práticos para um cão atento e obediente no dia a dia',
  },
  puppy: {
    title: (name) => `Comece certo com ${name}`,
    subtitle: 'O guia completo para educar seu filhote desde os primeiros dias',
  },
  general: {
    title: (name) => `Evolua o comportamento de ${name}`,
    subtitle: 'Treinos simples e no seu ritmo para um cão mais calmo e equilibrado',
  },
};

function OfferContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { flow: quizFlow, dogName: storeDogName } = useQuizStore();
  const flow = quizFlow ?? 'behavior';

  const problem = searchParams.get('problem') || '';
  const name = searchParams.get('name') || storeDogName || 'seu cão';
  const emailFromUrl = searchParams.get('email') || '';

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [selectedPlan, setSelectedPlan] = useState<WeeklyPlanType>('week12');
  const [view, setView] = useState<'paywall' | 'checkout'>('paywall');
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState(emailFromUrl);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const hasEmailFromUrl = emailFromUrl.includes('@');

  useEffect(() => {
    track(`${flow}_oferta_visualizada`, { paywall_origem: getVariantePay() });
  }, [flow]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleStartCheckout = async (email: string) => {
    track(`${flow}_checkout_iniciado`, {
      plano: OFFER_PLAN_NAME_MAP[selectedPlan] ?? selectedPlan,
      variante: getVariantePay(),
      source: 'exitoffer',
    });
    setIsLoadingCheckout(true);
    setCheckoutError(null);
    try {
      const priceId = OFFER_PRICE_IDS[selectedPlan];
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClientSecret(data.clientSecret);
      setSubscriptionId(data.subscriptionId);
      setCheckoutEmail(email);
      setView('checkout');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      setCheckoutError(error?.message || 'Erro ao iniciar o pagamento. Tente novamente.');
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  const handleCTA = () => {
    const email = checkoutEmail.trim();
    if (!email || !email.includes('@')) {
      setCheckoutError('Por favor, insira um e-mail válido para continuar.');
      return;
    }
    setCheckoutError(null);
    handleStartCheckout(email);
  };

  if (view === 'checkout' && clientSecret) {
    const plan = WEEKLY_PLANS.find((p) => p.id === selectedPlan)!;
    const appearance = {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2a5fff',
        colorBackground: '#ffffff',
        colorText: '#111827',
        colorDanger: '#ef4444',
        borderRadius: '8px',
        fontFamily: 'Montserrat, sans-serif',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': { border: '1px solid #d1d5db', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', padding: '12px' },
        '.Input:focus': { border: '1px solid #2a5fff', boxShadow: '0 0 0 3px rgba(42,95,255,0.1)' },
        '.Label': { fontWeight: '500', color: '#374151', marginBottom: '6px' },
      },
    };

    return (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <PaymentForm
          onBack={() => setView('paywall')}
          selectedPlan={{ name: plan.name, price: plan.price, originalPrice: plan.originalPrice, monthlyEquivalent: plan.perWeek }}
          subscriptionId={subscriptionId}
          userEmail={checkoutEmail}
          petName={name}
          planId={selectedPlan}
          priceId={OFFER_PRICE_IDS[selectedPlan]}
          flow={flow}
        />
      </Elements>
    );
  }

  const currentPlan = WEEKLY_PLANS.find((p) => p.id === selectedPlan)!;

  const paywallCopy = PAYWALL_COPY[flow] ?? PAYWALL_COPY['behavior'];
  const paywallTitle = paywallCopy.title(name);
  const paywallSubtitle = paywallCopy.subtitle;

  return (
    <div className="min-h-[100dvh] max-w-[500px] mx-auto flex flex-col bg-[#FAF8F4]">

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-10 flex flex-col">

        {/* 1. Título */}
        <div className="bg-white px-8 pt-6 pb-4 flex flex-col items-center gap-1">
          <h1 className="text-[19px] font-semibold text-gray-800 text-center leading-snug max-w-[300px]">
            {paywallTitle}
          </h1>
          {paywallSubtitle && (
            <p className="text-[14px] text-gray-500 text-center leading-snug max-w-[300px]">
              {paywallSubtitle}
            </p>
          )}
        </div>

        {/* 2. Imagem + 3. Faixa timer */}
        <div className="flex flex-col">
          <div className="relative w-full">
            <Image
              src="/images/quiz/pay2.png"
              alt="Treinamento com seu cão"
              width={500}
              height={500}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Faixa timer colada na imagem */}
          <div className="bg-[#F97316] flex items-center justify-between px-5 py-3">
            <span className="text-white text-[15px] font-semibold">A oferta pessoal expira</span>
            <span className="text-white text-[22px] font-black tabular-nums tracking-wide">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-4">

          {/* 4. Card de presente */}
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
            <div className="flex-shrink-0 w-16 h-16 relative">
              <Image
                src="/images/quiz/presente.png"
                alt="Presente"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-[15px] font-bold text-gray-900 leading-snug">
              Obtenha seu plano<br />
              <span className="font-extrabold text-[#2a5fff]">com um desconto especial</span>
            </p>
          </div>

          {/* 5. Seção de planos */}
          <div className="flex flex-col gap-3">
            {WEEKLY_PLANS.map((plan) => (
              <div key={plan.id} className={`relative ${plan.popular ? 'mt-2' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 z-10 bg-blue-500 text-white text-[10px] font-bold px-3 py-[3px] rounded-full whitespace-nowrap">
                    MAIS POPULAR
                  </div>
                )}
                <div
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    track(`${flow}_oferta_plano_selecionado`, {
                      plano: OFFER_PLAN_NAME_MAP[plan.id] ?? plan.id,
                      paywall_origem: getVariantePay(),
                    });
                  }}
                  className={`relative rounded-xl px-4 py-3 border-2 transition-all cursor-pointer ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-blue-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${
                        selectedPlan === plan.id ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'
                      }`}>
                        {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-[15px]">{plan.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 line-through decoration-red-500/50">
                            {formatCurrency(plan.originalPrice)}
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            {formatCurrency(plan.price)}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          Equivalente a {formatCurrency(plan.perWeek)} na semana
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(plan.perDay)}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">/dia</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 6. Card 98% */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-[13px] text-gray-600 leading-relaxed">
              <span className="text-[#2a5fff] font-black">98% dos nossos usuários</span>{' '}
              notam mudanças positivas no comportamento de seus cães em apenas 1 semana após o
              início do treinamento com nossos especialistas
            </p>
          </div>

          {/* 7. Email input (se necessário) + Botão CTA */}
          <div className="flex flex-col gap-2 mt-1">
            {!hasEmailFromUrl && (
              <input
                type="email"
                value={checkoutEmail}
                onChange={(e) => setCheckoutEmail(e.target.value)}
                placeholder="Digite seu e-mail para continuar"
                className="w-full px-4 py-3.5 rounded-xl bg-white border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-medium placeholder-gray-400 text-sm"
              />
            )}
            <button
              onClick={handleCTA}
              disabled={isLoadingCheckout}
              className="w-full h-[60px] bg-[#2a5fff] hover:bg-[#2550d9] active:scale-[0.98] transition-all rounded-full text-white font-black text-[18px] flex items-center justify-center shadow-[0_4px_16px_rgba(42,95,255,0.4)] disabled:opacity-70"
            >
              {isLoadingCheckout ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'Garantir a oferta'
              )}
            </button>
            {checkoutError && (
              <p className="text-red-500 text-sm text-center font-medium">{checkoutError}</p>
            )}
          </div>

          {/* 8. Garantia de reembolso — ícone + texto */}
          <div className="flex items-center justify-center gap-2 text-[#16a34a] font-semibold text-sm">
            <Shield className="w-4 h-4" />
            <span>Garantia de reembolso</span>
          </div>

          {/* 9. Card verde — Garantia de 30 dias */}
          <div style={{ position: 'relative', paddingTop: '48px', marginBottom: '8px' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
              <Image
                src="/images/checkout/golden.webp"
                alt="Golden Retriever"
                width={96}
                height={96}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div style={{
              background: '#ffffff',
              border: '2.5px solid #16a34a',
              borderRadius: '20px',
              padding: '60px 24px 32px',
              textAlign: 'center',
            }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', lineHeight: 1.2, marginBottom: '12px' }}>
                Garantia de 30 dias para reembolso
              </h2>
              <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, marginBottom: '12px' }}>
                Confiamos tanto no Método PetGuia que, se você seguir as missões por 7 dias e não
                notar nenhuma melhoria no comportamento do {name}, devolvemos 100% do seu dinheiro.
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
                Para mais informações, consulte nossas{' '}
                <a href="mailto:contato@petguiabrasil.com.br" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                  condições de uso
                </a>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function OfferPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
        </div>
      }
    >
      <OfferContent />
    </Suspense>
  );
}
