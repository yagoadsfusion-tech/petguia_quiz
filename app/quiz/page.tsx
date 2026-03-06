'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QuizContainer } from '@/components/quiz/QuizContainer';
import { useQuizStore } from '@/store/quizStore';

const QUIZ_STORAGE_KEY = 'petguia-quiz-storage';

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reset = searchParams.get('reset');
    if (reset === '1' || reset === 'true') {
      localStorage.removeItem(QUIZ_STORAGE_KEY);
      useQuizStore.getState().resetQuiz();
      router.replace('/quiz');
      return;
    }
  }, [searchParams, router]);

  return <QuizContainer />;
}

export default function QuizPage() {
  return (
    <Suspense>
      <QuizContent />
    </Suspense>
  );
}
