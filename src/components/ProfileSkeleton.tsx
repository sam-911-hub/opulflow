import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile Display Skeleton */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <Skeleton className="h-6 w-48 bg-white/20" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center md:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Edit Skeleton */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <Skeleton className="h-6 w-56 bg-white/20" />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
          <div className="pt-4">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}