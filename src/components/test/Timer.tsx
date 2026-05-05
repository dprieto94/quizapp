"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  minutos: number;
  onExpire: () => void;
};

export function Timer({ minutos, onExpire }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(minutos * 60);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(id);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpireRef.current();
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const critical = secondsLeft <= 300;

  return (
    <span
      role="timer"
      aria-live="off"
      className={cn(
        "tabular-nums font-semibold",
        critical ? "text-danger animate-pulse" : "text-foreground",
      )}
    >
      {minutes}:{seconds}
    </span>
  );
}
