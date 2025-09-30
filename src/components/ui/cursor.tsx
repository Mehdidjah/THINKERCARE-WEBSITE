import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";

function throttle<T extends (...args: any[]) => void>(fn: T, limit: number): T {
  let lastCall = 0;
  let lastArgs: any;
  let timeout: any;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    lastArgs = args;
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, lastArgs);
      }, limit - (now - lastCall));
    }
  } as T;
}

export const CursorReact = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  enum CursorOverTarget {
    Default = "DEFAULT",
    Text = "TEXT",
    Link = "LINK",
    Button = "BUTTON",
  }

  const [overTarget, setOverTarget] = useState<CursorOverTarget>(
    CursorOverTarget.Default
  );
  const [textLineHeight, setTextLineHeight] = useState(20);

  const computeActualLineHeight = (
    computedStyle: CSSStyleDeclaration
  ): number => {
    const lineHeight = computedStyle.lineHeight;
    const fontSize = parseFloat(computedStyle.fontSize);
    let actualLineHeight = 20;

    if (lineHeight === "normal") {
      actualLineHeight = fontSize * 1.2;
    } else if (lineHeight.endsWith("px")) {
      actualLineHeight = parseFloat(lineHeight);
    } else if (lineHeight.endsWith("em") || lineHeight.endsWith("rem")) {
      actualLineHeight = parseFloat(lineHeight) * fontSize;
    } else if (!isNaN(parseFloat(lineHeight))) {
      actualLineHeight = parseFloat(lineHeight) * fontSize;
    }

    return actualLineHeight;
  };

  const getCursorTargetAt = (x: number, y: number): CursorOverTarget => {
    const element = document.elementFromPoint(x, y);
    if (!element) {
      return CursorOverTarget.Default;
    }

    const buttonLike = (element as HTMLElement).closest(
      'button,[role="button"],input[type="button"],input[type="submit"],input[type="reset"]'
    );
    if (buttonLike) {
      return CursorOverTarget.Button;
    }

    const anchor = (element as HTMLElement).closest("a");
    if (anchor) {
      return CursorOverTarget.Link;
    }

    const computedStyle = window.getComputedStyle(element);
    if (
      computedStyle.cursor === "text" ||
      element.tagName === "INPUT" ||
      element.tagName === "TEXTAREA" ||
      (element as HTMLElement).contentEditable === "true"
    ) {
      setTextLineHeight(computeActualLineHeight(computedStyle));
      return CursorOverTarget.Text;
    }

    try {
      const textWalker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      );

      let textNode = textWalker.nextNode();
      while (textNode) {
        if (textNode.textContent?.trim()) {
          const range = document.createRange();
          range.selectNodeContents(textNode);
          const rects = range.getClientRects();

          for (let i = 0; i < rects.length; i++) {
            const r = rects[i];
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
              const styleForText = window.getComputedStyle(
                (textNode.parentElement || element) as Element
              );
              setTextLineHeight(computeActualLineHeight(styleForText));
              return CursorOverTarget.Text;
            }
          }
        }
        textNode = textWalker.nextNode();
      }
    } catch (e) {
      // Ignore errors
    }

    return CursorOverTarget.Default;
  };

  const throttledUpdate = useRef(
    throttle((e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setPosition({ x, y });
      setOverTarget(getCursorTargetAt(x, y));
    }, 1000 / 24) // ~24fps
  ).current;

  useEffect(() => {
    window.addEventListener("mousemove", throttledUpdate);
    return () => {
      window.removeEventListener("mousemove", throttledUpdate);
    };
  }, [throttledUpdate]);

  return (
    <motion.div
      className={`fixed backdrop-invert border border-foreground backdrop-saturate-0 pointer-events-none z-1000 backdrop-contrast-[200] ${
        overTarget === CursorOverTarget.Text
          ? "rounded-sm" // Line cursor for text
          : overTarget === CursorOverTarget.Link ||
            overTarget === CursorOverTarget.Button
          ? "" // Triangle for links/buttons via clip-path
          : "rounded-full" // Circle cursor for everything else
      }`}
      style={{
        clipPath:
          overTarget === CursorOverTarget.Link ||
          overTarget === CursorOverTarget.Button
            ? "polygon(50% 0%, 0% 100%, 100% 100%)"
            : "none",
      }}
      animate={{
        left:
          overTarget === CursorOverTarget.Text
            ? position.x - 1
            : overTarget === CursorOverTarget.Link ||
              overTarget === CursorOverTarget.Button
            ? position.x - 35 / 2 // half of triangle width (18)
            : position.x - 35 / 2,
        top:
          overTarget === CursorOverTarget.Text
            ? position.y - textLineHeight / 2
            : overTarget === CursorOverTarget.Link ||
              overTarget === CursorOverTarget.Button
            ? position.y - 4 // triangle tip aligns with pointer
            : position.y - 8,
        width:
          overTarget === CursorOverTarget.Text
            ? textLineHeight > 30
              ? 8
              : 6
            : overTarget === CursorOverTarget.Link ||
              overTarget === CursorOverTarget.Button
            ? 20
            : 35,
        height:
          overTarget === CursorOverTarget.Text
            ? `${textLineHeight * 0.8}px`
            : overTarget === CursorOverTarget.Link ||
              overTarget === CursorOverTarget.Button
            ? 24
            : 35,
      }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    />
  );
};
