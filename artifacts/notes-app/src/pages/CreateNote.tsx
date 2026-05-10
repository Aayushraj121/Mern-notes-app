import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateNote, getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, X, Plus, Pin } from "lucide-react";
import { Link } from "wouter";

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
          toast({ title: "Note created successfully" });
          setLocation(`/notes/${newNote.id}`);
        },
        onError: (err) => {
          toast({ title: "Failed to create note", description: String(err), variant: "destructive" });
        }
      }
    );
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground">
            <Link href="/notes">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 mr-4">
              <Switch id="pin-mode" checked={isPinned} onCheckedChange={setIsPinned} />
              <Label htmlFor="pin-mode" className="flex items-center gap-1.5 cursor-pointer">
                <Pin className={`h-4 w-4 ${isPinned ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                Pinned
              </Label>
            </div>
            <Button onClick={handleSave} disabled={createNote.isPending || !title.trim()}>
              <Save className="mr-2 h-4 w-4" /> Save Note
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="text-3xl md:text-4xl font-serif font-bold border-0 px-0 h-auto rounded-none focus-visible:ring-0 placeholder:text-muted-foreground/50 bg-transparent"
              autoFocus
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
                    placeholder={tags.length === 0 ? "Add tags (press Enter)..." : "Add another..."}
                    className="h-8 text-sm border-dashed bg-muted/30 focus-visible:ring-1"
                  />
                </div>
              </div>
            </div>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className="min-h-[400px] text-lg resize-none border-0 px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50 leading-relaxed"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
