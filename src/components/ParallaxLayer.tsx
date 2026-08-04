"use client";

import { useEffect, useRef, useState } from "react";

type ParallaxLayerProps = {
  children: React.ReactNode;
  speed?: number;
  className?: string;
};

export function ParallaxLayer({
  children,
  speed = 0.25,
  className = "",
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);
    return () => media.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setOffset(0);
      return;
    }

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const delta = center - window.innerHeight / 2;
        setOffset(delta * speed * -1);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion, speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      <div style={{ transform: `translate3d(0, ${offset}px, 0)` }}>{children}</div>
    </div>
  );
}
