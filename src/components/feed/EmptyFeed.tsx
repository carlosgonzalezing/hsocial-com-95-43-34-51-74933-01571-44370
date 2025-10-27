
import { Card } from "../ui/card";

export function EmptyFeed() {
  return (
    <Card className="p-4 rounded-lg mb-3">
      <p className="text-center text-muted-foreground">
        No hay publicaciones para mostrar
      </p>
    </Card>
  );
}
