import React from "react";
import { cn } from "./utils";

export function Card({ className = "", ...props }) {
  return <div className={cn("reveal-item rounded-lg border border-gray-200 bg-white shadow-sm", className)} {...props} />;
}

