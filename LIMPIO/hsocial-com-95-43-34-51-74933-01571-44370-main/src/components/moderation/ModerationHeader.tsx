
import React from "react";
import { Shield } from "lucide-react";

const ModerationHeader: React.FC = () => {
  return (
    <div className="sticky top-0 bg-background z-10 pb-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Moderación</h1>
        </div>
      </div>
    </div>
  );
};

export default ModerationHeader;
