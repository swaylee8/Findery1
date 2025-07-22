import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BoardWithListings, InsertBoard } from "@shared/schema";

export function useUserBoards(userId: number) {
  return useQuery<BoardWithListings[]>({
    queryKey: ["/api/users", userId.toString(), "boards"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/boards`);
      if (!response.ok) throw new Error("Failed to fetch boards");
      return response.json();
    },
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boardData: InsertBoard) => {
      const response = await apiRequest("POST", "/api/boards", boardData);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", variables.userId.toString(), "boards"] 
      });
    },
  });
}

export function useAddListingToBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, listingId }: { boardId: number; listingId: number }) => {
      const response = await apiRequest("POST", `/api/boards/${boardId}/listings`, { listingId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

export function useRemoveListingFromBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, listingId }: { boardId: number; listingId: number }) => {
      const response = await apiRequest("DELETE", `/api/boards/${boardId}/listings/${listingId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boardId: number) => {
      const response = await apiRequest("DELETE", `/api/boards/${boardId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}