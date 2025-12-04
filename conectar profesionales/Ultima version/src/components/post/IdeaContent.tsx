
import { Lightbulb, Users, Clock, Target, MapPin, Briefcase, MessageCircle } from "lucide-react";
import type { Idea } from "@/types/post";
import { MentionsText } from "./MentionsText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IdeaContentProps {
  idea: Idea;
  content?: string;
}

export function IdeaContent({ idea, content }: IdeaContentProps) {
  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'ideation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'execution': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'launch': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'scaling': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getCommitmentColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className="px-4 py-3 rounded-lg border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          {idea.project_phase && (
            <Badge className={getPhaseColor(idea.project_phase)}>
              {idea.project_phase}
            </Badge>
          )}
        </div>

        {/* Title */}
        {idea.title && (
          <h3 className="font-semibold text-lg mb-2 text-foreground">
            {idea.title}
          </h3>
        )}

        {/* Description */}
        <MentionsText 
          content={idea.description || content || ''} 
          className="text-muted-foreground whitespace-pre-wrap break-words mb-4" 
        />

        {/* Project Details */}
        <div className="space-y-3">
          {/* Category & Duration */}
          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
            {idea.category && (
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                <span>{idea.category}</span>
              </div>
            )}
            {idea.estimated_duration && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{idea.estimated_duration}</span>
              </div>
            )}
            {idea.location_preference && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{idea.location_preference}</span>
              </div>
            )}
          </div>

          {/* Expected Impact */}
          {idea.expected_impact && (
            <div className="flex items-start">
              <Target className="h-4 w-4 mr-2 mt-0.5 text-primary" />
              <div>
                <span className="text-sm font-medium text-foreground">Impacto esperado:</span>
                <p className="text-sm text-muted-foreground">{idea.expected_impact}</p>
              </div>
            </div>
          )}

          {/* Needed Roles */}
          {idea.needed_roles && idea.needed_roles.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium text-foreground">Roles necesarios:</span>
              </div>
              <div className="space-y-2 ml-6">
                {idea.needed_roles.map((role, index) => (
                  <div key={index} className="border border-border rounded-lg p-3 bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-foreground">{role.title}</span>
                      <Badge className={getCommitmentColor(role.commitment_level)}>
                        {role.commitment_level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                    {role.skills_desired && role.skills_desired.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {role.skills_desired.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources Needed */}
          {idea.resources_needed && idea.resources_needed.length > 0 && (
            <div>
              <span className="text-sm font-medium text-foreground">Recursos necesarios:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {idea.resources_needed.map((resource, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Collaboration Type */}
          {idea.collaboration_type && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Modalidad:</span> {idea.collaboration_type}
            </div>
          )}
          
          {/* Contact Button */}
          {idea.contact_link && (
            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(idea.contact_link, '_blank')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
