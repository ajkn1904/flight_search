import { Card, CardContent } from "../ui/card";

export function FlightSkeleton() {
  return (
    <Card className="animate-pulse border-y rounded-none">
      <CardContent className="space-y-3">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-6 w-full bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}
