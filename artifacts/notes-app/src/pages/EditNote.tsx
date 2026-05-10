import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useGetNote, useUpdateNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { ArrowLeft, Save, X, Pin, Loader2, CheckCircle2 } from "lucide-react";

export function EditNote() {
  const [, params] = useRoute("/notes/:id/edit");
  const noteId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateNote = useUpdateNote();

  const { data: note, isLoading: isLoadingNote } = useGetNote(noteId, {
    query: { enabled: !!noteId, queryKey: ['/api/notes', noteId] as const }
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

  // Initialize state once when note loads
  useEffect(() => {
    if (note && initializedRef.current !== note.id) {
      initializedRef.current = note.id;
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setIsPinned(note.isPinned);
      lastSavedRef.current = {
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        isPinned: note.isPinned
      };
    }
  }, [note]);

  // Debounced auto-save triggers
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  const mutateFnRef = useRef(updateNote.mutate);
  mutateFnRef.current = updateNote.mutate;

  // Auto-save effect
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
        { 
          id: noteId, 
          data: { title: debouncedTitle, content: debouncedContent, tags, isPinned } 
        },
        {
          onSuccess: (updatedData) => {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
            
            lastSavedRef.current = {
              title: updatedData.title,
              content: updatedData.content,
              tags: updatedData.tags || [],
              isPinned: updatedData.isPinned
            };
            
            // Patch cache gently instead of full invalidate
            queryClient.setQueryData(['/api/notes', noteId] as const, updatedData);
            queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          },
          onError: () => {
            setSaveStatus("idle");
            toast({ title: "Auto-save failed", variant: "destructive" });
          }
        }
      );
    }
  }, [debouncedTitle, debouncedContent, tags, isPinned, noteId, queryClient, toast]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

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
          queryClient.setQueryData(['/api/notes', noteId] as const, updated);
          toast({ title: "Changes saved" });
          setLocation(`/notes/${noteId}`);
        },
        onError: () => {
          setIsSaving(false);
          toast({ title: "Failed to save changes", variant: "destructive" });
        }
      }
    );
  };

  if (isLoadingNote) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
            <Link href={`/notes/${noteId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel Edit
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden sm:flex items-center mr-2">
              {saveStatus === "saving" && <><Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Saving...</>}
              {saveStatus === "saved" && <><CheckCircle2 className="h-3 w-3 text-green-500 mr-1.5" /> Saved</>}
            </div>
            <div className="flex items-center space-x-2 mr-2">
              <Switch id="pin-mode" checked={isPinned} onCheckedChange={setIsPinned} />
              <Label htmlFor="pin-mode" className="flex items-center gap-1.5 cursor-pointer">
                <Pin className={`h-4 w-4 ${isPinned ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                <span className="sr-only sm:not-sr-only">Pinned</span>
              </Label>
            </div>
            <Button onClick={handleManualSave} disabled={isSaving || !title.trim()}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
              Done
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 transition-shadow">
          <div className="p-6 md:p-8 space-y-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="text-3xl md:text-4xl font-serif font-bold border-0 px-0 h-auto rounded-none focus-visible:ring-0 placeholder:text-muted-foreground/50 bg-transparent"
            />
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center min-h-[2.5rem]">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-destructive focus:outline-none rounded-full p-0.5 hover:bg-primary/20">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <div className="relative flex-1 min-w-[120px] max-w-[200px]">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={tags.length === 0 ? "Add tags..." : "Add another..."}
                    className="h-8 text-sm border-dashed bg-muted/30 focus-visible:ring-1"
                  />
                </div>
              </div>
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-[500px] text-lg resize-none border-0 px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50 leading-relaxed"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
