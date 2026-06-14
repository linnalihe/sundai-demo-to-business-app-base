import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}
