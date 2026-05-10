import { useRoute, useLocation, Link } from "wouter";
import { useGetNote, useDeleteNote, useTogglePin, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit3, Trash2, Pin, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
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
    query: { enabled: !!noteId, queryKey: ["/api/notes", noteId] as const },
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
        onError: () => toast({ title: "Failed to delete note", variant: "destructive" }),
      }
    );
  };

  const handleTogglePin = () => {
    togglePin.mutate(
      { id: noteId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          queryClient.invalidateQueries({ queryKey: ["/api/notes", noteId] as const });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#a855f7" }} />
        </div>
      </AppLayout>
    );
  }

  if (isError || !note) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Note not found</h2>
          <Link href="/notes">
            <button className="px-6 py-2 rounded-full text-white" style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}>
              Back to Notes
            </button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/notes">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all" style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all"
              style={note.isPinned
                ? { background: "rgba(59,130,246,0.2)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.35)" }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Pin className={`h-4 w-4 ${note.isPinned ? "fill-current" : ""}`} />
            </button>

            <Link href={`/notes/${note.id}/edit`}>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }}
              >
                <Edit3 className="h-4 w-4" /> Edit
              </button>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent style={{ background: "rgba(20,15,50,0.97)", border: "1px solid rgba(168,85,247,0.25)", backdropFilter: "blur(16px)" }}>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete this note?</AlertDialogTitle>
                  <AlertDialogDescription style={{ color: "rgba(255,255,255,0.5)" }}>
                    This action cannot be undone. Your note will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white" }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Note card */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(168,85,247,0.2)", backdropFilter: "blur(16px)", boxShadow: "0 8px 40px rgba(168,85,247,0.1)" }}
        >
          <div className="h-1" style={{ background: "linear-gradient(90deg, #a855f7, #3b82f6, #ec4899)" }} />

          <div className="p-6 md:p-10">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ color: "white" }}>
              {note.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Calendar className="h-4 w-4" />
                <span>Created {format(new Date(note.createdAt), "MMM d, yyyy")}</span>
                {note.updatedAt !== note.createdAt && (
                  <span className="italic ml-2">(Edited {format(new Date(note.updatedAt), "MMM d")})</span>
                )}
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="text-lg leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.75)" }}>
              {note.content || <span style={{ color: "rgba(255,255,255,0.25)" }}>No content.</span>}
            </div>
          </div>
        </motion.article>
      </div>
    </AppLayout>
  );
}
