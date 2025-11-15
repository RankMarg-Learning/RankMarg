import { Card, CardHeader, CardTitle, CardContent } from "@repo/common-ui";
import { Skeleton } from "@repo/common-ui";

export default function ProfileSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-center">
          <Skeleton className="h-6 w-40" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        {["Name", "Username", "Phone", "Standard", "Location"].map((field, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
