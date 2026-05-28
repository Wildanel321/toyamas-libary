import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { streamPdf } from "@/lib/drive.server";

async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  // Accept token from Authorization header or ?token= query (iframe-friendly)
  const authHeader = request.headers.get("authorization") ?? "";
  let token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!token) {
    const url = new URL(request.url);
    token = url.searchParams.get("token") ?? "";
  }
  if (!token) return null;

  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export const Route = createFileRoute("/api/public/pdf/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { data: book, error } = await supabaseAdmin
          .from("books")
          .select("drive_file_id,title")
          .eq("id", params.id)
          .maybeSingle();
        if (error || !book) return new Response("Not found", { status: 404 });

        const upstream = await streamPdf(book.drive_file_id);
        if (!upstream.ok) {
          return new Response("Upstream error", { status: 502 });
        }
        const headers = new Headers();
        headers.set("Content-Type", "application/pdf");
        headers.set("Cache-Control", "private, no-store");
        headers.set(
          "Content-Disposition",
          `inline; filename="${book.title.replace(/"/g, "")}.pdf"`,
        );
        const len = upstream.headers.get("content-length");
        if (len) headers.set("Content-Length", len);
        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});
