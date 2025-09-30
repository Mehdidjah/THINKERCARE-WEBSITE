import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

export const CountUp = ({
  value,
  duration = 2000,
}: {
  value: number;
  duration?: number;
}) => {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const inView = useInView(ref, { margin: "-50px" });

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    let lastUpdateTime = 0;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Calculate dynamic interval - starts fast, gets much slower at the end
      const baseInterval = 16; // ~60fps initially
      const maxInterval = 200; // slowest interval at the end
      const intervalMultiplier = 1 + Math.pow(progress, 3) * 12; // Exponential slowdown
      const currentInterval = Math.min(
        baseInterval * intervalMultiplier,
        maxInterval
      );

      // Only update if enough time has passed based on current interval
      if (timestamp - lastUpdateTime >= currentInterval) {
        // Ease out cubic function for slowing down at the end
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(easedProgress * value);
        setCount(currentValue);
        lastUpdateTime = timestamp;
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value); // Ensure we end exactly at the target value
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, inView]);

  return <span ref={ref}>{count || value}</span>;
};
