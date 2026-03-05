import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect, useCallback } from "react";

interface SegmentedSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  colors?: string[];
}

export const SegmentedSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  colors = [
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFC107",
    "#FF5722",
  ]
}: SegmentedSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInteraction = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    // Clamp between 0 and 1
    const percentage = Math.min(Math.max(x / rect.width, 0), 1);
    
    // Convert to value range
    let rawValue = percentage * (max - min) + min;
    
    // Snap to step
    const newValue = Math.round(rawValue / step) * step;
    
    // Clamp value
    const clampedValue = Math.min(Math.max(newValue, min), max);
    
    onChange(clampedValue);
  }, [max, min, step, onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleInteraction(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleInteraction(e.clientX);
      }
    };
    const handleUp = () => setIsDragging(false);

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleInteraction(e.touches[0].clientX);
      }
    };
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleInteraction]);

  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  // Build gradient for each segment blending edges with neighbours
  const getSegmentGradient = (index: number) => {
    const color = colors[index];
    const prevColor = colors[index - 1] ?? color;
    const nextColor = colors[index + 1] ?? color;
    // Blend ~25% into adjacent color on each edge
    return `linear-gradient(to right, color-mix(in srgb, ${color} 70%, ${prevColor} 30%), ${color}, color-mix(in srgb, ${color} 70%, ${nextColor} 30%))`;
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-12 cursor-pointer select-none touch-none", className)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Track Segments */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex gap-1.5 h-1.5 px-1">
        {colors.map((_, index) => {
          const segmentCount = colors.length;
          const segmentStart = (index / segmentCount) * 100;
          const segmentEnd = ((index + 1) / segmentCount) * 100;
          
          let fill = 0;
          if (percentage >= segmentEnd) {
            fill = 100;
          } else if (percentage > segmentStart) {
            fill = ((percentage - segmentStart) / (segmentEnd - segmentStart)) * 100;
          }

          return (
            <div
              key={index}
              className="flex-1 rounded-full overflow-hidden relative bg-[#e0e0e0]"
            >
              <div
                className="h-full transition-all duration-75 ease-out"
                style={{
                  width: `${fill}%`,
                  background: getSegmentGradient(index),
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-[#2a5fff] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] border-[3px] border-white transform transition-transform active:scale-110 z-10"
        style={{ left: `calc(${percentage}% - 14px)` }}
      />
    </div>
  );
};
