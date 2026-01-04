
import { useState, useEffect } from "react";
import { ParticipantsList as BaseParticipantsList } from "@/components/ParticipantsList";
import { db } from "@/lib/supabase-type-helpers";

interface Participant {
  id: string;
  username: string;
  avatar_url?: string | null;
  profession?: string;
}

interface ParticipantsListProps {
  participants: any[];
  maxDisplay?: number;
}

export function ParticipantsList({ participants, maxDisplay = 5 }: ParticipantsListProps) {
  const [participantsWithProfiles, setParticipantsWithProfiles] = useState<Participant[]>([]);

  useEffect(() => {
    const fetchParticipantsData = async () => {
      if (!participants?.length) return;

      try {
        const participantIds = participants.map(p => p.user_id).filter(Boolean);
        
        if (participantIds.length === 0) return;

        const { data } = await db.select("profiles", "id, username, avatar_url, career")
          .in("id", participantIds as any);

        const profiles = db.getArray(data, []);
        
        const participantsData = participants.map(participant => {
          const profile = profiles.find((p: any) => 
            db.getProp(p, 'id') === participant.user_id
          );
          
          return {
            id: db.getProp(profile, 'id', participant.user_id),
            username: db.getProp(profile, 'username', 'Usuario'),
            avatar_url: db.getProp(profile, 'avatar_url'),
            profession: participant.profession || db.getProp(profile, 'career')
          };
        }).filter(p => p.id);

        setParticipantsWithProfiles(participantsData);
      } catch (error) {
        console.error("Error fetching participants data:", error);
      }
    };

    fetchParticipantsData();
  }, [participants]);

  return (
    <BaseParticipantsList 
      participants={participantsWithProfiles}
      maxDisplay={maxDisplay}
    />
  );
}
