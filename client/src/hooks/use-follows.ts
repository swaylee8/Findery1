import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Follow, InsertFollow, ListingWithUser } from "@shared/schema";

export function useFollows(userId: number) {
  return useQuery<Follow[]>({
    queryKey: ["/api/users", userId.toString(), "follows"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/follows`);
      if (!response.ok) throw new Error("Failed to fetch follows");
      return response.json();
    },
  });
}

export function useFollowers(userId: number) {
  return useQuery<Follow[]>({
    queryKey: ["/api/users", userId.toString(), "followers"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/followers`);
      if (!response.ok) throw new Error("Failed to fetch followers");
      return response.json();
    },
  });
}

export function useFollowingFeed(userId: number) {
  return useQuery<ListingWithUser[]>({
    queryKey: ["/api/users", userId.toString(), "following-feed"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/following-feed`);
      if (!response.ok) throw new Error("Failed to fetch following feed");
      return response.json();
    },
  });
}

export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followData: InsertFollow) => {
      const response = await apiRequest("POST", "/api/follow", followData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
  });
}

export function useUnfollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ followerId, followType, followValue, followedId }: {
      followerId: number;
      followType: string;
      followValue?: string;
      followedId?: number;
    }) => {
      const response = await apiRequest("DELETE", "/api/follow", {
        followerId,
        followType,
        followValue,
        followedId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
  });
}

export function useIsFollowing(followerId: number, followType: string, followValue?: string, followedId?: number) {
  return useQuery<{ isFollowing: boolean }>({
    queryKey: ["/api/follow/check", followerId, followType, followValue, followedId],
    queryFn: async () => {
      const params = new URLSearchParams({
        followerId: followerId.toString(),
        followType,
        ...(followValue && { followValue }),
        ...(followedId && { followedId: followedId.toString() }),
      });
      
      const response = await fetch(`/api/follow/check?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to check follow status");
      return response.json();
    },
    enabled: !!followerId,
  });
}