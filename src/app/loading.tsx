import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-10 pb-12">
      {/* Hero skeleton */}
      <div className="space-y-4">
        <Skeleton variant="text" className="h-12 w-3/4" />
        <Skeleton variant="text" className="h-6 w-1/2" />
        <Skeleton variant="rectangular" className="h-64 w-full rounded-3xl" />
      </div>

      {/* Content sections skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton variant="rectangular" className="h-48 rounded-3xl" />
        <Skeleton variant="rectangular" className="h-48 rounded-3xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton variant="rectangular" className="h-64 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-64 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
