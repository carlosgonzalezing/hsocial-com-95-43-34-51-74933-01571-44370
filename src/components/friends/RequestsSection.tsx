
import { FriendRequestsList } from "./FriendRequestsList";
import { FriendRequestsLoader } from "./FriendRequestsLoader";
import { NoRequests } from "./NoRequests";
import { FriendRequest } from "@/hooks/use-friends";

interface RequestsSectionProps {
  receivedRequests: FriendRequest[];
  loading?: boolean;
  handleRequest: (requestId: string, accept: boolean) => Promise<void>;
}

export function RequestsSection({ 
  receivedRequests, 
  loading = false, 
  handleRequest 
}: RequestsSectionProps) {
  if (loading) {
    return <FriendRequestsLoader />;
  }
  
  if (receivedRequests.length === 0) {
    return <NoRequests />;
  }
  
  return (
    <div className="mb-6">
      <FriendRequestsList
        requests={receivedRequests}
        onRespond={handleRequest}
      />
    </div>
  );
}
