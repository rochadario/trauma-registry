"use client";

import { useState, useEffect } from "react";

export function TypewriterHeadline({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
        setTimeout(() => setCursorVisible(false), 1800);
      }
    }, 38);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className={className}>
      {displayed}
      {cursorVisible && (
        <span
          className={`inline-block align-middle ml-1 w-[3px] bg-red-400 ${done ? "animate-pulse" : ""}`}
          style={{ height: "0.85em" }}
        />
      )}
    </span>
  );
}
