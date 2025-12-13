
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CareerBadge } from "./CareerBadge";

interface IdeaHeaderProps {
  title: string;
  userId: string;
}

export function IdeaHeader({ title, userId }: IdeaHeaderProps) {
  const [userCareer, setUserCareer] = useState<string>("");

  useEffect(() => {
    const fetchUserCareer = async () => {
      try {
        console.log("Fetching career for user:", userId);
        
        const { data } = await (supabase as any)
          .from("profiles")
          .select("career")
          .eq("id", userId)
          .single();
          
        console.log("User career data:", data);
        
        if (data?.career) {
          setUserCareer(data.career);
        }
      } catch (error) {
        console.error("Error fetching user career:", error);
      }
    };

    if (userId) {
      fetchUserCareer();
    }
  }, [userId]);

  return (
    <div className="p-4 border-b border-primary/20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {userCareer && <CareerBadge career={userCareer} />}
      </div>
    </div>
  );
}
