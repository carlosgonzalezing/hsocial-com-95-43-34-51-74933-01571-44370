import React from "react";
import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FriendRequestsPage = () => {
  const navigate = useNavigate();

  return (
    <FullScreenPageLayout title="Mi red">
      <div className="container px-2 sm:px-4 max-w-4xl pt-4">
        <Card className="p-6">
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="text-muted-foreground">
              Esta sección ya no está disponible. Ahora usamos seguidores y seguidos.
            </div>
            <Button onClick={() => navigate('/friends')}>Ir a Mi red</Button>
          </div>
        </Card>
      </div>
    </FullScreenPageLayout>
  );
};

export default FriendRequestsPage;
