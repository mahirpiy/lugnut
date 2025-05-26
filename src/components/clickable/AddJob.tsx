import { canAddJob } from "@/utils/subscription";
import { Lock, Wrench } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function AddJob({
  vehicleUuid,
  jobCount,
}: {
  vehicleUuid: string;
  jobCount: number;
}) {
  const { data: session } = useSession();
  const isPaid = session?.user?.isPaid ?? false;
  if (canAddJob(isPaid, jobCount)) {
    return (
      <Button asChild>
        <Link href={`/dashboard/vehicles/${vehicleUuid}/jobs/new`}>
          <Wrench className="h-4 w-4 mr-2" />
          Add Job
        </Link>
      </Button>
    );
  }

  return (
    <Button disabled>
      <Lock className="h-4 w-4 mr-2" />
      You&apos;ve hit the limit of free jobs. Upgrade now to add more.
    </Button>
  );
}
