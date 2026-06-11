"use client";

import { useEvents } from "@/hooks/useApi";
import { Card, CardHeader } from "@/components/ui/card";
import { EventTable } from "@/components/tables/event-table";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const { data, isLoading } = useEvents();

  if (isLoading || !data) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-slate-50">Event Schedule</h1>

      <Card>
        <CardHeader title="Upcoming Events" />
        <EventTable events={data.upcoming} showCountdown />
      </Card>

      <Card>
        <CardHeader title="Historical Events" />
        <EventTable events={data.historical} />
      </Card>
    </div>
  );
}
