'use client';

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    ttq: {
      track: (event: string, data?: object, options?: object) => void;
      identify: (data: object) => void;
      page: () => void;
    };
  }
}

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Check, Users, Shield, Loader2, ChevronDown, ChevronUp, Lock, ClipboardList, X } from 'lucide-react';
import { FaApplePay, FaGooglePay } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements, ExpressCheckoutElement } from '@stripe/react-stripe-js';
import { STRIPE_PRICES_SEMANAL } from '@/constants/stripePrices';
import { track } from '@/lib/mixpanelClient';
import { useQuizStore } from '@/store/quizStore';

const PLAN_NAME_MAP: Record<string, string> = {
  annual:     'anual',
  semiannual: 'semestral',
  monthly:    'mensal',
  week1:      '7_dias',
  week4:      '4_semanas',
  week12:     '12_semanas',
};

// --- Stripe Setup ---
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- Types ---

type PlanType = 'monthly';

interface Plan {
  id: PlanType;
  name: string;
  price: number;
  originalPrice: number;
  monthlyEquivalent: number;
}

type WeeklyPlanType = keyof typeof STRIPE_PRICES_SEMANAL;

interface WeeklyPlan {
  id: WeeklyPlanType;
  name: string;
  price: number;
  originalPrice: number;
  perDay: number | null;
  perWeek: number;
  popular: boolean;
}

const WEEKLY_PLANS: WeeklyPlan[] = [
  { id: 'week1',  name: 'Plano de 7 dias',     price: 19.90, originalPrice: 69.90,  perDay: null, perWeek: 19.90, popular: false },
  { id: 'week4',  name: 'Plano de 4 semanas',   price: 29.90, originalPrice: 129.90, perDay: 0.99, perWeek: 7.48, popular: true  },
  { id: 'week12', name: 'Plano de 12 semanas',  price: 69.90, originalPrice: 199.90, perDay: 0.83, perWeek: 5.83, popular: false },
];

const TESTIMONIALS = [
  {
    name: 'Carol Menezes',
    handle: '@carol_menezes',
    dog: 'Mel',
    text: 'Eu já não aguentava mais limpar xixi pela casa...',
    image: '/images/checkout/depoimento1.jpeg',
    54: '',
  },
  {
    name: 'Felipe G.',
    handle: '@felipe.g',
    dog: 'Max',
    text: 'Meu cachorro latia até com o vento...',
    image: '/images/checkout/depoimento2.jpeg',
  },
  {
    name: 'Lais Souza',
    handle: '@lais.souza',
    dog: 'Sirius',
    text: 'Era desesperador, todo dia um estrago novo...',
    image: '/images/checkout/depoimento3.jpeg',
  },
  {
    name: 'Maria Silva',
    handle: '@maria.silva',
    dog: 'Scooby',
    text: 'O PetGuia transformou completamente o comportamento do meu cão!',
    image: '/images/checkout/depoimento4.jpeg',
  },
];

const FAQS = [
  { 
    question: "Quanto tempo demora até ver resultados do treino?", 
    answer: "A maioria dos cães mostra progresso logo após a primeira sessão — e, em apenas algumas semanas, verá resultados impressionantes e significativos!" 
  },
  { 
    question: "O PetGuia é tão eficaz como trabalhar com um treinador?", 
    answer: "O PetGuia foi desenvolvido por especialistas em comportamento canino e oferece treinos personalizados para o seu cão, com a praticidade de fazer em casa no seu ritmo." 
  },
  { 
    question: "Os resultados do treino são permanentes?", 
    answer: "Sim! O treinamento baseado em reforço positivo cria hábitos duradouros. Com consistência, os resultados se mantêm ao longo do tempo." 
  }
];

const BENEFITS = [
  { icon: '/images/checkout/img1.png', text: 'Plano de treinamento de cães personalizado' },
  { icon: '/images/checkout/img2.png', text: 'Apenas 15 minutos por dia para um animal de estimação perfeito' },
  { icon: '/images/checkout/img3.png', text: 'Mais de 70 lições em vídeo fáceis de entender para resultados rápidos' },
  { icon: '/images/checkout/img4.png', text: 'Mais de 80 jogos e truques para novas habilidades e diversão' },
  { icon: '/images/checkout/img5.png', text: 'Dicas sobre higiene, saúde e nutrição' },
  { icon: '/images/checkout/img6.png', text: 'Treine em casa e ao ar livre, sem equipamentos necessários' },
];

// --- Components ---

const titleMap: Record<string, string> = {
  'Xixi fora do lugar': 'Acabe com o xixi fora do lugar em 7 dias',
  'Mordidas': 'Pare com as mordidas rapidamente',
  'Latidos em excesso': 'Controle os latidos do seu cão em 7 dias',
  'Pula nas visitas': 'Seu cão calmo ao receber visitas',
  'Rói e danifica os móveis': 'Acabe com a destruição em casa em 7 dias',
  'Ansiedade de separação': 'Seu cão calmo quando você sai',
}

const subtitleMap: Record<string, string> = {
  'Xixi fora do lugar': `Ensine {name} a evitar erros com treinos simples diários para conquistar uma casa limpa`,
  'Mordidas': `Ensine {name} a controlar mordidas! Exercícios práticos para ensinar limites e autocontrole`,
  'Latidos em excesso': `Ensine {name} a ficar mais calmo! Treinos guiados para reduzir latidos e excesso de agitação`,
  'Pula nas visitas': `Ensine {name} a receber visitas com calma! Treinos guiados para reduzir pulos e excesso de excitação`,
  'Rói e danifica os móveis': `Ensine {name} a parar de destruir objetos! Rotina diária para direcionar energia do jeito certo`,
  'Ansiedade de separação': `Ensine {name} a ficar calmo quando você sair! Treinos progressivos para mais segurança e previsibilidade`,
}

const fallbackTitle = 'O programa de treino do seu cachorro começa agora!'
const fallbackSubtitle = `O PetGuia vai ajudar a resolver problemas de comportamento do {name} de forma rápida!`

// Dados de renovação por plano introdutório
const PLAN_RENEWAL_INFO: Record<string, { days: number; renewalPrice: number; periodLabel: string }> = {
  week1:  { days: 7,  renewalPrice: 49.90,  periodLabel: 'a cada 2 semanas' },
  week4:  { days: 28, renewalPrice: 99.90,  periodLabel: 'mensalmente' },
  week12: { days: 84, renewalPrice: 149.90, periodLabel: 'a cada 3 meses' },
};

// --- Checkout Components ---

const PaymentForm = ({ 
  onBack,
  onExit,
  selectedPlan,
  subscriptionId,
  userEmail,
  petName,
  equivalentLabel = '/mês',
  planId,
  priceId,
  variante,
  flow,
}: { 
  onBack?: () => void,
  onExit?: () => void,
  selectedPlan: Plan,
  subscriptionId: string,
  userEmail: string,
  petName: string,
  equivalentLabel?: string,
  planId: string,
  priceId: string,
  variante: 'A' | 'B',
  flow: string,
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
    // No desktop, pré-seleciona 'link' para que o ExpressCheckoutElement monte
    // e onReady possa detectar se o Link está disponível.
    // No mobile (iOS/Android), a tab sempre aparece baseada no OS — não precisamos
    // pré-selecionar, o que elimina o flash em emuladores/dispositivos sem o método configurado.
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
    window.ttq?.track('InitiateCheckout', {
      contents: [{ content_id: priceId, content_type: 'product', content_name: selectedPlan.name }],
      value: selectedPlan.price,
      currency: 'BRL',
    }, { event_id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}` });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    
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
            payment_method_data: {
              billing_details: {
                email,
              },
            },
          },
          redirect: 'if_required',
        });

        if (error) {
          setErrorMessage(error.message ?? 'Ocorreu um erro desconhecido.');
          setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          track(`${flow}_compra_concluida`, {
            plano: PLAN_NAME_MAP[planId] ?? planId,
            variante,
            source: 'paywall',
          });
          window.fbq?.('track', 'Purchase', {
            currency: 'BRL',
            value: selectedPlan.price,
            content_ids: [priceId],
            contents: [{ id: priceId, quantity: 1 }],
            num_items: 1,
          });
          window.ttq?.track('Purchase', {
            contents: [{ content_id: priceId, content_type: 'product', content_name: selectedPlan.name }],
            value: selectedPlan.price,
            currency: 'BRL',
          }, { event_id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}` });
          window.location.href = successUrl;
        }
      } catch (e: any) {
        setErrorMessage(e.message || 'Erro no pagamento');
        setIsProcessing(false);
      }
    }
  };

  const onExpressConfirm = async () => {
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);

    const email = formData.email.trim() || userEmail;
    const successUrl = `/success?name=${encodeURIComponent(petName)}&email=${encodeURIComponent(email)}&plan_type=${encodeURIComponent(planId)}&subscription_id=${encodeURIComponent(subscriptionId)}`;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${successUrl}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message ?? 'Ocorreu um erro desconhecido.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      track(`${flow}_compra_concluida`, {
        plano: PLAN_NAME_MAP[planId] ?? planId,
        variante,
        source: 'paywall',
      });
      window.fbq?.('track', 'Purchase', {
        currency: 'BRL',
        value: selectedPlan.price,
        content_ids: [priceId],
        contents: [{ id: priceId, quantity: 1 }],
        num_items: 1,
      });
      window.ttq?.track('Purchase', {
        contents: [{ content_id: priceId, content_type: 'product', content_name: selectedPlan.name }],
        value: selectedPlan.price,
        currency: 'BRL',
      }, { event_id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}` });
      window.location.href = successUrl;
    }
  };

  const renewalInfo = PLAN_RENEWAL_INFO[planId] ?? null;
  const introEndDate = renewalInfo ? (() => {
    const d = new Date();
    d.setDate(d.getDate() + renewalInfo.days);
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  })() : null;

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
       {/* Header */}
       <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="relative flex items-center justify-center max-w-lg mx-auto">
             {onBack && (
               <button 
                  onClick={onBack}
                  className="absolute left-0 p-2 hover:bg-gray-50 rounded-full transition-colors"
               >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
               </button>
             )}
             <Image 
                src="/images/quiz/logo-quiz.png" 
                alt="PetGuia" 
                width={240} 
                height={80} 
                className="h-[80px] w-auto object-contain"
             />
             {onExit && (
               <button
                 onClick={onExit}
                 className="absolute right-0 p-2 hover:bg-gray-50 rounded-full transition-colors"
               >
                 <X className="w-5 h-5 text-gray-600" />
               </button>
             )}
          </div>
       </div>

       {/* Content */}
       <div className="flex-1 px-4 py-8 overflow-y-auto">
          <div className="max-w-[480px] mx-auto">
             
             {/* Card de Pagamento */}
             <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-6">
                
                {/* Resumo do Plano */}
                <div className="bg-[#f9fafb] rounded-[8px] p-3 mb-6 flex items-start gap-3 border border-gray-100">
                  <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-[#2a5fff]" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[#111827] text-sm font-bold leading-tight">
                      {selectedPlan.name} • <span className="text-[#2a5fff]">{selectedPlan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </p>
                    <p className="text-[#6b7280] text-xs font-medium mt-0.5">
                      Equivalente a {selectedPlan.monthlyEquivalent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}{equivalentLabel}
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
                   
                   {/* Option: Express Pay (Apple Pay / Google Pay / Link) — condicional ao SO e disponibilidade */}
                   {(isIOS || isAndroid || expressAvailable !== false) && (
                   <div 
                      onClick={() => setPaymentMethod(isIOS ? 'apple_pay' : isAndroid ? 'google_pay' : 'link')}
                      className={`
                        border-2 rounded-lg p-4 cursor-pointer transition-all
                        ${(paymentMethod === 'apple_pay' || paymentMethod === 'google_pay' || paymentMethod === 'link')
                           ? 'border-[#16a34a] bg-white' 
                           : 'border-[#e5e7eb] bg-white'}
                      `}
                   >
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={`
                               w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0
                               ${(paymentMethod === 'apple_pay' || paymentMethod === 'google_pay' || paymentMethod === 'link')
                                  ? 'border-[#16a34a] bg-[#16a34a]' 
                                  : 'border-gray-300 bg-white'}
                            `}>
                               {(paymentMethod === 'apple_pay' || paymentMethod === 'google_pay' || paymentMethod === 'link') && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="font-bold text-[#111827]">
                                  {isIOS ? 'Apple Pay' : isAndroid ? 'Google Pay' : 'Pagamento Rápido'}
                               </span>
                            </div>
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
                                     buttonTheme: {
                                        applePay: 'black',
                                        googlePay: 'black',
                                     },
                                     buttonType: {
                                        applePay: 'buy',
                                        googlePay: 'buy',
                                     },
                                     layout: {
                                        maxColumns: 1,
                                        maxRows: 2
                                     }
                                  }}
                               />
                            </div>
                         </div>
                      )}
                   </div>
                   )}

                   {/* Option: Credit Card */}
                   <div 
                      onClick={() => setPaymentMethod('card')}
                      className={`
                        border-2 rounded-lg p-4 cursor-pointer transition-all
                        ${paymentMethod === 'card' 
                           ? 'border-[#16a34a] bg-white' 
                           : 'border-[#e5e7eb] bg-white'}
                      `}
                   >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`
                              w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0
                              ${paymentMethod === 'card' 
                                 ? 'border-[#16a34a] bg-[#16a34a]' 
                                 : 'border-gray-300 bg-white'}
                           `}>
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
                         <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div 
                               onClick={(e) => e.stopPropagation()} 
                               className="cursor-default"
                            >
                               <div className="mb-4">
                                  <label className="block text-sm font-medium text-[#374151] mb-1.5 ml-1">Email</label>
                                  <input
                                     type="email"
                                     required
                                     value={formData.email}
                                     onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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

             {/* Disclaimer de renovação */}
             <div className="mt-6 px-2">
               {renewalInfo && introEndDate ? (
                 <ul className="flex flex-col gap-2 text-xs text-gray-500 leading-relaxed list-disc pl-4">
                   <li>
                     Ao continuar, você autoriza a renovação automática da sua assinatura e concorda com nossos Termos e Condições e Política de Privacidade.
                   </li>
                   <li>
                     Hoje será cobrado apenas {selectedPlan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (período introdutório de {renewalInfo.days} dias).
                   </li>
                   <li>
                     O período introdutório termina em {introEndDate}.
                   </li>
                   <li>
                     Você pode cancelar a qualquer momento antes de {introEndDate} sem nenhuma cobrança adicional.
                   </li>
                   <li>
                     Se não cancelar, o PetGuia renovará automaticamente sua assinatura pelo valor de {renewalInfo.renewalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, {renewalInfo.periodLabel}, até que você cancele.
                   </li>
                   <li>
                     Não oferecemos reembolsos ou créditos para períodos parciais de assinatura.
                   </li>
                 </ul>
               ) : (
                 <div className="flex flex-col gap-3">
                   <div className="flex items-start gap-3">
                     <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                       <Check className="w-3 h-3 text-[#16a34a]" />
                     </div>
                     <p className="text-sm text-gray-600 leading-snug">
                       Ao continuar, autoriza a renovação automática da sua assinatura
                     </p>
                   </div>
                   <div className="flex items-start gap-3">
                     <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                       <Check className="w-3 h-3 text-[#16a34a]" />
                     </div>
                     <p className="text-sm text-gray-600 leading-snug">
                       Cancele quando quiser nas configurações da sua conta
                     </p>
                   </div>
                   <div className="flex items-start gap-3">
                     <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                       <Check className="w-3 h-3 text-[#16a34a]" />
                     </div>
                     <p className="text-sm text-gray-600 leading-snug">
                       Garantia de 30 dias: se não ficar satisfeito, devolvemos 100% do seu dinheiro
                     </p>
                   </div>
                 </div>
               )}
             </div>

          </div>
       </div>
    </div>
  );
};

function PayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { flow: quizFlow } = useQuizStore();
  const flow = quizFlow ?? 'behavior';
  
  // Params
  const name = searchParams.get('name') || 'seu cão';
  const problem = searchParams.get('problem') || '';
  const emailFromUrl = searchParams.get('email') || '';
  
  const rawTitle = titleMap[problem] ?? fallbackTitle;
  const rawSubtitle = subtitleMap[problem] ?? fallbackSubtitle;
  const displaySubtitle = rawSubtitle.replace('{name}', name);

  // State
  const [activeUsers, setActiveUsers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  
  // View State
  const [view, setView] = useState<'paywall' | 'checkout'>('paywall');
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  // Email: prefer URL param (set during quiz), fallback to manual input
  const [checkoutEmail, setCheckoutEmail] = useState<string>(emailFromUrl);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const hasEmailFromUrl = emailFromUrl.includes('@');

  const variante = 'B' as const;
  const [selectedWeeklyPlan, setSelectedWeeklyPlan] = useState<WeeklyPlanType>('week4');

  // Intercepta o botão voltar e redireciona para /exit preservando os params
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      const current = new URLSearchParams(window.location.search);
      const params = new URLSearchParams();
      const n = current.get('name');
      const p = current.get('problem');
      const e = current.get('email');
      if (n && n !== 'seu cão') params.set('name', n);
      if (p) params.set('problem', p);
      if (e) params.set('email', e);
      router.replace(`/exit?${params.toString()}`);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effects
  useEffect(() => {
    track(`${flow}_paywall_B`);

    // Generate coupon
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('pt-BR', { month: 'long' }).toUpperCase();
    const cleanMonth = month.replace('DE ', ''); 
    const cleanName = name === 'seu cão' ? 'PET' : name.toUpperCase().split(' ')[0].replace(/[^A-Z0-9]/g, '');
    setCouponCode(`${cleanName}_${day}${cleanMonth}`);

    const updateUsers = () => {
      setActiveUsers(Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000);
    };
    updateUsers();
    const userInterval = setInterval(updateUsers, 60000);

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(userInterval);
      clearInterval(timerInterval);
    };
  }, [name]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleStartPlan = async (email: string, overridePriceId?: string) => {
    const activePlanId = selectedWeeklyPlan;
    track(`${flow}_checkout_iniciado`, {
      plano: PLAN_NAME_MAP[activePlanId] ?? activePlanId,
      variante: variante ?? 'A',
      source: 'paywall',
    });
    setIsLoadingCheckout(true);
    setCheckoutError(null);
    try {
       const priceId = overridePriceId ?? STRIPE_PRICES_SEMANAL[selectedWeeklyPlan];
       
       const res = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             priceId,
             email,
          }),
       });

       const data = await res.json();
       if (!res.ok) throw new Error(data.error);

       setClientSecret(data.clientSecret);
       setSubscriptionId(data.subscriptionId);
       setCheckoutEmail(email);
       setView('checkout');
       window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
       console.error('Error starting checkout:', error);
       setCheckoutError(error?.message || 'Erro ao iniciar o pagamento. Tente novamente.');
    } finally {
       setIsLoadingCheckout(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleExitIntent = () => {
    const params = new URLSearchParams();
    if (problem) params.set('problem', problem);
    if (name !== 'seu cão') params.set('name', name);
    const emailToPass = checkoutEmail.trim() || emailFromUrl;
    if (emailToPass) params.set('email', emailToPass);
    router.push(`/exit?${params.toString()}`);
  };

  // --- Render Views ---

  if (view === 'checkout' && clientSecret) {
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
         '.Input': { border: '1px solid #d1d5db', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '12px' },
         '.Input:focus': { border: '1px solid #2a5fff', boxShadow: '0 0 0 3px rgba(42,95,255,0.1)' },
         '.Label': { fontWeight: '500', color: '#374151', marginBottom: '6px' },
       }
     };

     const weeklyPlan = WEEKLY_PLANS.find(p => p.id === selectedWeeklyPlan)!;
     const planForForm: Plan = { id: 'monthly' as PlanType, name: weeklyPlan.name, price: weeklyPlan.price, originalPrice: weeklyPlan.originalPrice, monthlyEquivalent: weeklyPlan.perWeek };

     const activePriceId = STRIPE_PRICES_SEMANAL[selectedWeeklyPlan];

     return (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
           <PaymentForm 
              onExit={handleExitIntent}
              selectedPlan={planForForm}
              subscriptionId={subscriptionId}
              userEmail={checkoutEmail}
              petName={name}
              equivalentLabel='/semana'
              planId={selectedWeeklyPlan}
              priceId={activePriceId}
              variante={variante ?? 'A'}
              flow={flow}
           />
        </Elements>
     );
  }

  // Paywall View (variante A ou B — mesmo layout, seção de planos diferente)
  return (
    <div className="h-[100dvh] flex flex-col relative bg-white overflow-hidden">
      {/* 1. TopBar */}
      <header className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-900/10 z-50 flex items-center justify-between px-4">
        <div className="w-11" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image 
            src="/images/quiz/logo-quiz.png" 
            alt="PetGuia" 
            width={240} 
            height={80} 
            className="h-[80px] w-auto object-contain"
          />
        </div>
        <button
          onClick={handleExitIntent}
          className="w-11 h-11 flex items-center justify-center bg-gray-900/5 rounded-full hover:bg-gray-900/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto pt-20 pb-10 px-4 flex flex-col gap-6 scrollbar-hide">
        
        {/* 2. Badge de pessoas */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-sm font-medium text-blue-800">
              {activeUsers.toLocaleString('pt-BR')} pessoas estão usando o PetGuia agora
            </p>
          </div>
        </div>

        {/* 3. Hero */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Image
              src="/images/checkout/primeira-img.webp"
              alt="Treinadores"
              width={800}
              height={600}
              className="w-full h-auto rounded-xl"
              priority
            />
          </div>
          
          <h1 className="text-[26px] font-black text-[#111827] leading-tight font-bbanonym text-center">
            {rawTitle}
          </h1>
          
          <p className="text-[14px] text-[#6b7280] font-montserrat leading-relaxed text-center">
            {displaySubtitle}
          </p>

          <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-3 px-4">
            <span className="text-sm font-semibold text-orange-700">A oferta especial expira</span>
            <div className="text-lg font-bold text-orange-700 tabular-nums">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* 4. Social Proof Card (98%) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
          <div className="flex items-start justify-between w-full">
            <h3 className="text-[#2a5fff] text-[36px] font-black leading-none">98%</h3>
            <div className="flex-shrink-0">
              <Image 
                src="/images/checkout/users.png" 
                alt="Users" 
                width={80} 
                height={80} 
                className="object-contain"
              />
            </div>
          </div>
          <p className="text-[13px] text-[#6b7280] leading-snug w-full">
            dos nossos usuários notam mudanças positivas no comportamento de seus cães apenas 1 semana após o início do treinamento com nossos especialistas
          </p>
        </div>

        {/* 5. Gráfico de Evolução */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col items-center">
          <h2 className="text-[20px] font-bold text-gray-900 text-center mb-1">
            Comprovado. Testado. Funciona
          </h2>
          <p className="text-[14px] text-[#6b7280] text-center mb-6">
            Mudanças significativas na obediência do cão
          </p>
          
          <div className="flex items-end justify-center gap-3 sm:gap-6 w-full max-w-sm mb-6 h-[240px] pt-8">
            {/* Bars */}
            {[
              { label: 'Hoje', blue: 60, gray: 55 },
              { label: 'Semana 2', blue: 110, gray: 60 },
              { label: 'Semana 3', blue: 155, gray: 65 },
              { label: 'Semana 4', blue: 200, gray: 70 }
            ].map((period, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1">
                   {/* Gray Bar (Sem PetGuia) - First */}
                   <div className="w-6 sm:w-8 bg-[#e5e7eb] rounded-t-full transition-all duration-1000 ease-out" 
                        style={{ height: `${period.gray}px` }}>
                   </div>
                   {/* Blue Bar (Com PetGuia) - Second */}
                   <div className="relative w-6 sm:w-8 bg-[#2a5fff] rounded-t-full transition-all duration-1000 ease-out" 
                        style={{ height: `${period.blue}px` }}>
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center z-10">
                        <Image 
                          src="/images/quiz/icon.webp" 
                          alt="" 
                          width={24} 
                          height={24} 
                          className="object-contain"
                        />
                      </div>
                   </div>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">{period.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e5e7eb]" />
              <span className="text-gray-500">Sem o PetGuia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2a5fff]" />
              <span className="text-gray-700">Com o PetGuia</span>
            </div>
          </div>
        </div>

        {/* 6. Benefícios com Ícones Coloridos */}
        <div className="flex flex-col gap-2">
          <h2 className="text-[20px] font-bold text-gray-900 text-center mb-2">
            O que torna o PetGuia tão eficaz
          </h2>
          <div className="flex flex-col divide-y divide-gray-100">
            {BENEFITS.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 py-3">
                <div className="flex-shrink-0">
                  <Image 
                    src={item.icon} 
                    alt="" 
                    width={40} 
                    height={40} 
                    className="object-contain"
                  />
                </div>
                <p className="text-[14px] text-gray-700 leading-snug font-medium">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Cupom de Desconto */}
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-900">Código promocional aplicado!</span>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              53% de desconto
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <input 
              type="text" 
              readOnly 
              value={couponCode}
              className="w-full h-12 pl-10 pr-16 bg-white border border-blue-200 rounded-lg text-[#2a5fff] font-bold text-lg outline-none uppercase"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-gray-500">
               {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* 8. Planos */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-center -mb-4 z-20 relative">
            <Image
              src="/images/checkout/dog-quiz-lp-3.png"
              alt="Cão"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>

          <div className="flex flex-col gap-4">
            {/* List of Plans */}
            {WEEKLY_PLANS.map((plan) => (
                <div key={plan.id} className={`relative ${plan.popular ? 'mt-2' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 z-10 bg-blue-500 text-white text-[10px] font-bold px-3 py-[3px] rounded-full whitespace-nowrap">
                      MAIS POPULAR
                    </div>
                  )}
                  <div
                    onClick={() => {
                      setSelectedWeeklyPlan(plan.id);
                      track(`${flow}_plano_selecionado`, {
                        plano: PLAN_NAME_MAP[plan.id] ?? plan.id,
                        variante: variante ?? 'B',
                      });
                    }}
                    className={`
                      relative rounded-xl px-4 py-2 border-2 transition-all cursor-pointer
                      ${selectedWeeklyPlan === plan.id
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-blue-200 bg-white hover:border-blue-300'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center
                          ${selectedWeeklyPlan === plan.id ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'}
                        `}>
                          {selectedWeeklyPlan === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
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

                      {plan.perDay !== null && (
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(plan.perDay)}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase font-medium">
                            /dia
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            }

            {/* CTA Button */}
            <div className="flex flex-col items-center gap-3 mt-2">
              <div className="w-full flex flex-col gap-2">
                {/* Fallback: show email input only if email was not passed via URL */}
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
                  onClick={() => {
                    const email = checkoutEmail.trim();
                    if (!email || !email.includes('@')) {
                      setCheckoutError('Por favor, insira um e-mail válido para continuar.');
                      return;
                    }
                    setCheckoutError(null);
                    handleStartPlan(email, STRIPE_PRICES_SEMANAL[selectedWeeklyPlan]);
                  }}
                  disabled={isLoadingCheckout}
                  className="w-full h-[60px] bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all rounded-full text-white font-bold text-[18px] flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.4)] disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  {isLoadingCheckout ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    'Quero Começar o Plano'
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-[#3b82f6] font-medium">
                <Lock className="w-3 h-3" />
                <span>GARANTIA DE REEMBOLSO</span>
              </div>
              {checkoutError && (
                <p className="text-red-500 text-sm text-center font-medium">{checkoutError}</p>
              )}
            </div>
          </div>
        </div>

        {/* 8b. Garantia — card abaixo do CTA */}
        {/* paddingTop acomoda metade da imagem do golden que sai para cima */}
        <div style={{ position: 'relative', paddingTop: '48px' }}>
          {/* Golden — metade acima, metade abaixo da borda superior */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
            <Image
              src="/images/checkout/golden.webp"
              alt="Golden Retriever"
              width={96}
              height={96}
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div style={{ background: '#ffffff', border: '2.5px solid #16a34a', borderRadius: '20px', padding: '60px 24px 32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', lineHeight: 1.2, marginBottom: '16px' }}>
              Garantia de 100% do dinheiro de volta
            </h2>
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.7, marginBottom: '14px' }}>
              Confiamos tanto no Método PetGuia que, se você seguir as missões por 7 dias e não notar nenhuma melhoria no comportamento do {name}, devolvemos 100% do seu dinheiro.
            </p>
            <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
              Para mais informações, consulte nossas{' '}
              <a href="mailto:contato@petguiabrasil.com.br" style={{ color: '#2563eb', textDecoration: 'underline' }}>condições de uso</a>.
            </p>
          </div>
        </div>

        {/* 9. Depoimentos com Estrelas */}
        <div className="flex flex-col gap-4 py-4">
          <h2 className="text-xl font-bold text-center text-gray-900 font-bbanonym">
            O que dizem os tutores
          </h2>
          
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x">
            {TESTIMONIALS.map((t, idx) => (
              <div 
                key={idx} 
                className="min-w-[280px] bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm snap-center flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <Image src={t.image} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{t.handle}</p>
                    <p className="text-xs text-gray-500 mb-1">tutor(a) de {t.dog}</p>
                    <div className="relative w-[80px] h-[16px]">
                      <Image 
                        src="/images/checkout/estrelaspaywall.png" 
                        alt="5 estrelas" 
                        fill
                        className="object-contain object-left"
                      />
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 italic leading-relaxed">
                  "{t.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 10. Comunidade */}
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 text-center">
          <div className="flex flex-col items-center gap-2">
            <Users className="w-8 h-8 text-blue-600 mb-1" />
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              +150.000 cães treinados
            </h3>
            <p className="text-sm text-blue-800">
              Junte-se à maior comunidade de tutores do Brasil
            </p>
          </div>
        </div>

        {/* 13. Prova Social */}
        <div style={{ margin: '0 -16px', background: '#2F6DEB', borderRadius: '28px' }}>
          <div style={{ padding: '36px 20px 16px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '6px 14px', marginBottom: '16px' }}>
              <span style={{ color: '#facc15' }}>★</span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 600 }}>+150.000 tutores satisfeitos</span>
            </div>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, lineHeight: 1.3, margin: 0 }}>
              Conheça os donos que descobriram como ter um cão calmo, obediente e feliz.
            </h2>
          </div>

          <div style={{ overflow: 'hidden', paddingTop: '26px', paddingBottom: '22px' }}>
            <div style={{ display: 'flex', gap: '8px', padding: '0 4px', marginBottom: '24px' }}>
              {([1, 2, 3, 4] as const).map((imgNum, colIdx) => (
                <div key={colIdx} style={{ flex: '1 1 0', height: '130px', position: 'relative', borderRadius: '16px', overflow: 'hidden', transform: `rotate(3deg) translateY(${colIdx % 2 === 1 ? '-20px' : '6px'})` }}>
                  <Image src={`/images/checkout/provasocial${imgNum}.jpeg`} alt="" fill sizes="25vw" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', padding: '0 4px' }}>
              {([5, 6, 7, 2] as const).map((imgNum, colIdx) => (
                <div key={colIdx} style={{ flex: '1 1 0', height: '130px', position: 'relative', borderRadius: '16px', overflow: 'hidden', transform: `rotate(3deg) translateY(${colIdx % 2 === 1 ? '-20px' : '6px'})` }}>
                  <Image src={`/images/checkout/provasocial${imgNum}.jpeg`} alt="" fill sizes="25vw" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingBottom: '16px' }} />
        </div>

        {/* 11. FAQ (Moved to end) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-[20px] font-bold text-gray-900 text-center">
            Perguntas frequentes
          </h2>
          
          <div className="flex flex-col border-t border-[#e5e7eb]">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border-b border-[#e5e7eb]">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="pb-4 text-sm text-gray-600 leading-relaxed animate-in slide-in-from-top-1 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">
              Tem uma pergunta? Basta escrever para nós em{' '}
              <a href="mailto:contato@petguiabrasil.com.br" className="text-[#2a5fff] font-medium hover:underline">
                contato@petguiabrasil.com.br
              </a>
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <PayContent />
    </Suspense>
  );
}
