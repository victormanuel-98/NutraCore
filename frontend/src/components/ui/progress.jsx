import React from "react";
import { cn } from "./utils";

export function Progress({ value = 0, className = "" }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-gray-200", className)}>
      <div className="h-full bg-pink-500 transition-all" style={{ width: `${safe}%` }} />
    </div>
  );
}

