import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { listPdfsInFolder } from "./drive.server";

// PUBLIC: list books
export const listBooks = createServerFn({ method: "GET" })
  .inputValidator((input: { search?: string; category?: string } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from("books")
      .select("id,title,author,description,category,cover_url,created_at,drive_file_id")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data.category) query = query.eq("category", data.category);
    if (data.search) {
      const s = data.search.replace(/[%_]/g, "");
      query = query.or(`title.ilike.%${s}%,author.ilike.%${s}%,description.ilike.%${s}%`);
    }
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { books: rows ?? [] };
  });

export const getBook = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: book, error } = await supabaseAdmin
      .from("books")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { book };
  });

// AUTH: borrow / return
export const borrowBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { bookId: string }) => z.object({ bookId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // prevent duplicate active loan
    const { data: existing } = await supabase
      .from("loans")
      .select("id")
      .eq("user_id", userId)
      .eq("book_id", data.bookId)
      .is("returned_at", null)
      .maybeSingle();
    if (existing) return { ok: true, alreadyBorrowed: true };
    const { error } = await supabase.from("loans").insert({ user_id: userId, book_id: data.bookId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const returnBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { loanId: string }) => z.object({ loanId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("loans")
      .update({ returned_at: new Date().toISOString() })
      .eq("id", data.loanId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const myLoans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("loans")
      .select("id,borrowed_at,due_at,returned_at,book:books(id,title,author,cover_url)")
      .eq("user_id", userId)
      .order("borrowed_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { loans: data ?? [] };
  });

// ADMIN
export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin only");
}

export const syncDriveBooks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { folderId?: string } | undefined) =>
    z.object({ folderId: z.string().min(1).max(200).optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const files = await listPdfsInFolder(data.folderId);
    let added = 0;
    for (const f of files) {
      const title = f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").trim();
      const { error } = await supabaseAdmin.from("books").upsert(
        {
          drive_file_id: f.id,
          title,
          description: f.description ?? null,
          cover_url: f.thumbnailLink ?? null,
          size_bytes: f.size ? Number(f.size) : null,
          added_by: context.userId,
        },
        { onConflict: "drive_file_id", ignoreDuplicates: false },
      );
      if (!error) added++;
    }
    return { ok: true, scanned: files.length, added };
  });

export const updateBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; title: string; author?: string; description?: string; category?: string }) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(300),
        author: z.string().max(200).optional(),
        description: z.string().max(4000).optional(),
        category: z.string().max(100).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("books")
      .update({
        title: data.title,
        author: data.author ?? null,
        description: data.description ?? null,
        category: data.category ?? null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("books").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const [{ count: bookCount }, { count: userCount }, { count: activeLoans }] = await Promise.all([
      supabaseAdmin.from("books").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("loans").select("*", { count: "exact", head: true }).is("returned_at", null),
    ]);
    return { bookCount: bookCount ?? 0, userCount: userCount ?? 0, activeLoans: activeLoans ?? 0 };
  });
