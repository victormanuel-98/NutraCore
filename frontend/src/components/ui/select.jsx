import React, { createContext, useContext, useMemo, useState } from "react";
import { cn } from "./utils";

const SelectCtx = createContext(null);

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = useState(false);
  const ctx = useMemo(() => ({ value, onValueChange, open, setOpen }), [value, onValueChange, open]);
  return <SelectCtx.Provider value={ctx}><div className="relative">{children}</div></SelectCtx.Provider>;
}

export function SelectTrigger({ className = "", children, ...props }) {
  const ctx = useContext(SelectCtx);
  return (
    <button type="button" className={cn("flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-sm", className)} onClick={() => ctx.setOpen(!ctx.open)} {...props}>
      {children}
    </button>
  );
}

export function SelectValue({ placeholder = "Selecciona" }) {
  const ctx = useContext(SelectCtx);
  return <span className="ml-1">{ctx.value || placeholder}</span>;
}

export function SelectContent({ className = "", children }) {
  const ctx = useContext(SelectCtx);
  if (!ctx.open) return null;
  return <div className={cn("absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white p-1 shadow", className)}>{children}</div>;
}

export function SelectItem({ value, children, className = "" }) {
  const ctx = useContext(SelectCtx);
  return (
    <button
      type="button"
      className={cn("block w-full rounded px-2 py-2 text-left text-sm hover:bg-gray-100", className)}
      onClick={() => {
        ctx.onValueChange?.(value);
        ctx.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

