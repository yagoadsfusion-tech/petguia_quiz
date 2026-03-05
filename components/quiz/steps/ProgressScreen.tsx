import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { quizData } from '@/constants/quizData';
import { Check, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const progressLabels: Record<string, { now: string; future: string }> = {
  'Xixi fora do lugar': {
    now: 'Xixi errado todos os dias',
    future: 'Xixi no lugar certo sempre',
  },
  'Mordidas': {
    now: 'Mordidas frequentes e dolorosas',
    future: 'Sem mais mordidas',
  },
  'Latidos em excesso': {
    now: 'Latidos incontroláveis',
    future: 'Cão calmo e silencioso',
  },
  'Pula nas visitas': {
    now: 'Pula em todo mundo',
    future: 'Recebe visitas com calma',
  },
  'Rói e danifica os móveis': {
    now: 'Destrói objetos todo dia',
    future: 'Casa intacta e sem estragos',
  },
  'Ansiedade de separação': {
    now: 'Sofre quando você sai',
    future: 'Fica calmo sozinho em casa',
  },
};

const fallbackLabels = { now: 'Novato', future: 'Com o PetGuia' };

export const ProgressScreen = () => {
  const { nextStep, dogName, flow, commands, trainingStartDate, priorityProblem } = useQuizStore();
  const { title, card_title, highlight_title } = quizData.interstitials.progress_screen;

  const displayTitle = title.replace('{dogName}', dogName || 'seu cão');
  const displayCardTitle = card_title.replace('{dogName}', dogName || 'seu cão');
  
  // Logic for badge content
  let badgeTitle = highlight_title;
  let badgeDescription = "98% dos tutores do PetGuia relatam melhorias significativas no comportamento do cão nos primeiros dias de treino.";
  
  if (flow === 'puppy') {
    badgeDescription = "98% dos tutores relatam uma rotina mais organizada nos primeiros dias.";
  }

  // Graph labels: dynamic for behavior flow, fixed for others
  const graphLabels = flow === 'behavior'
    ? (progressLabels[priorityProblem ?? ''] ?? fallbackLabels)
    : fallbackLabels;
  
  // Date logic
  const dateText = useMemo(() => {
    if (flow === 'behavior') {
      return "NOS PRÓXIMOS 7 DIAS";
    }
    if (trainingStartDate) {
      const date = new Date(trainingStartDate);
      if (!isNaN(date.getTime())) {
        const targetDate = new Date(date);
        targetDate.setDate(date.getDate() + 30);
        return `ATÉ ${targetDate.getDate()} DE ${targetDate.toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}`;
      }
    }
    return "NOS PRÓXIMOS 30 DIAS";
  }, [flow, trainingStartDate]);

  // Novice tag subtitle
  const noviceSubtitle = commands.length > 0 
    ? `${commands.length} ${commands.length === 1 ? 'ordem' : 'ordens'}`
    : '0 ordens';

  // Graph dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300); // Default fallback

  useEffect(() => {
    document.body.style.backgroundColor = '#35B440';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    
    // Initial measure
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const graphHeight = 200;
  // Use the measured width directly.
  const graphWidth = width; 
  
  // Coordinates
  const startX = 20;
  const startY = graphHeight - 20; // 180
  
  const noviceX = graphWidth * 0.25;
  const noviceY = graphHeight - 60; // 140
  
  const expertX = graphWidth * 0.85;
  const expertY = 60;
  
  // Control points
  const cp1x = (startX + noviceX) / 2;
  const cp1y = startY;
  const cp2x = (startX + noviceX) / 2;
  const cp2y = noviceY;
  
  const cp3x = (noviceX + expertX) / 2;
  const cp3y = noviceY;
  const cp4x = (noviceX + expertX) / 2;
  const cp4y = expertY;

  const pathD = `
    M ${startX} ${startY}
    C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${noviceX} ${noviceY}
    C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${expertX} ${expertY}
    L ${graphWidth} ${expertY - 10}
  `;

  return (
    <div className="relative flex flex-col min-h-screen bg-[#35B440] pt-[max(env(safe-area-inset-top),60px)] pb-[max(env(safe-area-inset-bottom),20px)] overflow-hidden">
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-5 justify-center w-full max-w-[600px] mx-auto">
        
        {/* Card */}
        <div className="w-full bg-white rounded-[20px] p-5 pb-6 mb-5 shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
          <h2 className="text-[16px] font-semibold text-[#333] mb-4 text-center">
            {displayCardTitle}
          </h2>

          <div className="flex flex-col items-center w-full pb-2 mt-3" ref={containerRef}>
            <div className="relative w-full h-[200px] mt-2">
              
              {/* Tags (Absolute) */}
              {/* Novice Tag */}
              <div
                className="absolute z-10"
                style={{ top: noviceY - 58, left: noviceX, transform: 'translateX(-50%)' }}
              >
                <motion.div
                  className="bg-[#E53E3E] rounded-[12px] p-2 flex flex-col items-center min-w-[80px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <span className="text-white text-[10px] font-medium text-center leading-tight">{graphLabels.now}</span>
                  {flow !== 'behavior' && (
                    <span className="text-[rgba(255,255,255,0.8)] text-[10px] whitespace-nowrap">{noviceSubtitle}</span>
                  )}
                </motion.div>
              </div>

              {/* Expert Tag */}
              <div
                className="absolute z-10"
                style={{ top: expertY - 80, left: expertX, transform: 'translateX(-50%)' }}
              >
                <motion.div
                  className="bg-[#35B440] rounded-[12px] p-2 flex flex-col items-center min-w-[100px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.3 }}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <Trophy size={20} color="#FFD700" fill="#FFD700" />
                    <span className="text-white text-[10px] font-medium text-center leading-tight">{graphLabels.future}</span>
                  </div>
                  {flow !== 'behavior' && (
                    <span className="text-[rgba(255,255,255,0.8)] text-[10px] whitespace-nowrap">Mais de 50 ordens</span>
                  )}
                </motion.div>
              </div>

              <svg width="100%" height="100%" viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="overflow-visible">
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#E53E3E" />
                    <stop offset="1" stopColor="#35B440" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1={graphHeight} x2={graphWidth} y2={graphHeight} stroke="#E0E0E0" strokeWidth="1" />
                {[0.8, 0.6, 0.4, 0.2].map((factor, i) => (
                  <line 
                    key={i}
                    x1="0" 
                    y1={graphHeight * factor} 
                    x2={graphWidth} 
                    y2={graphHeight * factor} 
                    stroke="#E0E0E0" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                ))}

                {/* Vertical Dotted Lines */}
                <line 
                  x1={noviceX} y1={noviceY} x2={noviceX} y2={graphHeight} 
                  stroke="#E53E3E" strokeWidth="2" strokeDasharray="4 4" 
                />
                <line 
                  x1={expertX} y1={expertY} x2={expertX} y2={graphHeight} 
                  stroke="#35B440" strokeWidth="2" strokeDasharray="4 4" 
                />

                {/* Curve */}
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }} // easeOutCubic approx
                />

                {/* Points */}
                <motion.circle 
                  cx={noviceX} cy={noviceY} r="6" 
                  fill="#E53E3E" stroke="white" strokeWidth="2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4, type: 'spring', bounce: 0.5 }}
                />
                <motion.circle 
                  cx={expertX} cy={expertY} r="6" 
                  fill="#35B440" stroke="white" strokeWidth="2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.4, type: 'spring', bounce: 0.5 }}
                />
              </svg>
            </div>

            {/* X Axis Labels */}
            <div className="flex flex-row justify-between w-full mt-[6px] px-[10px]">
              <span className="text-[#999] text-[12px] font-semibold">AGORA</span>
              <span className="text-[#999] text-[12px] font-semibold uppercase">{dateText}</span>
            </div>
          </div>
        </div>

        {/* Text Container */}
        <div className="flex flex-col items-center px-4 mb-4 w-full">
          {/* Highlight Badge */}
          <div className="w-full bg-[rgba(255,255,255,0.2)] border-[2px] border-[rgba(255,255,255,0.3)] rounded-[16px] px-5 py-3 mb-4 flex justify-center text-center shadow-sm backdrop-blur-sm">
            <span className="text-white font-bold text-[14px] md:text-[16px]">
              {badgeTitle}
            </span>
          </div>
          
          <p className="text-[rgba(255,255,255,0.95)] text-[14px] leading-relaxed text-center">
            {badgeDescription}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-8 pt-5 w-full max-w-[600px] mx-auto">
        <button
          onClick={nextStep}
          className="w-full py-[18px] rounded-[30px] bg-white text-[#16A34A] text-[18px] font-bold shadow-[0_2px_4px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-transform hover:shadow-md"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
