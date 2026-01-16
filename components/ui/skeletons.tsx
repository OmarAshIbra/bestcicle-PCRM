import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="rounded-md border">
        <div className="h-12 border-b px-4 flex items-center gap-4">
          <Skeleton className="h-4 w-[30px]" />
          <Skeleton className="h-4 w-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 px-4 flex items-center gap-4 border-b last:border-0"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
            <Skeleton className="h-8 w-[100px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="p-6 pt-0 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-80 flex-shrink-0 space-y-4">
          <Skeleton className="h-8 w-full rounded-md" />
          <div className="space-y-2">
            {[...Array(3)].map((_, j) => (
              <CardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
