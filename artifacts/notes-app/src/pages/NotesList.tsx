import { useState } from "react";
import { useListNotes, getListNotesQueryKey, useGetNoteStats } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteCard } from "@/components/NoteCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ArrowLeft, ArrowRight, Tag as TagIcon, Pin, FileText, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { motion } from "framer-motion";
import { Link } from "wouter";

export function NotesList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const limit = 12;

  const { data: stats } = useGetNoteStats();
  const { data: noteResponse, isLoading } = useListNotes({
    search: debouncedSearch || undefined,
    page,
    limit,
    tag: selectedTag,
    pinned: showPinnedOnly || undefined,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTag(selectedTag === tag ? undefined : tag);
    setPage(1);
  };

  const hasFilters = debouncedSearch || selectedTag || showPinnedOnly;

  return (
    <AppLayout>
      <div className="flex flex-col space-y-8">

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Total Notes"
            value={stats?.total ?? 0}
            gradient="linear-gradient(135deg, #a855f7, #7c3aed)"
            glow="rgba(168,85,247,0.3)"
          />
          <StatCard
            icon={<Pin className="h-5 w-5" />}
            label="Pinned"
            value={stats?.pinned ?? 0}
            gradient="linear-gradient(135deg, #3b82f6, #06b6d4)"
            glow="rgba(59,130,246,0.3)"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Top Tag"
            value={stats?.topTags?.[0]?.tag ?? "—"}
            gradient="linear-gradient(135deg, #ec4899, #f43f5e)"
            glow="rgba(236,72,153,0.3)"
          />
        </motion.div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "white" }}>
              My Notes
            </h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              {stats?.total === 1 ? "1 note" : `${stats?.total ?? 0} notes`} in your collection
            </p>
          </div>

          {/* Tag pills */}
          {stats?.topTags && stats.topTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <TagIcon className="h-4 w-4" style={{ color: "rgba(255,255,255,0.35)" }} />
              {stats.topTags.slice(0, 5).map((tagData) => (
                <button
                  key={tagData.tag}
                  onClick={() => handleTagToggle(tagData.tag)}
                  className="px-3 py-1 rounded-full text-sm font-medium transition-all"
                  style={selectedTag === tagData.tag
                    ? { background: "rgba(168,85,247,0.35)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.5)" }
                    : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {tagData.tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search & filter bar */}
        <div
          className="flex flex-col sm:flex-row gap-3 items-center p-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
        >
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(255,255,255,0.35)" }} />
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={handleSearchChange}
              className="pl-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/30"
              style={{ background: "transparent" }}
            />
          </div>
          <div className="h-5 w-px hidden sm:block" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => { setShowPinnedOnly(!showPinnedOnly); setPage(1); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={showPinnedOnly
                ? { background: "rgba(59,130,246,0.25)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.4)" }
                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Pin className="h-3.5 w-3.5" /> Pinned
            </button>
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setSelectedTag(undefined); setShowPinnedOnly(false); setPage(1); }}
                className="px-4 py-2 rounded-full text-sm transition-all"
                style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Notes grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: "rgba(168,85,247,0.7)" }} />
            </div>
          ) : noteResponse?.notes.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-64 text-center space-y-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(168,85,247,0.15)" }}
              >
                <Search className="h-7 w-7" style={{ color: "#c084fc" }} />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">No notes found</p>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {hasFilters
                    ? "Try adjusting your search or filters."
                    : "You haven't written any notes yet."}
                </p>
                {!hasFilters && (
                  <Link href="/notes/new">
                    <button
                      className="mt-4 px-6 py-2 rounded-full text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 0 18px rgba(168,85,247,0.35)" }}
                    >
                      Write your first note
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {noteResponse?.notes.map((note, idx) => (
                <NoteCard key={note.id} note={note} index={idx} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {noteResponse && noteResponse.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="h-9 w-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Page {page} of {noteResponse.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(noteResponse.totalPages, p + 1))}
              disabled={page === noteResponse.totalPages || isLoading}
              className="h-9 w-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({
  icon, label, value, gradient, glow,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  glow: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-4 p-4 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0"
        style={{ background: gradient, boxShadow: `0 6px 18px ${glow}` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
      </div>
    </motion.div>
  );
}
