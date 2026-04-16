import React from "react";
import { cn } from "./utils";

export function Input({ className = "", ...props }) {
  return <input className={cn("h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-200", className)} {...props} />;
}

