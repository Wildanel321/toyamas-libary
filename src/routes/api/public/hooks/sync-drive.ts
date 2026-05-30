import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { listPdfsInFolder } from "@/lib/drive.server";

// Public hook called by pg_cron to keep the catalog in sync with Google Drive.
// Idempotent: upserts on drive_file_id, returns no PII.
async function runSync() {
  const files = await listPdfsInFolder();

  const ids = files.map((f) => f.id);
  const { data: existingRows } = await supabaseAdmin
    .from("books")
    .select("drive_file_id")
    .in("drive_file_id", ids.length ? ids : ["__none__"]);
  const existing = new Set((existingRows ?? []).map((r) => r.drive_file_id));

  let added = 0;
  let updated = 0;
  let failed = 0;

  for (const f of files) {
    const title = f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").trim();
    const isNew = !existing.has(f.id);
    const { error } = await supabaseAdmin.from("books").upsert(
      {
        drive_file_id: f.id,
        title,
        description: f.description ?? null,
        cover_url: f.thumbnailLink ?? null,
        size_bytes: f.size ? Number(f.size) : null,
      },
      { onConflict: "drive_file_id", ignoreDuplicates: false },
    );
    if (error) failed++;
    else if (isNew) added++;
    else updated++;
  }

  return { scanned: files.length, added, updated, failed };
}

export const Route = createFileRoute("/api/public/hooks/sync-drive")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const result = await runSync();
          return Response.json({ ok: true, ...result });
        } catch (e) {
          console.error("Auto-sync failed:", e);
          return Response.json(
            { ok: false, error: (e as Error).message },
            { status: 500 },
          );
        }
      },
      GET: async () => {
        try {
          const result = await runSync();
          return Response.json({ ok: true, ...result });
        } catch (e) {
          console.error("Auto-sync failed:", e);
          return Response.json(
            { ok: false, error: (e as Error).message },
            { status: 500 },
          );
        }
      },
    },
  },
});
