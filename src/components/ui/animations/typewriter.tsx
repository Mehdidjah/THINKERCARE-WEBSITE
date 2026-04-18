import React, { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

export const Typewriter = ({
  text,
  split = "letter",
  delay = 10,
}: {
  text: string;
  split?: "letter" | "three-letter" | "word";
  delay?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { margin: "-50px 0px 50px 0px" });
  const [displayedText, setDisplayedText] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const getParts = () => {
    if (split === "three-letter") {
     
      const pairs = text.match(/.{1,3}/g) || [];
      return pairs;
    }
    const splitter = split === "letter" ? "" : " ";
    return text.split(splitter);
  };

  const getJoiner = () => {
    return split === "letter" || split === "three-letter" ? "" : " ";
  };

  useEffect(() => {
    if (!inView) return;

    const parts = getParts();
    const joiner = getJoiner();
    const totalParts = parts.length;

    setDisplayedText("");
    setCurrentIndex(0);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex <= totalParts) {
          setDisplayedText(parts.slice(0, nextIndex).join(joiner));
          return nextIndex;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay, inView, split]);

  return (
    <span ref={ref} className="relative inline-block whitespace-pre-line">
      <span className="invisible" aria-hidden="true">
        {text}
      </span>
      <span className="absolute inset-0 whitespace-pre-line">
        {displayedText}
      </span>
    </span>
  );
};
