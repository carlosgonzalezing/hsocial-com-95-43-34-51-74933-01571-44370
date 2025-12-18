
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { submitPollVote } from "@/lib/api/posts/queries/polls";

export function usePollVoteMutation(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: submitVote, isPending } = useMutation({
    mutationFn: async (optionId: string) => {
      console.log(`Submitting vote for post ${postId}, option ${optionId}`);
      const result = await submitPollVote(postId, optionId);
      console.log("Vote result:", result);
      return result;
    },
    onSuccess: (result) => {
      console.log("Vote submitted successfully:", result);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      
      toast({
        title: "Voto registrado",
        description: "Tu voto ha sido registrado correctamente",
      });
    },
    onError: (error) => {
      console.error("Error voting:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar tu voto",
      });
    },
  });

  return { submitVote, isPending };
}
