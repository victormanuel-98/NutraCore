import React from "react";
import { cn } from "./utils";

export function Button({ className = "", variant = "default", size = "default", ...props }) {
  const variantClass = {
    default: "bg-black text-white hover:opacity-90",
    outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "bg-transparent hover:bg-gray-100",
    link: "bg-transparent text-blue-600 underline"
  }[variant] || "bg-black text-white";

  const sizeClass = {
    default: "h-9 px-4",
    sm: "h-8 px-3",
    lg: "h-10 px-6",
    icon: "h-9 w-9"
  }[size] || "h-9 px-4";

  return <button className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition", variantClass, sizeClass, className)} {...props} />;
}

