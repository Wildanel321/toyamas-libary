import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { BookOpen, Clock, BookMarked, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { myLoans, returnBook } from "@/lib/books.functions";

export const Route = createFileRoute("/my-loans")({
  head: () => ({ meta: [{ title: "Pinjaman Saya — Toyamas Library" }] }),
  component: MyLoans,
});

function MyLoans() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  const fetchLoans = useServerFn(myLoans);
  const doReturn = useServerFn(returnBook);
  const { data, refetch } = useQuery({
    queryKey: ["my-loans"],
    queryFn: () => fetchLoans(),
    enabled: !!user,
  });

  const loans = data?.loans ?? [];
  const activeLoans = loans.filter((l) => !l.returned_at);
  const returnedLoans = loans.filter((l) => l.returned_at);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Page Header */}
      <div
        className="relative overflow-hidden py-14 border-b"
        style={{ borderColor: "oklch(0.28 0.025 255 / 0.3)" }}
      >
        <div className="orb orb-1" style={{ opacity: 0.4 }} />
        <div className="orb orb-2" style={{ opacity: 0.3 }} />
        <div className="container relative mx-auto px-4">
          <div className="section-label">
            <BookMarked className="h-3 w-3" /> Aktivitas Saya
          </div>
          <h1 className="font-display text-5xl text-foreground">Pinjaman Saya</h1>
          <p className="mt-2 text-muted-foreground">Daftar buku yang sedang Anda pinjam dan riwayat peminjaman.</p>

          {loans.length > 0 && (
            <div className="mt-6 flex gap-4">
              <div className="stat-card px-5 py-3 text-left flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-lg grid place-items-center flex-shrink-0"
                  style={{ background: "oklch(0.72 0.20 265 / 0.15)", border: "1px solid oklch(0.72 0.20 265 / 0.25)" }}
                >
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="stat-number text-2xl">{activeLoans.length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Aktif</div>
                </div>
              </div>
              <div className="stat-card px-5 py-3 text-left flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-lg grid place-items-center flex-shrink-0"
                  style={{ background: "oklch(0.60 0.25 185 / 0.12)", border: "1px solid oklch(0.60 0.25 185 / 0.25)" }}
                >
                  <Clock className="h-4 w-4" style={{ color: "oklch(0.75 0.20 185)" }} />
                </div>
                <div>
                  <div className="stat-number text-2xl">{returnedLoans.length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Dikembalikan</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-10">
        {loans.length === 0 ? (
          <div
            className="glass-card p-20 text-center max-w-md mx-auto"
            style={{ border: "1px dashed oklch(0.30 0.025 255 / 0.4)" }}
          >
            <div
              className="mx-auto mb-4 h-16 w-16 rounded-2xl grid place-items-center"
              style={{ background: "oklch(0.72 0.20 265 / 0.1)", border: "1px solid oklch(0.72 0.20 265 / 0.2)" }}
            >
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Belum ada peminjaman</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Anda belum meminjam buku apapun.{" "}
            </p>
            <Link
              to="/browse"
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium text-white"
            >
              <BookOpen className="h-4 w-4" /> Jelajahi Katalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((l) => {
              const isOverdue = !l.returned_at && new Date(l.due_at) < new Date();
              return (
                <div
                  key={l.id}
                  className="glass-card flex flex-wrap items-center gap-4 p-4"
                  style={{
                    borderColor: isOverdue
                      ? "oklch(0.58 0.22 27 / 0.3)"
                      : l.returned_at
                      ? "oklch(0.28 0.025 255 / 0.35)"
                      : "oklch(0.28 0.025 255 / 0.35)",
                  }}
                >
                  {/* Book Cover Thumbnail */}
                  <div
                    className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg"
                    style={{ boxShadow: "0 4px 16px oklch(0 0 0 / 0.4)" }}
                  >
                    {l.book?.cover_url ? (
                      <img src={l.book.cover_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div
                        className="grid h-full place-items-center"
                        style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 265), oklch(0.65 0.22 320))" }}
                      >
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-xl text-foreground">{l.book?.title}</h3>
                      {l.returned_at ? (
                        <span className="badge-pill badge-cyan text-xs">Dikembalikan</span>
                      ) : isOverdue ? (
                        <span className="badge-pill text-xs" style={{ background: "oklch(0.58 0.22 27 / 0.15)", border: "1px solid oklch(0.58 0.22 27 / 0.3)", color: "oklch(0.72 0.20 27)" }}>
                          Terlambat
                        </span>
                      ) : (
                        <span className="badge-pill badge-primary text-xs">Aktif</span>
                      )}
                    </div>
                    {l.book?.author && (
                      <p className="text-sm text-muted-foreground">{l.book.author}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Dipinjam {new Date(l.borrowed_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}
                      <span className={isOverdue && !l.returned_at ? "text-destructive" : ""}>
                        Tenggat {new Date(l.due_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      {l.returned_at && (
                        <> · Dikembalikan {new Date(l.returned_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {l.book && (
                      <Button asChild size="sm" className="btn-primary rounded-lg text-white font-medium">
                        <Link to="/read/$id" params={{ id: l.book.id }}>
                          <BookOpen className="h-3.5 w-3.5" /> Baca
                        </Link>
                      </Button>
                    )}
                    {!l.returned_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-white/15 hover:border-white/30 hover:bg-white/8 text-muted-foreground hover:text-foreground"
                        onClick={async () => {
                          try { await doReturn({ data: { loanId: l.id } }); toast.success("Buku dikembalikan"); refetch(); }
                          catch (e) { toast.error((e as Error).message); }
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Kembalikan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
