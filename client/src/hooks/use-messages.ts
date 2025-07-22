import { useQuery } from "@tanstack/react-query";

export function useMessageTemplates() {
  return useQuery<string[]>({
    queryKey: ["/api/message-templates"],
    queryFn: async () => {
      const response = await fetch("/api/message-templates");
      if (!response.ok) throw new Error("Failed to fetch message templates");
      return response.json();
    },
  });
}