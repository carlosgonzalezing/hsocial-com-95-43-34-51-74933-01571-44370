
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const RestrictedAccess: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="p-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
        <p className="mb-4">No tienes permisos para acceder a esta página.</p>
        <Button onClick={() => navigate("/")}>Volver al inicio</Button>
      </Card>
    </div>
  );
};

export default RestrictedAccess;
