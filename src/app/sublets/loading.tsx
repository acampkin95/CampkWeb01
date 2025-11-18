import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header skeleton */}
      <header className="space-y-3 text-center">
        <Skeleton variant="text" className="mx-auto h-4 w-32" />
        <Skeleton variant="text" className="mx-auto h-10 w-64" />
        <Skeleton variant="text" className="mx-auto h-5 w-96" />
      </header>

      {/* Warehouse cards skeleton */}
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton variant="text" className="h-4 w-24" />
                <Skeleton variant="text" className="h-8 w-40" />
              </div>
              <Skeleton variant="text" className="h-6 w-32" />
            </div>
            <div className="flex gap-3">
              <Skeleton variant="rectangular" className="h-8 w-24 rounded-full" />
              <Skeleton variant="rectangular" className="h-8 w-24 rounded-full" />
              <Skeleton variant="rectangular" className="h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
