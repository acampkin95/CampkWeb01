import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 pb-12">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-12 w-96" />
        <Skeleton variant="text" className="h-5 w-full max-w-2xl" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 border-b border-slate-200">
        <Skeleton variant="rectangular" className="h-10 w-32 rounded-t-lg" />
        <Skeleton variant="rectangular" className="h-10 w-32 rounded-t-lg" />
        <Skeleton variant="rectangular" className="h-10 w-32 rounded-t-lg" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <Skeleton variant="rectangular" className="h-64 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-64 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
