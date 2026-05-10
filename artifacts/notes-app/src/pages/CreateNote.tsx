import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, X, Pin, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export function CreateNote() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createNote = useCreateNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => setTags(tags.filter((t) => t !== tagToRemove));

  const handleSave = () => {
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    createNote.mutate(
      { data: { title, content, tags, isPinned } },
      {
        onSuccess: (newNote) => {
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          toast({ title: "Note created!" });
          setLocation(`/notes/${newNote.id}`);
        },
        onError: (err) => {
          toast({ title: "Failed to create note", description: String(err), variant: "destructive" });
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <Link href="/notes">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all" style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </Link>

          <div className="flex items-center gap-3">
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
              onClick={handleSave}
              disabled={createNote.isPending || !title.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:scale-95"
              style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
            >
              {createNote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Note
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
          {/* Gradient top strip */}
          <div className="h-1" style={{ background: "linear-gradient(90deg, #a855f7, #3b82f6, #ec4899)" }} />

          <div className="p-6 md:p-10 space-y-6">
            {/* Title */}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              autoFocus
              className="text-3xl md:text-4xl font-bold border-0 px-0 h-auto rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-white/20"
              style={{ color: "white" }}
            />

            {/* Divider */}
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

            {/* Content */}
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts..."
              className="min-h-[420px] text-base resize-none border-0 px-0 focus-visible:ring-0 bg-transparent placeholder:text-white/20 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.85)" }}
            />
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
