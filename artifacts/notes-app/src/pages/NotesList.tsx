import { useState, useMemo } from "react";
import { useListNotes, getListNotesQueryKey, useGetNoteStats } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteCard } from "@/components/NoteCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ArrowLeft, ArrowRight, Tag as TagIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { motion } from "framer-motion";

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
    pinned: showPinnedOnly || undefined
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(undefined);
    } else {
      setSelectedTag(tag);
    }
    setPage(1);
  };

  const hasFilters = debouncedSearch || selectedTag || showPinnedOnly;

  return (
    <AppLayout>
      <div className="flex flex-col space-y-8">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">My Notes</h1>
            <p className="text-muted-foreground">
              {stats?.total === 1 ? '1 note' : `${stats?.total || 0} notes`} in your collection.
            </p>
          </div>
          
          {/* Top Tags Quick Filter */}
          {stats?.topTags && stats.topTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <TagIcon className="h-4 w-4 text-muted-foreground mr-1" />
              {stats.topTags.slice(0, 5).map((tagData) => (
                <Badge 
                  key={tagData.tag}
                  variant={selectedTag === tagData.tag ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1 text-sm font-medium"
                  onClick={() => handleTagToggle(tagData.tag)}
                >
                  {tagData.tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-2 rounded-lg border shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search notes..." 
              value={search}
              onChange={handleSearchChange}
              className="pl-9 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="h-6 w-px bg-border hidden sm:block mx-2" />
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={showPinnedOnly ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setShowPinnedOnly(!showPinnedOnly);
                setPage(1);
              }}
              className="rounded-full shrink-0"
            >
              Pinned Only
            </Button>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedTag(undefined);
                  setShowPinnedOnly(false);
                  setPage(1);
                }}
                className="text-muted-foreground shrink-0 rounded-full"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Notes Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
          ) : noteResponse?.notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 bg-card/50 rounded-xl border border-dashed">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <Search className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-medium">No notes found</p>
                <p className="text-muted-foreground max-w-sm">
                  {hasFilters ? "Try adjusting your search or filters." : "You haven't written any notes yet. Time to start writing!"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {noteResponse?.notes.map((note, idx) => (
                <NoteCard key={note.id} note={note} index={idx} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {noteResponse && noteResponse.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Page {page} of {noteResponse.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.min(noteResponse.totalPages, p + 1))}
              disabled={page === noteResponse.totalPages || isLoading}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
