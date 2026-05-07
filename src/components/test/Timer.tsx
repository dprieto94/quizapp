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
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  // Disparar onExpire en un effect separado, no dentro del updater de setState.
  // Si lo llamáramos dentro del updater, React lo trataría como setState durante
  // el render de Timer y disparaba el warning "Cannot update a component while
  // rendering a different component".
  useEffect(() => {
    if (secondsLeft === 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpireRef.current();
    }
  }, [secondsLeft]);

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
