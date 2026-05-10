import { Link } from "wouter";
import { format } from "date-fns";
import { Pin, Calendar, Tag } from "lucide-react";
import { Note } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTogglePin, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface NoteCardProps {
  note: Note;
  index: number;
}

export function NoteCard({ note, index }: NoteCardProps) {
  const queryClient = useQueryClient();
  const togglePin = useTogglePin();

  const handleTogglePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    togglePin.mutate(
      { id: note.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Link href={`/notes/${note.id}`}>
        <Card className="h-full flex flex-col hover-elevate transition-all duration-300 border-border/50 hover:border-primary/20 cursor-pointer group group-hover:shadow-md">
          <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
            <CardTitle className="text-xl font-serif line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {note.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 -mt-2 -mr-2 rounded-full z-10 transition-colors ${
                note.isPinned ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
              }`}
              onClick={handleTogglePin}
            >
              <Pin className={`h-4 w-4 ${note.isPinned ? "fill-current" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap">
              {note.content}
            </p>
          </CardContent>
          <CardFooter className="pt-0 flex flex-col items-start gap-4">
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {note.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-secondary/50 hover:bg-secondary text-xs px-2 py-0.5 rounded-sm font-normal">
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-sm text-muted-foreground font-normal border-dashed">
                    +{note.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            <div className="flex items-center text-xs text-muted-foreground w-full justify-between mt-auto">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(note.updatedAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
