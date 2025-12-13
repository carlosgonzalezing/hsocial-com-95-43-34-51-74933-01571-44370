
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PeopleYouMayKnowItem } from "./PeopleYouMayKnowItem";
import { PeopleYouMayKnowSkeleton } from "./PeopleYouMayKnowSkeleton";
import { usePeopleSuggestions } from "@/hooks/use-people-suggestions";

export function PeopleYouMayKnow() {
  const { 
    suggestions: visibleSuggestions,
    loading,
    handleDismiss
  } = usePeopleSuggestions();

  // If loading, show a skeleton loader
  if (loading) {
    return <PeopleYouMayKnowSkeleton />;
  }

  // Don't show the component if no visible suggestions
  if (visibleSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 overflow-hidden shadow-md border-gray-200 dark:border-gray-800">
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
      <CardContent className="px-0 py-2">
        <Carousel
          opts={{
            align: "start",
            loop: true
          }}
          className="w-full"
        >
          <CarouselContent className="ml-2">
            {visibleSuggestions.map((suggestion) => (
              <CarouselItem key={suggestion.id} className="pl-2 md:basis-1/4 basis-1/2 lg:basis-1/4">
                <PeopleYouMayKnowItem
                  suggestion={suggestion}
                  onDismiss={handleDismiss}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1 md:left-2" />
          <CarouselNext className="right-1 md:right-2" />
        </Carousel>
        <div className="mt-3 text-center">
          <Link to="/friends" className="text-sm text-primary hover:underline">
            Ver todo
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
