"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MagicHoverProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "shine" | "border";
  children: React.ReactNode;
}

const MagicHover = React.forwardRef<HTMLDivElement, MagicHoverProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const [isMounted, setIsMounted] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const divRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;
      const rect = divRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({ x, y });
    };

    if (!isMounted) {
      return (
        <div ref={ref} className={cn(className)} {...props}>
          {children}
        </div>
      );
    }

    return (
      <div
        ref={divRef}
        className={cn(
          "group relative overflow-hidden rounded-md",
          {
            "bg-background": variant !== "border",
            "border border-border": variant === "border",
          },
          className
        )}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {variant === "primary" && (
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(120, 65, 255, 0.15), transparent 40%)`,
            }}
          />
        )}
        {variant === "secondary" && (
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255, 65, 120, 0.15), transparent 40%)`,
            }}
          />
        )}
        {variant === "shine" && (
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(100px circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, 0.2), transparent 40%)`,
            }}
          />
        )}
        {variant === "border" && (
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(120, 65, 255, 0.1), transparent 40%)`,
              border: `1px solid rgba(120, 65, 255, 0.2)`,
              borderRadius: "inherit",
            }}
          />
        )}
        {children}
      </div>
    );
  }
);
MagicHover.displayName = "MagicHover";

export { MagicHover }; 