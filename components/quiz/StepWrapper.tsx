import { ReactNode } from 'react';
import { cn } from '@/lib/utils'; // Assuming I'll create utils for clsx/tailwind-merge

interface StepWrapperProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  onContinue?: () => void;
  isContinueDisabled?: boolean;
  showContinueButton?: boolean;
  continueButtonText?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export const StepWrapper = ({
  title,
  subtitle,
  children,
  onContinue,
  isContinueDisabled = false,
  showContinueButton = true,
  continueButtonText = 'Continuar',
  onBack,
  showBackButton = true,
  className,
}: StepWrapperProps) => {
  return (
    <div className={cn("flex flex-col min-h-full px-6 pb-8 pt-2", className)}>
      <div className="flex-1 flex flex-col justify-center">
        {(title || subtitle) && (
          <div className="mb-6 text-center">
            {title && (
              <h1 className="text-[24px] font-black font-bbanonym text-[#2a5fff] leading-tight mb-2 tracking-[-0.25px]">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-[14px] font-normal font-montserrat text-[#78787b] leading-snug tracking-[-0.13px]">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        {showContinueButton && (
          <button
            onClick={onContinue}
            disabled={isContinueDisabled}
            className={cn(
              "w-full py-[14px] px-8 rounded-[12px] text-[18px] font-medium font-montserrat tracking-[-0.18px] transition-all duration-200 shadow-[0_4px_8px_rgba(42,95,255,0.3)]",
              isContinueDisabled
                ? "bg-[#ececec] text-[#89898b] opacity-50 cursor-not-allowed shadow-none"
                : "bg-[#2a5fff] text-white hover:bg-[#2550d9] active:scale-[0.98]"
            )}
          >
            {continueButtonText}
          </button>
        )}
        
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="text-[#89898b] text-[14px] font-medium font-montserrat hover:text-[#2a5fff] transition-colors"
          >
            Voltar
          </button>
        )}
      </div>
    </div>
  );
};
