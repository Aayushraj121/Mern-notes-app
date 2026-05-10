import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useGetNote, useUpdateNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { ArrowLeft, Save, X, Pin, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function EditNote() {
  const [, params] = useRoute("/notes/:id/edit");
  const noteId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateNote = useUpdateNote();

  const { data: note, isLoading: isLoadingNote } = useGetNote(noteId, {
    query: { enabled: !!noteId, queryKey: ["/api/notes", noteId] as const },
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const initializedRef = useRef<number | null>(null);
  const lastSavedRef = useRef({ title: "", content: "", tags: [] as string[], isPinned: false });

  useEffect(() => {
    if (note && initializedRef.current !== note.id) {
      initializedRef.current = note.id;
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setIsPinned(note.isPinned);
      lastSavedRef.current = { title: note.title, content: note.content, tags: note.tags || [], isPinned: note.isPinned };
    }
  }, [note]);

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);
  const mutateFnRef = useRef(updateNote.mutate);
  mutateFnRef.current = updateNote.mutate;

  useEffect(() => {
    if (initializedRef.current !== noteId) return;
    const hasChanges =
      debouncedTitle !== lastSavedRef.current.title ||
      debouncedContent !== lastSavedRef.current.content ||
      JSON.stringify(tags) !== JSON.stringify(lastSavedRef.current.tags) ||
      isPinned !== lastSavedRef.current.isPinned;

    if (hasChanges && debouncedTitle.trim()) {
      setSaveStatus("saving");
      mutateFnRef.current(
        { id: noteId, data: { title: debouncedTitle, content: debouncedContent, tags, isPinned } },
        {
          onSuccess: (updatedData) => {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
            lastSavedRef.current = { title: updatedData.title, content: updatedData.content, tags: updatedData.tags || [], isPinned: updatedData.isPinned };
            queryClient.setQueryData(["/api/notes", noteId] as const, updatedData);
            queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          },
          onError: () => {
            setSaveStatus("idle");
            toast({ title: "Auto-save failed", variant: "destructive" });
          },
        }
      );
    }
  }, [debouncedTitle, debouncedContent, tags, isPinned, noteId, queryClient, toast]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => setTags(tags.filter((t) => t !== tagToRemove));

  const handleManualSave = () => {
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    updateNote.mutate(
      { id: noteId, data: { title, content, tags, isPinned } },
      {
        onSuccess: (updated) => {
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          queryClient.setQueryData(["/api/notes", noteId] as const, updated);
          toast({ title: "Changes saved" });
          setLocation(`/notes/${noteId}`);
        },
        onError: () => {
          setIsSaving(false);
          toast({ title: "Failed to save", variant: "destructive" });
        },
      }
    );
  };

  if (isLoadingNote) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#a855f7" }} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <Link href={`/notes/${noteId}`}>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all" style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <ArrowLeft className="h-4 w-4" /> Cancel
            </button>
          </Link>

          <div className="flex items-center gap-3">
            {/* Auto-save indicator */}
            <span className="hidden sm:flex items-center gap-1.5 text-sm">
              {saveStatus === "saving" && <><Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "#a855f7" }} /><span style={{ color: "rgba(255,255,255,0.4)" }}>Saving…</span></>}
              {saveStatus === "saved" && <><CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#34d399" }} /><span style={{ color: "#34d399" }}>Saved</span></>}
            </span>

            <button
              onClick={() => setIsPinned(!isPinned)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={isPinned
                ? { background: "rgba(59,130,246,0.2)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.35)" }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Pin className={`h-4 w-4 ${isPinned ? "fill-current" : ""}`} />
              {isPinned ? "Pinned" : "Pin"}
            </button>

            <button
              onClick={handleManualSave}
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Done
            </button>
          </div>
        </div>

        {/* Editor card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(168,85,247,0.25)", backdropFilter: "blur(16px)", boxShadow: "0 8px 40px rgba(168,85,247,0.12)" }}
        >
          <div className="h-1" style={{ background: "linear-gradient(90deg, #a855f7, #3b82f6, #ec4899)" }} />

          <div className="p-6 md:p-10 space-y-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-3xl md:text-4xl font-bold border-0 px-0 h-auto rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-white/20"
              style={{ color: "white" }}
            />

            <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 items-center min-h-[2.25rem]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                  style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }}
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Add tags (Enter)..." : "Add more..."}
                className="h-8 w-36 text-sm border-0 focus-visible:ring-0 bg-transparent px-0 placeholder:text-white/25"
                style={{ color: "rgba(255,255,255,0.7)" }}
              />
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-[500px] text-base resize-none border-0 px-0 focus-visible:ring-0 bg-transparent placeholder:text-white/20 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.85)" }}
            />
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
