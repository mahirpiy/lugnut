import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface Record {
  id: string;
  title: string;
  jobId: string;
  jobName: string;
  date: string;
  odometer: number;
}

interface LinkRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  intervalId: string;
  intervalName: string;
  vehicleId: string;
  refreshData: () => Promise<void>;
}

export function LinkRecordsModal({
  isOpen,
  onClose,
  intervalId,
  intervalName,
  vehicleId,
  refreshData,
}: LinkRecordsModalProps) {
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(
    new Set()
  );
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(
          `/api/vehicles/${vehicleId}/records/unlinked`
        );
        if (!response.ok) throw new Error("Failed to fetch records");
        const data = await response.json();

        // Sort records by date in descending order
        const sortedRecords = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setRecords(sortedRecords);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    if (isOpen) {
      fetchRecords();
    }
  }, [isOpen, vehicleId]);

  const handleCheckboxChange = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLink = async () => {
    try {
      setIsLinking(true);
      const response = await fetch(
        `/api/vehicles/${vehicleId}/service-intervals/${intervalId}/link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recordIds: Array.from(selectedRecords),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to link records");
      }

      await refreshData();
      onClose();
      setSelectedRecords(new Set());
    } catch (error) {
      console.error("Error linking records:", error);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] max-w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Link Service Records to {intervalName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 flex-1 overflow-y-auto">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center space-x-4 p-4 bg-muted rounded-lg transition-all hover:shadow-sm hover:bg-muted/70"
            >
              <Checkbox
                checked={selectedRecords.has(record.id)}
                onCheckedChange={() => handleCheckboxChange(record.id)}
                className="h-5 w-5"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">{record.title}</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {record.jobName} • {record.odometer.toLocaleString()} miles •{" "}
                  {formatDate(record.date)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button
            onClick={handleLink}
            disabled={selectedRecords.size === 0 || isLinking}
            className="cursor-pointer hover:bg-primary/90"
          >
            {isLinking ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Linking...
              </>
            ) : (
              "Link"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
