import { Skeleton } from "@/components/ui/skeleton";

export function ResultsSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Carregando repúblicas">
      <Skeleton className="h-9 w-full max-w-md rounded-xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-2xl border border-border p-4">
          <Skeleton className="size-24 rounded-xl" />
          <div className="grid flex-1 content-start gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
