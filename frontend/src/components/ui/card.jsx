import React from "react";
import { cn } from "./utils";

export function Card({ className = "", ...props }) {
  return (
    <div
      className={cn(
        "reveal-item rounded-none border-2 border-pink-accent bg-white shadow-[8px_8px_0px_0px_#ff0a60]",
        className
      )}
      {...props}
    />
  );
}

