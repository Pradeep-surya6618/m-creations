"use client";

import { m, useReducedMotion } from "motion/react";
import { useMemo } from "react";

type Props = {
  count?: number;
  className?: string;
};

type Petal = {
  left: string;
  top: string;
  duration: number;
  delay: number;
  size: number;
  rotate: number;
  color: string;
};

function makePetals(count: number): Petal[] {
  const colors = ["#ff4f93", "#ff7fb2", "#ffd6e7"];
  return Array.from({ length: count }, (_, i) => ({
    left: `${(i * 97) % 100}%`,
    top: `${(i * 53) % 100}%`,
    duration: 8 + ((i * 7) % 6),
    delay: (i * 1.3) % 5,
    size: 8 + ((i * 5) % 8),
    rotate: -15 + ((i * 11) % 30),
    color: colors[i % colors.length],
  }));
}

export function FloatingPetals({ count = 6, className }: Props) {
  const reduce = useReducedMotion();
  const petals = useMemo(() => makePetals(count), [count]);

  if (reduce) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {petals.map((p, i) => (
        <m.span
          key={i}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: 0.55,
            boxShadow: `0 0 12px ${p.color}55`,
          }}
          initial={{ y: 0, rotate: 0 }}
          animate={{
            y: [0, -90, 0],
            rotate: [0, p.rotate, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
