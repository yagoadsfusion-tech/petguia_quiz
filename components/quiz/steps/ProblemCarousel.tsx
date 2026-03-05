'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuizStore } from '@/store/quizStore';
import Image from 'next/image';

const SLIDES = [
  {
    image: '/images/quiz/problema1.png',
    text: 'Ensine mais de 50 comandos de adestramento para seu cão com o PetGuia',
  },
  {
    image: '/images/quiz/problema2.png',
    text: 'Acabe com o xixi no lugar errado em 7 dias',
  },
  {
    image: '/images/quiz/problema3.png',
    text: 'Chega de comportamentos indesejados em 3 dias',
  },
  {
    image: '/images/quiz/problema4.png',
    text: 'Acabe com as mordidas do seu cão',
  },
  {
    image: '/images/quiz/problema5.png',
    text: 'Chega de latidos excessivos em 1 semana',
  },
];

const HIGHLIGHT_PATTERNS = [
  'mais de 50 comandos',
  'em 7 dias',
  'em 3 dias',
  'em 1 semana',
];

// Brand blue
const BRAND_BLUE = '#2a5fff';

function highlightText(text: string): React.ReactNode {
  const escaped = HIGHLIGHT_PATTERNS.map((p) =>
    p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => {
    const isHighlight = HIGHLIGHT_PATTERNS.some(
      (p) => p.toLowerCase() === part.toLowerCase()
    );
    return isHighlight ? (
      <span key={i} style={{ color: BRAND_BLUE }}>
        {part}
      </span>
    ) : (
      part
    );
  });
}

// Each slide stays fully visible for SLIDE_HOLD ms, then fades out over FADE_DURATION ms,
// content swaps, and fades back in over FADE_DURATION ms.
const SLIDE_HOLD = 1400;
const FADE_DURATION = 350;
const SLIDE_DURATION = SLIDE_HOLD + FADE_DURATION * 2;
const PROGRESS_DURATION = 5000;
// How long the bar takes to collapse before the button appears
const BAR_EXIT_DURATION = 350;

export const ProblemCarousel = () => {
  const { nextStep } = useQuizStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  // fading = true means the outer container is at opacity 0 (mid-transition)
  const [fading, setFading] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  // bar states
  const [barExiting, setBarExiting] = useState(false);
  const [barGone, setBarGone] = useState(false);

  // button states
  const [buttonMounted, setButtonMounted] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start progress bar fill after first paint
  useEffect(() => {
    const t = setTimeout(() => setProgressWidth(100), 80);
    return () => clearTimeout(t);
  }, []);

  // When progress completes: collapse bar → mount button → fade button in
  useEffect(() => {
    const t = setTimeout(() => {
      setBarExiting(true);
      setTimeout(() => {
        setBarGone(true);
        setButtonMounted(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setButtonVisible(true));
        });
      }, BAR_EXIT_DURATION);
    }, PROGRESS_DURATION);

    return () => clearTimeout(t);
  }, []);

  // Slide cycling:
  // 1. Fade out the whole container (fading → true)
  // 2. While invisible, swap currentSlide (user can't see the swap)
  // 3. Fade the container back in (fading → false)
  // This avoids the crossfade overlap where both images are visible simultaneously.
  // All slides stay in the DOM so images are pre-loaded and the swap is instant.
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFading(true);

      fadeTimerRef.current = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        // Let React render the new slide before fading back in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setFading(false));
        });
      }, FADE_DURATION);
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Logo */}
      <div className="flex justify-center pt-8 px-6">
        <Image
          src="/images/quiz/logo-quiz.png"
          alt="PetGuia"
          width={130}
          height={44}
          priority
        />
      </div>

      {/*
        Outer container fades in/out as a whole.
        All slides stay rendered so images are pre-loaded.
        Only the active slide is visible; inactive ones are opacity:0 (no transition).
        The swap happens while the container is invisible → no overlap between images.
      */}
      <div
        className="flex-1 relative"
        style={{
          opacity: fading ? 0 : 1,
          transition: `opacity ${FADE_DURATION}ms ease-in-out`,
          willChange: 'opacity',
        }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 flex flex-col items-center justify-start pt-6 px-6 text-center"
            style={{ opacity: i === currentSlide ? 1 : 0 }}
          >
            <h1
              className="text-[24px] font-bold text-[#11181C] leading-tight mb-5"
              style={{ maxWidth: 360 }}
            >
              {highlightText(slide.text)}
            </h1>

            <div className="relative w-full" style={{ height: '36vh' }}>
              <Image
                src={slide.image}
                alt={`Slide ${i + 1}`}
                fill
                className="object-contain"
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom area: progress bar collapses, button fades in — same spot */}
      <div className="px-6 pb-8">

        {/* Progress bar — collapses when done */}
        {!barGone && (
          <div
            style={{
              opacity: barExiting ? 0 : 1,
              maxHeight: barExiting ? 0 : 48,
              overflow: 'hidden',
              transition: `opacity ${BAR_EXIT_DURATION}ms ease-in-out, max-height ${BAR_EXIT_DURATION}ms ease-in-out`,
            }}
          >
            <div className="h-2 rounded-full bg-[#ececec] overflow-hidden mb-1">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressWidth}%`,
                  backgroundColor: BRAND_BLUE,
                  transition: `width ${PROGRESS_DURATION}ms linear`,
                }}
              />
            </div>
          </div>
        )}

        {/* Button — fades in once bar is gone */}
        {buttonMounted && (
          <div
            style={{
              opacity: buttonVisible ? 1 : 0,
              transition: 'opacity 500ms ease-in-out',
            }}
          >
            <p className="text-[11px] text-center text-[#78787b] mb-3 leading-snug">
              Ao continuar, você concorda com nossa{' '}
              <span className="underline">Política de Privacidade</span> e{' '}
              <span className="underline">Termos de Uso</span>
            </p>
            <button
              onClick={nextStep}
              className="w-full py-[14px] px-8 rounded-[12px] text-white text-[18px] font-medium active:scale-[0.98] transition-transform"
              style={{
                backgroundColor: BRAND_BLUE,
                boxShadow: '0 4px 8px rgba(42,95,255,0.3)',
              }}
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
