
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PersonalDataSettings } from "@/components/settings/PersonalDataSettings";

export default function AccountSettings() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="border-b p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <PersonalDataSettings />
    </div>
  );
}
