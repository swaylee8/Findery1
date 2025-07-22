import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Alert, InsertAlert } from "@shared/schema";

export function useUserAlerts(userId: number) {
  return useQuery<Alert[]>({
    queryKey: ["/api/users", userId.toString(), "alerts"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/alerts`);
      if (!response.ok) throw new Error("Failed to fetch alerts");
      return response.json();
    },
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertData: InsertAlert) => {
      const response = await apiRequest("POST", "/api/alerts", alertData);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", variables.userId.toString(), "alerts"] 
      });
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Alert> }) => {
      const response = await apiRequest("PATCH", `/api/alerts/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest("DELETE", `/api/alerts/${alertId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });
}