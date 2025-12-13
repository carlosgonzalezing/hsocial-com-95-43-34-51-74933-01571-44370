import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ParticipantsList } from "@/components/post/idea/ParticipantsList";
import { useIdeaJoin } from "@/components/post/idea/useIdeaJoin";
import { useUserProfile } from "@/components/user-menu/hooks/useUserProfile";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IdeaDisplayProps {
  idea: any;
  postId: string;
  participants: any[];
}

export function IdeaDisplay(props: any) {
  const { idea, postId } = props;
  const [profession, setProfession] = useState("");
  const { isParticipant, isLoading, joinIdea, leaveIdea } = useIdeaJoin(postId);
  const { username, avatarUrl } = useUserProfile();

  const handleJoin = async () => {
    if (profession.trim() === "") {
      alert("Por favor, introduce tu profesión.");
      return;
    }

    await joinIdea(profession);
  };

  return (
    <>
      <Card className="w-full">
        <CardContent className="grid gap-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback>{username?.[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-3 font-medium">{username}</div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="profession">¿En qué puedes aportar a esta idea?</Label>
            <Input
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Ej. Diseñador UI/UX, Desarrollador Front-end..."
              disabled={isParticipant}
            />
          </div>

          <div className="flex items-center space-x-2">
            {idea?.tags?.map((tag: string) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isParticipant ? (
            <Button variant="destructive" onClick={leaveIdea} disabled={isLoading}>
              Salir de la idea
            </Button>
          ) : (
            <Button onClick={handleJoin} disabled={isLoading}>
              Unirme a la idea
            </Button>
          )}
        </CardFooter>
      </Card>

      <Separator className="my-4" />

      <h3 className="text-lg font-semibold mb-2">Participantes</h3>
      <ParticipantsList participants={(props as any).participants || []} />
    </>
  );
}
