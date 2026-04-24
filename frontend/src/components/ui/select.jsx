import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "./utils";

const SelectCtx = createContext(null);

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [open]);

  const ctx = useMemo(() => ({ value, onValueChange, open, setOpen }), [value, onValueChange, open]);

  return (
    <SelectCtx.Provider value={ctx}>
      <div ref={rootRef} className={cn("relative", open && "z-[120]")}>
        {children}
      </div>
    </SelectCtx.Provider>
  );
}

export function SelectTrigger({ className = "", children, ...props }) {
  const ctx = useContext(SelectCtx);

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-sm transition-colors hover:border-[#ff0a60] focus-visible:border-[#ff0a60]",
        className
      )}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
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

  return (
    <div className={cn("absolute z-[140] mt-1 w-full rounded-md border border-gray-200 bg-white p-1 shadow-xl", className)}>
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className = "" }) {
  const ctx = useContext(SelectCtx);

  return (
    <button
      type="button"
      className={cn(
        "block w-full rounded px-2 py-2 text-left text-sm transition-colors hover:bg-[#ff0a60] hover:text-white",
        className
      )}
      onClick={() => {
        ctx.onValueChange?.(value);
        ctx.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
