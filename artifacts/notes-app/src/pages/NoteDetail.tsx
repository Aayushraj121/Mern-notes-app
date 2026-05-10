import { useRoute, useLocation, Link } from "wouter";
import { useGetNote, useDeleteNote, useTogglePin, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit3, Trash2, Pin, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function NoteDetail() {
  const [, params] = useRoute("/notes/:id");
  const noteId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: note, isLoading, isError } = useGetNote(noteId, {
    query: { enabled: !!noteId, queryKey: ['/api/notes', noteId] as const }
  });

  const deleteNote = useDeleteNote();
  const togglePin = useTogglePin();

  const handleDelete = () => {
    deleteNote.mutate(
      { id: noteId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          toast({ title: "Note deleted" });
          setLocation("/notes");
        },
        onError: () => {
          toast({ title: "Failed to delete note", variant: "destructive" });
        }
      }
    );
  };

  const handleTogglePin = () => {
    togglePin.mutate(
      { id: noteId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          queryClient.invalidateQueries({ queryKey: ['/api/notes', noteId] as const });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !note) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Note not found</h2>
          <Button asChild><Link href="/notes">Back to Notes</Link></Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground hover:text-foreground">
            <Link href="/notes">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant={note.isPinned ? "secondary" : "ghost"}
              size="icon"
              onClick={handleTogglePin}
              className={note.isPinned ? "text-primary" : "text-muted-foreground"}
              title={note.isPinned ? "Unpin note" : "Pin note"}
            >
              <Pin className={`h-4 w-4 ${note.isPinned ? "fill-current" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/notes/${note.id}/edit`}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-0">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your note.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <article className="bg-card rounded-xl border shadow-sm overflow-hidden p-6 md:p-10">
          <header className="mb-8 space-y-6 border-b pb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
              {note.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Created {format(new Date(note.createdAt), "MMM d, yyyy")}</span>
                </div>
                {note.updatedAt !== note.createdAt && (
                  <span className="italic">(Edited {format(new Date(note.updatedAt), "MMM d")})</span>
                )}
              </div>
              
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-secondary/50 font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </header>

          <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-serif">
            {note.content.split('\n').map((paragraph, i) => (
              <p key={i} className="min-h-[1.5rem]">{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </AppLayout>
  );
}
