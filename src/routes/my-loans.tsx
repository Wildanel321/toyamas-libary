import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { BookOpen } from "lucide-react";
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="font-display text-5xl">Pinjaman Saya</h1>
        <p className="mt-2 text-muted-foreground">Daftar buku yang sedang Anda pinjam dan riwayat.</p>
        <div className="mt-10 space-y-4">
          {loans.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Belum ada peminjaman. <Link to="/browse" className="text-secondary underline">Jelajahi katalog</Link>.</p>
            </div>
          ) : loans.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-border/60 bg-card p-4 shadow-soft">
              <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-spine">
                {l.book?.cover_url ? <img src={l.book.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-primary-foreground"><BookOpen className="h-5 w-5" /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl">{l.book?.title}</h3>
                {l.book?.author && <p className="text-sm text-muted-foreground">{l.book.author}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  Dipinjam {new Date(l.borrowed_at).toLocaleDateString("id-ID")} · Tenggat {new Date(l.due_at).toLocaleDateString("id-ID")}
                  {l.returned_at && ` · Dikembalikan ${new Date(l.returned_at).toLocaleDateString("id-ID")}`}
                </p>
              </div>
              <div className="flex gap-2">
                {l.book && <Button asChild size="sm" variant="outline"><Link to="/read/$id" params={{ id: l.book.id }}>Baca</Link></Button>}
                {!l.returned_at && (
                  <Button size="sm" onClick={async () => {
                    try { await doReturn({ data: { loanId: l.id } }); toast.success("Buku dikembalikan"); refetch(); }
                    catch (e) { toast.error((e as Error).message); }
                  }}>Kembalikan</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
