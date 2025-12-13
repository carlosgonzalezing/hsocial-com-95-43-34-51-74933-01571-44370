
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PeopleYouMayKnowSkeleton() {
  return (
    <Card className="mb-4 overflow-hidden shadow-md">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Personas que quizá conozcas</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link to="/friends" className="flex items-center w-full">
                  Ver todo
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="px-2 py-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative rounded-lg p-3 animate-pulse">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-16 w-16 rounded-full bg-muted"></div>
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="h-3 w-16 bg-muted rounded"></div>
                <div className="h-8 w-full bg-muted rounded mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
