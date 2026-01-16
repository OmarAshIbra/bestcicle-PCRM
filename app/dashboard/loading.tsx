import { CardSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <CardSkeleton />
        </div>
        <div className="col-span-3">
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
