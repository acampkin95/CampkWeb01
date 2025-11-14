import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning" | "info";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-900 border-slate-200",
    success: "bg-emerald-100 text-emerald-900 border-emerald-200",
    error: "bg-red-100 text-red-900 border-red-200",
    warning: "bg-amber-100 text-amber-900 border-amber-200",
    info: "bg-blue-100 text-blue-900 border-blue-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
