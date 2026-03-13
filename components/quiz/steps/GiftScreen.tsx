'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, animate, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/store/quizStore';
import { track } from '@/lib/mixpanelClient';
import confetti from 'canvas-confetti';

// ─── Gift data ────────────────────────────────────────────────────────────────
const GIFTS = [
  {
    id:       'azul',
    closed:   '/images/quiz/presenteazul.png',
    box:      '/images/quiz/caixaazul.png',
    lid:      '/images/quiz/tampaazul.png',
    emoji:    '🌟',
    label:    'Edição Estrela',
    tagColor: '#2563eb',
  },
  {
    id:       'roxo',
    closed:   '/images/quiz/presenteroxo.png',
    box:      '/images/quiz/caixaroxa.png',
    lid:      '/images/quiz/tamparoxa.png',
    emoji:    '💎',
    label:    'Escolha Premium',
    tagColor: '#7c3aed',
  },
  {
    id:       'laranja',
    closed:   '/images/quiz/presentelaranja.png',
    box:      '/images/quiz/caixalaranja.png',
    lid:      '/images/quiz/tampalaranja.png',
    emoji:    '🔮',
    label:    'Caixa mistério',
    tagColor: '#f97316',
  },
  {
    id:       'verde',
    closed:   '/images/quiz/presenteverde.png',
    box:      '/images/quiz/caixaverde.png',
    lid:      '/images/quiz/tampaverde.png',
    emoji:    '👑',
    label:    'Presente dourado',
    tagColor: '#16a34a',
  },
];

// ─── Layout constants ─────────────────────────────────────────────────────────
const CARD_W       = 192;
const CARD_H       = 256;
const TAG_H        = 40;       // height of the tag header inside card
const IMAGE_H      = CARD_H - TAG_H;
const GAP          = 20;
const ITEM_SPACING = CARD_W + GAP;
const DEFAULT_CW   = 375;

type Phase = 'idle' | 'shaking' | 'lidUp' | 'revealed';

function snapPos(i: number, cw: number): number {
  return cw / 2 - CARD_W / 2 - i * ITEM_SPACING;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const GiftScreen = () => {
  const router = useRouter();
  const { dogName, dogBreed, priorityProblem, trainingTime, email, flow } = useQuizStore();

  const [activeIdx,  setActiveIdx]  = useState(0);
  const [phase,      setPhase]      = useState<Phase>('idle');
  const [openedIdx,  setOpenedIdx]  = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw]  = useState(DEFAULT_CW);
  const x            = useMotionValue(snapPos(0, DEFAULT_CW));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    setCw(w);
    x.set(snapPos(0, w));
  }, [x]);

  // Page view event
  useEffect(() => {
    if (flow) track(`${flow}_present`);
  }, [flow]);

  const dragConstraints = useMemo(() => ({
    left:  snapPos(GIFTS.length - 1, cw),
    right: snapPos(0, cw),
  }), [cw]);

  const snapTo = (i: number) => {
    const idx = Math.max(0, Math.min(i, GIFTS.length - 1));
    setActiveIdx(idx);
    animate(x, snapPos(idx, cw), { type: 'spring', stiffness: 380, damping: 34 });
  };

  const handleDragEnd = (_: Event, info: PanInfo) => {
    if (openedIdx !== null) return;
    const raw = (cw / 2 - CARD_W / 2 - x.get()) / ITEM_SPACING;
    snapTo(Math.round(raw));
  };

  // Card click: side cards → snap only; active card → do nothing (button opens)
  const handleCardClick = (i: number) => {
    if (openedIdx !== null || i === activeIdx) return;
    snapTo(i);
  };

  // "Escolher presente" button action
  const handleOpen = () => {
    if (openedIdx !== null) return;
    if (flow) track(`${flow}_aberto`);
    setOpenedIdx(activeIdx);
    setPhase('shaking');

    setTimeout(() => {
      setPhase('lidUp');
      setTimeout(() => {
        setPhase('revealed');
        confetti({ particleCount: 150, spread: 90,  origin: { y: 0.55 }, colors: ['#a855f7','#f97316','#22c55e','#3b82f6','#ec4899','#fbbf24'] });
        confetti({ particleCount: 55,  angle: 60,   spread: 55, origin: { x: 0, y: 0.6 }, colors: ['#a855f7','#f97316','#fbbf24'] });
        confetti({ particleCount: 55,  angle: 120,  spread: 55, origin: { x: 1, y: 0.6 }, colors: ['#22c55e','#3b82f6','#ec4899'] });
      }, 650);
    }, 350);
  };

  const handleClaim = () => {
    const p = new URLSearchParams();
    if (dogName)         p.set('name',    dogName);
    if (dogBreed)        p.set('breed',   dogBreed);
    if (priorityProblem) p.set('problem', priorityProblem);
    if (trainingTime)    p.set('time',    trainingTime);
    if (email)           p.set('email',   email);
    router.push(`/pay?${p.toString()}`);
  };

  return (
    <div
      className="relative flex flex-col items-center min-h-screen pb-[104px] h-screen"
      style={{
        backgroundImage: 'url(/images/quiz/bgDesktop.ea424d4706cf26e39f84.jpg)',
        backgroundSize:  'cover',
        backgroundPosition: 'center',
      }}
    >

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center w-full flex-1 min-h-0">

        {/* Header — anchored near the top */}
        <div className="px-6 pt-20 pb-0 text-center">
          <h1 className="text-[22px] font-bold text-[#1a1a1a] leading-tight mb-2">
            Escolha o seu presente de boas-vindas
          </h1>
          <p className="text-[14px] text-[#78787b] leading-snug px-2">
            Passe o dedo e escolha o seu presente como bônus de boas-vindas ao plano de treinos do seu cão!
          </p>
        </div>

        {/* Carousel + dots — fills remaining height and centers vertically */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">

        {/*
          ── Carousel section ──
          overflow-x: clip  → clips side cards horizontally
          overflow-y: visible → lets the glow and lid bleed vertically (no crop!)
        */}
        <div
          ref={containerRef}
          className="relative w-full"
          style={{
            height:    CARD_H + 24,
            overflowX: 'clip',
            overflowY: 'visible',
          }}
        >

          {/* Draggable track */}
          <motion.div
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            dragMomentum={false}
            style={{
              x,
              position: 'absolute',
              top:      12,
              left:     0,
              display:  'flex',
              height:   CARD_H,
            }}
            onDragEnd={handleDragEnd}
          >
            {GIFTS.map((gift, i) => {
              const isActive = i === activeIdx;
              const thisOpen = i === openedIdx;

              return (
                <motion.div
                  key={gift.id}
                  className="relative flex-shrink-0"
                  style={{
                    width:       CARD_W,
                    height:      CARD_H,
                    marginRight: i < GIFTS.length - 1 ? GAP : 0,
                    cursor:      (thisOpen || isActive) ? 'default' : 'pointer',
                    zIndex:      isActive ? 2 : 1,
                  }}
                  animate={{
                    scale:   isActive ? 1 : 0.82,
                    opacity: isActive ? 1 : 0.5,
                    rotate:  thisOpen && phase === 'shaking' ? [-3, 3, -3, 0] : 0,
                  }}
                  transition={{
                    scale:   { type: 'spring', stiffness: 280, damping: 24 },
                    opacity: { duration: 0.25 },
                    rotate:  { duration: 0.3 },
                  }}
                  onClick={() => handleCardClick(i)}
                >
                  {/* ── White card shell (overflow:hidden for rounded corners) ── */}
                  <div
                    className="w-full h-full flex flex-col rounded-[20px] overflow-hidden bg-white select-none"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.11)' }}
                  >
                    {/* Tag — centered */}
                    <div
                      className="flex items-center justify-center gap-1.5 px-3 flex-shrink-0"
                      style={{ height: TAG_H }}
                    >
                      <span className="text-[15px] leading-none">{gift.emoji}</span>
                      <span
                        className="text-[13px] font-semibold leading-none"
                        style={{ color: gift.tagColor }}
                      >
                        {gift.label}
                      </span>
                    </div>

                    {/* Image area */}
                    <div className="relative flex-1">

                      {/* Closed gift image — fills the area */}
                      <motion.img
                        src={gift.closed}
                        alt={gift.label}
                        draggable={false}
                        className="absolute inset-0 w-full h-full"
                        style={{ objectFit: 'contain', zIndex: 2 }}
                        animate={
                          thisOpen && (phase === 'lidUp' || phase === 'revealed')
                            ? { opacity: 0 }
                            : { opacity: 1 }
                        }
                        transition={{ duration: 0.2 }}
                      />

                      {/* Box — fades in when opening */}
                      {thisOpen && (
                        <motion.img
                          src={gift.box}
                          alt=""
                          draggable={false}
                          className="absolute bottom-0 left-0 w-full"
                          style={{ height: '66%', objectFit: 'contain', zIndex: 3 }}
                          initial={{ opacity: 0 }}
                          animate={
                            phase === 'lidUp' || phase === 'revealed'
                              ? { opacity: 1 }
                              : { opacity: 0 }
                          }
                          transition={{ duration: 0.2, delay: 0.1 }}
                        />
                      )}

                      {/* Discount image — rises from inside box */}
                      {thisOpen && (
                        <motion.img
                          src="/images/quiz/desconto.png"
                          alt="53% de desconto"
                          draggable={false}
                          className="absolute left-[10%] right-[10%]"
                          style={{ width: '80%', bottom: '32%', objectFit: 'contain', zIndex: 5 }}
                          initial={{ y: 36, opacity: 0 }}
                          animate={
                            phase === 'revealed'
                              ? { y: -20, opacity: 1 }
                              : { y: 36, opacity: 0 }
                          }
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                        />
                      )}
                    </div>
                  </div>

                  {/*
                    Lid — OUTSIDE the card shell so overflow:hidden doesn't clip it.
                    Positioned to visually sit at the top of the image area.
                    Can fly freely upward since carousel has overflow-y: visible.
                  */}
                  {thisOpen && (
                    <motion.img
                      src={gift.lid}
                      alt=""
                      draggable={false}
                      style={{
                        position:    'absolute',
                        top:         TAG_H,
                        left:        0,
                        width:       '100%',
                        height:      IMAGE_H * 0.5,
                        objectFit:   'contain',
                        zIndex:      30,
                        pointerEvents: 'none',
                      }}
                      initial={{ opacity: 0, y: 0 }}
                      animate={
                        phase === 'lidUp' || phase === 'revealed'
                          ? { opacity: phase === 'lidUp' ? [0, 1, 0] : 0, y: -120 }
                          : { opacity: 0, y: 0 }
                      }
                      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.12 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>{/* end carousel */}

        {/* ── Pagination dots ── */}
        <div className="flex items-center gap-2 mt-5">
          {GIFTS.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full bg-[#9c5fd4]"
              animate={{
                width:   i === activeIdx ? 20 : 8,
                height:  8,
                opacity: i === activeIdx ? 1 : 0.28,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          ))}
        </div>

        </div>{/* end flex-1 centering wrapper */}

      </div>

      {/* ── Button area — fixed at bottom, two buttons swap ── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-3 pointer-events-none"
        style={{ zIndex: 50 }}
      >
        <div className="relative mx-auto w-full" style={{ height: 56, maxWidth: 360 }}>

          {/* "Escolher presente" — azul PetGuia, visible before opening */}
          <motion.button
            className="absolute inset-x-0 top-0 h-full rounded-2xl font-bold text-[17px] tracking-tight text-white active:scale-95 transition-transform pointer-events-auto"
            style={{
              background:    'linear-gradient(135deg, #2a5fff 0%, #1a4aee 100%)',
              boxShadow:     '0 4px 22px rgba(42,95,255,0.38)',
              pointerEvents: phase === 'idle' ? 'auto' : 'none',
            }}
            animate={{ opacity: phase === 'idle' ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOpen}
          >
            Escolher presente
          </motion.button>

          {/* "Reclame desconto" — roxo, appears after reveal */}
          <motion.button
            className="absolute inset-x-0 top-0 h-full rounded-2xl font-bold text-[17px] tracking-tight text-white active:scale-95 transition-transform pointer-events-auto"
            style={{
              background:    'linear-gradient(135deg, #9c5fd4 0%, #7c3aed 100%)',
              boxShadow:     '0 4px 22px rgba(124,58,237,0.38)',
              pointerEvents: phase === 'revealed' ? 'auto' : 'none',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={
              phase === 'revealed'
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            transition={{ duration: 0.4, delay: 0.2 }}
            onClick={handleClaim}
          >
            Quero 53% de desconto →
          </motion.button>

        </div>
      </div>

    </div>
  );
};
