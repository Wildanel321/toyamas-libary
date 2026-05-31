import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { getBook } from "@/lib/books.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/read/$id")({
  head: ({ params }) => ({
    meta: [
      { title: "Membaca Buku — Toyamas Library" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      { rel: "canonical", href: `/book/${params.id}` },
    ],
  }),
  component: Reader,
});

function Reader() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fetchBook = useServerFn(getBook);
  const { data } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBook({ data: { id } }),
  });
  const book = data?.book;

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setToken(data.session?.access_token ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [user, loading, navigate]);

  const pdfUrl = token
    ? `/api/public/pdf/${id}?token=${encodeURIComponent(token)}`
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Reader Toolbar */}
      <div
        className="glass border-b"
        style={{ borderBottom: "1px solid oklch(0.28 0.025 255 / 0.3)" }}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/book/$id"
            params={{ id }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-lg group-hover:bg-white/10 transition-all"
              style={{ border: "1px solid oklch(0.28 0.025 255 / 0.4)" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
            {book?.title ?? "Kembali"}
          </Link>

          {book && (
            <div className="hidden md:flex items-center gap-2">
              <span className="badge-pill badge-primary">{book.category ?? "Buku"}</span>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <main className="flex-1" style={{ background: "oklch(0.08 0.012 260)" }}>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={book?.title ?? "PDF Reader"}
            className="block h-[calc(100vh-8rem)] w-full border-0"
          />
        ) : (
          <div className="grid h-[calc(100vh-8rem)] place-items-center text-muted-foreground">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin mb-3 text-primary" />
              <span className="text-sm">Memuat pembaca...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
