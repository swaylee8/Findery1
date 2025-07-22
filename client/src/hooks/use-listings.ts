import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ListingWithUser, InsertListing } from "@shared/schema";

export function useListings(category?: string, userId?: number) {
  const queryKey = ["/api/listings"];
  if (category) queryKey.push(category);
  if (userId) queryKey.push(userId.toString());

  return useQuery<ListingWithUser[]>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (userId) params.append("userId", userId.toString());
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch listings");
      return response.json();
    },
  });
}

export function useListing(id: number, userId?: number) {
  return useQuery<ListingWithUser>({
    queryKey: ["/api/listings", id.toString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId.toString());
      
      const response = await fetch(`/api/listings/${id}?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch listing");
      return response.json();
    },
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingData: InsertListing) => {
      const response = await apiRequest("POST", "/api/listings", listingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, listingId }: { userId: number; listingId: number }) => {
      const response = await apiRequest("POST", "/api/likes/toggle", { userId, listingId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

export function useUserListings(userId: number) {
  return useQuery({
    queryKey: ["/api/users", userId.toString(), "listings"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/listings`);
      if (!response.ok) throw new Error("Failed to fetch user listings");
      return response.json();
    },
  });
}

export function useLikedListings(userId: number) {
  return useQuery<ListingWithUser[]>({
    queryKey: ["/api/users", userId.toString(), "likes"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/likes`);
      if (!response.ok) throw new Error("Failed to fetch liked listings");
      return response.json();
    },
  });
}
