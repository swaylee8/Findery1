import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
        "animate-[shimmer_1.5s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="w-full h-64" />
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="w-6 h-6" />
        </div>
        
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-4/5" />
        
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-6 w-20" />
          <div className="flex space-x-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TinderCardSkeleton() {
  return (
    <div className="absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden">
      <Skeleton className="w-full h-2/3" />
      <div className="p-4 h-1/3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-4/5 mb-4" />
        
        <div className="flex justify-center space-x-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProfileImageSkeleton({ size = "w-10 h-10" }: { size?: string }) {
  return <Skeleton className={`${size} rounded-full`} />;
}

export function ListingGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}