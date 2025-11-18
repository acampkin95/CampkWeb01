import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
  count?: number;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-2xl",
  };

  const baseClasses = "animate-pulse bg-slate-200";

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, variants[variant], className)}
            style={{ width, height }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    />
  );
}

interface SkeletonCardProps {
  hasImage?: boolean;
}

export function SkeletonCard({ hasImage = true }: SkeletonCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      {hasImage && <Skeleton variant="rectangular" height="200px" />}
      <div className="space-y-3">
        <Skeleton variant="text" width="60%" height="24px" />
        <Skeleton variant="text" count={3} />
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rectangular" width="80px" height="36px" />
          <Skeleton variant="rectangular" width="80px" height="36px" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-slate-200">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} variant="text" width="100px" height="16px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" width="100px" />
          ))}
        </div>
      ))}
    </div>
  );
}
