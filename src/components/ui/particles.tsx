"use client";

type ParticlesProps = {
  className?: string;
  quantity?: number;
  ease?: number;
  color?: string;
  refresh?: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function Particles({
  className = "",
  quantity = 100,
  ease = 80,
  color = "#000000",
}: ParticlesProps) {
  const safeQuantity = clamp(quantity, 120, 700);
  const driftScale = clamp((120 - ease) / 6, 4, 12);

  const particles = Array.from({ length: safeQuantity }, (_, index) => {
    const left = ((index * 37) % 1000) / 10;
    const top = ((index * 61) % 1000) / 10;
    const size = 1.4 + ((index * 17) % 5) * 0.7;
    const opacity = 0.12 + (((index * 19) % 18) / 100);
    const duration = 18 + ((index * 7) % 18);
    const delay = -(((index * 11) % 24));
    const driftX = (((index * 29) % 200) / 100 - 1) * driftScale;
    const driftY = (((index * 31) % 200) / 100 - 1) * driftScale;
    const blur = size > 3.8 ? 0.4 : 0;

    return {
      id: index,
      left,
      top,
      size,
      opacity,
      duration,
      delay,
      driftX,
      driftY,
      blur,
      animationName: index % 2 === 0 ? "particleFloatA" : "particleFloatB",
    };
  });

  return (
    <div className={`particle-field absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="particle-dot absolute rounded-full"
          style={
            {
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              backgroundColor: color,
              filter: `blur(${particle.blur}px)`,
              boxShadow: `0 0 ${particle.size * 2.5}px ${color}20`,
              animationName: particle.animationName,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              ["--particle-drift-x" as string]: `${particle.driftX}vw`,
              ["--particle-drift-y" as string]: `${particle.driftY}vh`,
            } as Record<string, string | number>
          }
        />
      ))}

      <style>{`
        .particle-field {
          pointer-events: none;
        }

        .particle-dot {
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          will-change: transform, opacity;
        }

        @keyframes particleFloatA {
          0% {
            transform: translate3d(0, 0, 0) scale(0.96);
            opacity: 0.08;
          }
          50% {
            transform: translate3d(calc(var(--particle-drift-x) * 0.55), calc(var(--particle-drift-y) * -0.4), 0) scale(1.08);
            opacity: 0.24;
          }
          100% {
            transform: translate3d(var(--particle-drift-x), var(--particle-drift-y), 0) scale(0.98);
            opacity: 0.12;
          }
        }

        @keyframes particleFloatB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.06;
          }
          50% {
            transform: translate3d(calc(var(--particle-drift-x) * -0.45), calc(var(--particle-drift-y) * 0.35), 0) scale(1.12);
            opacity: 0.2;
          }
          100% {
            transform: translate3d(calc(var(--particle-drift-x) * -1), calc(var(--particle-drift-y) * -1), 0) scale(0.94);
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  );
}
