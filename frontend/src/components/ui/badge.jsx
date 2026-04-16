import React from "react";
import { cn } from "./utils";

export function Badge({ className = "", variant = "default", ...props }) {
  const variantClass = variant === "secondary" ? "bg-gray-100 text-gray-700" : "bg-gray-900 text-white";
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variantClass, className)} {...props} />;
}

