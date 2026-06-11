"use client";

import { useEffect, useState } from "react";

type Breakpoint = {
  name: string;
  min: number;
  label: string;
};

const breakpoints: Breakpoint[] = [
  { name: "xs", min: 0, label: "xs" },
  { name: "sm", min: 640, label: "sm" },
  { name: "md", min: 768, label: "md" },
  { name: "lg", min: 1024, label: "lg" },
  { name: "xl", min: 1280, label: "xl" },
  { name: "2xl", min: 1536, label: "2xl" },
];

const activeBreakpoint = (width: number) => {
  for (let i = breakpoints.length - 1; i >= 0; i--) {
    if (width >= breakpoints[i].min) {
      return breakpoints[i];
    }
  }
  return breakpoints[0];
};

function BreakpointIndicator() {
  const [bp, setBp] = useState<Breakpoint>({ name: "", min: 0, label: "" });

  useEffect(() => {
    const handler = () => setBp(activeBreakpoint(window.innerWidth));
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (!bp.name) return null;

  const isMobile = bp.min < 768;

  return (
    <div className="fixed top-1 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-mono text-white shadow-sm backdrop-blur select-none">
      <span className={`size-2 rounded-full ${isMobile ? "bg-amber-400" : "bg-emerald-400"}`} />
      <span>{bp.label}</span>
      <span className="text-white/50">{bp.min}px</span>
    </div>
  );
}

export { BreakpointIndicator };
