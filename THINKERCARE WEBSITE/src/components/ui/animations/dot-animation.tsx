import { useEffect, useState } from "react";

export const DotAnimation = ({ text }: { text: string }) => {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 3);
    }, 200);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      {".".repeat(dots + 1)}
      {text}
      {".".repeat(dots + 1)}
    </>
  );
};
