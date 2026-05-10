import { Link } from "wouter";
import { format } from "date-fns";
import { Pin, Calendar } from "lucide-react";
import { Note } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { useTogglePin, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const CARD_ACCENTS = [
  { border: "rgba(168,85,247,0.4)", glow: "rgba(168,85,247,0.15)", tag: "rgba(168,85,247,0.2)", tagText: "#c084fc", dot: "#a855f7" },
  { border: "rgba(59,130,246,0.4)", glow: "rgba(59,130,246,0.15)", tag: "rgba(59,130,246,0.2)", tagText: "#60a5fa", dot: "#3b82f6" },
  { border: "rgba(236,72,153,0.4)", glow: "rgba(236,72,153,0.15)", tag: "rgba(236,72,153,0.2)", tagText: "#f472b6", dot: "#ec4899" },
  { border: "rgba(16,185,129,0.4)", glow: "rgba(16,185,129,0.15)", tag: "rgba(16,185,129,0.2)", tagText: "#34d399", dot: "#10b981" },
  { border: "rgba(245,158,11,0.4)", glow: "rgba(245,158,11,0.15)", tag: "rgba(245,158,11,0.2)", tagText: "#fbbf24", dot: "#f59e0b" },
  { border: "rgba(99,102,241,0.4)", glow: "rgba(99,102,241,0.15)", tag: "rgba(99,102,241,0.2)", tagText: "#818cf8", dot: "#6366f1" },
];

interface NoteCardProps {
  note: Note;
  index: number;
}

export function NoteCard({ note, index }: NoteCardProps) {
  const queryClient = useQueryClient();
  const togglePin = useTogglePin();
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  const handleTogglePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    togglePin.mutate(
      { id: note.id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() }) }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="h-full"
    >
      <Link href={`/notes/${note.id}`}>
        <div
          className="h-full flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${accent.border}`,
            backdropFilter: "blur(12px)",
            boxShadow: `0 4px 24px ${accent.glow}`,
          }}
        >
          {/* Coloured top bar */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent.dot}, transparent)` }} />

          <div className="flex flex-col flex-1 p-5">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3
                className="text-base font-semibold line-clamp-2 leading-snug transition-colors"
                style={{ color: "rgba(255,255,255,0.92)" }}
              >
                {note.title}
              </h3>
              <button
                onClick={handleTogglePin}
                className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center transition-all"
                style={note.isPinned
                  ? { background: `${accent.tag}`, color: accent.dot }
                  : { color: "rgba(255,255,255,0.25)", opacity: 0 }}
                aria-label={note.isPinned ? "Unpin" : "Pin"}
              >
                <Pin className={`h-3.5 w-3.5 ${note.isPinned ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Preview */}
            <p className="text-sm line-clamp-4 leading-relaxed flex-1 mb-4 whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.45)" }}>
              {note.content || "No content yet."}
            </p>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {note.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: accent.tag, color: accent.tagText }}
                  >
                    {tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(note.updatedAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
