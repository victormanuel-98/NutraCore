import React, { createContext, useContext, useMemo, useState } from "react";
import { cn } from "./utils";

const TabsCtx = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, className = "", children }) {
  const [internal, setInternal] = useState(defaultValue || "");
  const current = value ?? internal;
  const setCurrent = (v) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };
  const ctx = useMemo(() => ({ current, setCurrent }), [current]);
  return <TabsCtx.Provider value={ctx}><div className={cn("w-full", className)}>{children}</div></TabsCtx.Provider>;
}

export function TabsList({ className = "", ...props }) {
  return <div className={cn("inline-flex rounded-md bg-gray-100 p-1", className)} {...props} />;
}

export function TabsTrigger({ value, className = "", children, ...props }) {
  const ctx = useContext(TabsCtx);
  const active = ctx.current === value;
  return (
    <button
      type="button"
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-all duration-150",
        active
          ? "bg-white text-gray-900 shadow"
          : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm dark:hover:bg-white/10 dark:hover:text-white",
        className
      )}
      onClick={() => ctx.setCurrent(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children, ...props }) {
  const ctx = useContext(TabsCtx);
  if (ctx.current !== value) return null;
  return <div className={cn(className)} {...props}>{children}</div>;
}

