"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselItem } from "@/types/homeConfig.types";
import { cn } from "@/lib/utils";



function CarouselSlide({ item }: { item: CarouselItem }) {
  return (
    <Link
      href={item.cta_url || "#"}
      className="relative block w-full group overflow-hidden transition-all duration-500"
    >
      <div className="relative w-full aspect-[2.8/1] sm:aspect-[11/1] bg-gray-100/50 dark:bg-gray-800/50">
        {/* Mobile Image */}
        {item.app_image && (
          <img
            src={item.app_image}
            alt={item.title || item.id}
            className="sm:hidden absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Desktop Image */}
        {item.desktop_image && (
          <img
            src={item.desktop_image}
            alt={item.title || item.id}
            className="hidden sm:block absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {!(item.app_image || item.desktop_image) && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 flex items-center justify-center p-6 text-white text-center">
            <div className="space-y-2 backdrop-blur-sm bg-black/5 p-4 rounded-xl">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{item.title}</h3>
              <p className="text-sm sm:text-base opacity-90 max-w-md mx-auto">{item.subtitle}</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-black/0 transition-colors duration-300 pointer-events-none" />
      </div>
    </Link>
  );
}

interface HomeCarouselProps {
  items: CarouselItem[];
  autoplay?: boolean;
}

export default function HomeCarousel({
  items,
  autoplay = true,
}: HomeCarouselProps) {
  const slides = items.length > 0 ? items : [];
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goNext = useCallback(
    () => setActive((p) => (p + 1) % slides.length),
    [slides.length]
  );
  const goPrev = useCallback(
    () => setActive((p) => (p - 1 + slides.length) % slides.length),
    [slides.length]
  );

  const navigate = useCallback(
    (fn: () => void) => {
      if (timerRef.current) clearInterval(timerRef.current);
      fn();
      if (autoplay && slides.length > 1) {
        timerRef.current = setInterval(goNext, 6000);
      }
    },
    [autoplay, goNext, slides.length]
  );

  useEffect(() => {
    if (autoplay && slides.length > 1) {
      timerRef.current = setInterval(goNext, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay, goNext, slides.length]);

  useEffect(() => {
    setActive(0);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-md select-none">
      <div className="animate-fade-in" key={active}>
        <CarouselSlide item={slides[active]} />
      </div>

      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => navigate(goPrev)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => navigate(goNext)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => navigate(() => setActive(i))}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === active
                    ? "w-5 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
