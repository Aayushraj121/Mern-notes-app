import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, notesTable } from "@workspace/db";
import { eq, and, ilike, or, desc, sql } from "drizzle-orm";
import {
  ListNotesQueryParams,
  CreateNoteBody,
  GetNoteParams,
  UpdateNoteParams,
  UpdateNoteBody,
  DeleteNoteParams,
  TogglePinParams,
  AdminListNotesQueryParams,
  AdminDeleteNoteParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.clerkUserId = userId;
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const role = (auth?.sessionClaims as any)?.metadata?.role;
  if (role !== "admin") {
    res.status(403).json({ error: "Forbidden: admin only" });
    return;
  }
  next();
}

router.get("/notes/stats", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.clerkUserId;

  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notesTable)
    .where(eq(notesTable.userId, userId));

  const [pinnedRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notesTable)
    .where(and(eq(notesTable.userId, userId), eq(notesTable.isPinned, true)));

  const allNotes = await db
    .select({ tags: notesTable.tags })
    .from(notesTable)
    .where(eq(notesTable.userId, userId));

  const tagMap: Record<string, number> = {};
  for (const note of allNotes) {
    for (const tag of note.tags ?? []) {
      tagMap[tag] = (tagMap[tag] ?? 0) + 1;
    }
  }

  const topTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [recentRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notesTable)
    .where(and(eq(notesTable.userId, userId), sql`${notesTable.createdAt} > ${oneDayAgo}`));

  res.json({
    total: totalRow?.count ?? 0,
    pinned: pinnedRow?.count ?? 0,
    totalTags: Object.keys(tagMap).length,
    recentCount: recentRow?.count ?? 0,
    topTags,
  });
});

router.get("/notes", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.clerkUserId;
  const parsed = ListNotesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, page = 1, limit = 12, tag, pinned } = parsed.data;

  const conditions = [eq(notesTable.userId, userId)];

  if (search) {
    conditions.push(
      or(
        ilike(notesTable.title, `%${search}%`),
        ilike(notesTable.content, `%${search}%`),
      )!,
    );
  }

  if (pinned !== undefined) {
    conditions.push(eq(notesTable.isPinned, pinned));
  }

  if (tag) {
    conditions.push(sql`${notesTable.tags} @> ARRAY[${tag}]::text[]`);
  }

  const where = and(...conditions);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(notesTable)
    .where(where);

  const notes = await db
    .select()
    .from(notesTable)
    .where(where)
    .orderBy(desc(notesTable.isPinned), desc(notesTable.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  res.json({
    notes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/notes", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.clerkUserId;
  const auth = getAuth(req);
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userEmail = (auth?.sessionClaims as any)?.email as string | undefined;
  const userFirstName = (auth?.sessionClaims as any)?.first_name as string | undefined;

  const [note] = await db
    .insert(notesTable)
    .values({
      ...parsed.data,
      userId,
      userEmail: userEmail ?? null,
      userFirstName: userFirstName ?? null,
    })
    .returning();

  res.status(201).json(note);
});

router.get("/notes/:id", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.clerkUserId;
  const params = GetNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [note] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.id));

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const auth = getAuth(req);
  const role = (auth?.sessionClaims as any)?.metadata?.role;
  if (note.userId !== userId && role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(note);
});

router.patch("/notes/:id", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.clerkUserId;
  const params = UpdateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateNoteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  if (existing.userId !== userId) {
    res.status(403).json({ error: "Forbidden: only the owner can edit this note" });
    return;
  }

  const [updated] = await db
    .update(notesTable)
    .set(body.data)
    .where(eq(notesTable.id, params.data.id))
    .returning();

  res.json(updated);
});

router.delete("/notes/:id", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.clerkUserId;
  const params = DeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const auth = getAuth(req);
  const role = (auth?.sessionClaims as any)?.metadata?.role;
  if (existing.userId !== userId && role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(notesTable).where(eq(notesTable.id, params.data.id));
  res.sendStatus(204);
});

router.patch("/notes/:id/pin", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.clerkUserId;
  const params = TogglePinParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  if (existing.userId !== userId) {
    res.status(403).json({ error: "Forbidden: only the owner can pin this note" });
    return;
  }

  const [updated] = await db
    .update(notesTable)
    .set({ isPinned: !existing.isPinned })
    .where(eq(notesTable.id, params.data.id))
    .returning();

  res.json(updated);
});

router.get("/admin/notes", requireAuth, requireAdmin, async (req: any, res): Promise<void> => {
  const parsed = AdminListNotesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, page = 1, limit = 20, userId: filterUserId } = parsed.data;

  const conditions: any[] = [];

  if (filterUserId) {
    conditions.push(eq(notesTable.userId, filterUserId));
  }

  if (search) {
    conditions.push(
      or(
        ilike(notesTable.title, `%${search}%`),
        ilike(notesTable.content, `%${search}%`),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(notesTable)
    .where(where);

  const notes = await db
    .select()
    .from(notesTable)
    .where(where)
    .orderBy(desc(notesTable.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  res.json({
    notes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.delete("/admin/notes/:id", requireAuth, requireAdmin, async (req: any, res): Promise<void> => {
  const params = AdminDeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  await db.delete(notesTable).where(eq(notesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
