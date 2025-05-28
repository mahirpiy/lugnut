import { Lock, Wrench } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function AddJob({ vehicleId }: { vehicleId: string }) {
  const { data: session } = useSession();
  if (session?.user?.hasActiveSubscription) {
    return (
      <Button asChild>
        <Link href={`/garage/vehicles/${vehicleId}/jobs/new`}>
          <Wrench className="h-4 w-4 mr-2" />
          Add Job
        </Link>
      </Button>
    );
  }

  return (
    <Button
      asChild
      className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
    >
      <Link href="/garage/upgrade">
        <Lock className="h-4 w-4 mr-2 text-orange-800 dark:text-orange-400" />
        <p className="font-semibold text-orange-800 dark:text-orange-400">
          You&apos;ve hit the limit of free jobs. Upgrade to add more.
        </p>
      </Link>
    </Button>
  );
}
